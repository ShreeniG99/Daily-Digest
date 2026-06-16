// Vercel serverless function — in-app YouTube channel subscriptions.
//
// The app calls this to manage config/channels.json in the repo (the user's own
// subscriptions, merged with the curated channels in sources.yaml by the YouTube
// adapter). Writes go to GitHub via the Contents API and kick off a rebuild so the
// new channel's videos appear in the next digest.
//
//   GET    /api/channels            -> { channels: [...] }
//   POST   /api/channels {channel}  -> add    (needs x-dd-key)
//   DELETE /api/channels {channel}  -> remove (needs x-dd-key)
//
// Required env (set in Vercel): GH_TOKEN (repo-write PAT), GH_REPO ("owner/name").
// Optional: GH_BRANCH (default "main"), DD_WRITE_KEY (shared secret gating writes).

const REPO = process.env.GH_REPO;
const BRANCH = process.env.GH_BRANCH || "main";
const TOKEN = process.env.GH_TOKEN;
const WRITE_KEY = process.env.DD_WRITE_KEY;
const FILE = "config/channels.json";
const GH = "https://api.github.com";

function gh(url, opts = {}) {
  return fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "daily-digest",
      ...(opts.headers || {}),
    },
  });
}

async function loadFile() {
  const r = await gh(`${GH}/repos/${REPO}/contents/${FILE}?ref=${BRANCH}`);
  if (r.status === 404) return { sha: null, channels: [] };
  if (!r.ok) throw new Error(`GitHub read ${r.status}`);
  const j = await r.json();
  const content = Buffer.from(j.content, "base64").toString("utf8");
  let channels = [];
  try { channels = (JSON.parse(content) || {}).channels || []; } catch (_) {}
  return { sha: j.sha, channels };
}

async function save(channels, sha, message) {
  const body = JSON.stringify({ channels }, null, 2) + "\n";
  const r = await gh(`${GH}/repos/${REPO}/contents/${FILE}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(body, "utf8").toString("base64"),
      sha: sha || undefined,
      branch: BRANCH,
    }),
  });
  if (!r.ok) throw new Error(`GitHub write ${r.status}: ${await r.text()}`);
}

// Best-effort rebuild so the new channel appears soon, not just next morning.
async function triggerRebuild() {
  try {
    await gh(`${GH}/repos/${REPO}/actions/workflows/digest.yml/dispatches`, {
      method: "POST",
      body: JSON.stringify({ ref: BRANCH }),
    });
  } catch (_) { /* non-fatal */ }
}

// Accept @handle, a youtube.com URL, or a UC… channel id; return a normalized handle.
function normalize(input) {
  let s = String(input || "").trim();
  if (!s) return null;
  const url = s.match(/youtube\.com\/(@[\w.-]+)/i) || s.match(/youtube\.com\/channel\/(UC[\w-]+)/i);
  if (url) s = url[1];
  if (/^UC[\w-]{20,}$/.test(s)) return s;          // raw channel id
  return "@" + s.replace(/^@/, "");                 // handle
}

async function readBody(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  return await new Promise((resolve) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => { try { resolve(JSON.parse(d)); } catch (_) { resolve(null); } });
  });
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!REPO || !TOKEN) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: "server not configured (GH_REPO / GH_TOKEN)" }));
  }
  try {
    if (req.method === "GET") {
      const { channels } = await loadFile();
      return res.end(JSON.stringify({ channels }));
    }

    if (WRITE_KEY && req.headers["x-dd-key"] !== WRITE_KEY) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: "unauthorized" }));
    }

    const body = await readBody(req);
    const ch = normalize(body && body.channel);
    if (!ch) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "missing or invalid channel" }));
    }

    const { sha, channels } = await loadFile();
    const lower = channels.map((c) => String(c).toLowerCase());

    if (req.method === "POST") {
      if (!lower.includes(ch.toLowerCase())) {
        channels.push(ch);
        await save(channels, sha, `app: subscribe ${ch}`);
        triggerRebuild();
      }
      return res.end(JSON.stringify({ channels, added: ch }));
    }

    if (req.method === "DELETE") {
      const next = channels.filter((c) => String(c).toLowerCase() !== ch.toLowerCase());
      await save(next, sha, `app: unsubscribe ${ch}`);
      return res.end(JSON.stringify({ channels: next, removed: ch }));
    }

    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "method not allowed" }));
  } catch (e) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: String((e && e.message) || e) }));
  }
};
