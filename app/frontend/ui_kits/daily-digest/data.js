/* Sample digest data shaped exactly like the pipeline's items.json
   (schema.py Item). Pre-ranked by score desc. */
window.DD_ITEMS = (function () {
  const now = Math.floor(Date.now() / 1000);
  const h = 3600, d = 86400;
  return [
    {
      id: 'a1', kind: 'paper', source: 'arXiv', domain: 'ai', score: 11.6, status: 'new',
      title: 'Sparse Mixture-of-Experts Scaling Laws for Small Language Models',
      url: '#', author: 'Chen, Rao, Iyer', published_ts: now - 2 * h,
      raw_text: 'We study how routing sparsity interacts with parameter count in sub-3B models. A compute-matched MoE SLM matches a dense 7B on reasoning benchmarks while halving inference cost, suggesting a practical path for on-device assistants.',
      tags: ['SLM', 'mixture-of-experts', 'scaling'],
    },
    {
      id: 'a2', kind: 'repo', source: 'GitHub', domain: 'tech', score: 10.4, status: 'new',
      title: 'langchain-ai/langgraph', url: '#', author: '14.2k★ · +320 this week', published_ts: now - 6 * h,
      raw_text: 'Build resilient, stateful multi-actor applications with LLMs. Adds durable execution, human-in-the-loop checkpoints, and streaming for agent graphs.',
      tags: ['langgraph', 'agents', 'python'],
    },
    {
      id: 'a3', kind: 'youtube', source: 'Andrej Karpathy', domain: 'ai', score: 9.8, status: 'new',
      title: 'Let\u2019s build the GPT tokenizer, from scratch',
      url: '#', author: '2h 13m', published_ts: now - 14 * h,
      raw_text: 'A careful, code-first walk through byte-pair encoding: why tokenizers exist, how they shape model behavior, and the subtle bugs they introduce in arithmetic and non-English text.',
      tags: ['transformers', 'tokenization', 'LLM'],
    },
    {
      id: 'a4', kind: 'opportunity', source: 'Amazon Jobs', domain: 'tech', score: 9.5, status: 'saved',
      title: 'SDE Intern \u2014 Search & Relevance (Bengaluru)',
      url: '#', author: 'Deadline Jul 12 \u00b7 India', published_ts: now - 20 * h,
      raw_text: 'Summer internship building ranking and retrieval systems. New-grad eligible, India-based, no visa sponsorship required. Strong fit for full-stack + ML interests.',
      tags: ['intern', 'SDE', 'India'],
    },
    {
      id: 'a5', kind: 'news', source: 'Hacker News', domain: 'ai', score: 8.7, status: 'new',
      title: 'Anthropic ships extended context tooling for long-running agents',
      url: '#', author: '412 points', published_ts: now - 26 * h,
      raw_text: 'Discussion centers on memory compaction and how teams keep agents coherent across hour-long tasks without blowing the context budget.',
      tags: ['Anthropic', 'agents', 'context'],
    },
    {
      id: 'a6', kind: 'paper', source: 'Semantic Scholar', domain: 'healthtech', score: 7.9, status: 'read',
      title: 'Retrieval-Augmented Clinical Note Summarization with Guardrails',
      url: '#', author: 'NADimpalli et al.', published_ts: now - 2 * d,
      raw_text: 'A RAG pipeline over EHR notes with citation-grounded outputs and abstention. Reduces hallucinated medications versus a fine-tuned baseline on two hospital datasets.',
      tags: ['RAG', 'clinical', 'safety'],
    },
    {
      id: 'a7', kind: 'repo', source: 'GitHub', domain: 'tech', score: 7.2, status: 'new',
      title: 'fastapi/fastapi', url: '#', author: '78k★', published_ts: now - 3 * d,
      raw_text: 'Modern, fast web framework for building APIs with Python type hints. New release improves dependency caching and OpenAPI 3.1 output.',
      tags: ['fastapi', 'python', 'api'],
    },
    {
      id: 'a8', kind: 'youtube', source: '3Blue1Brown', domain: 'ai', score: 6.6, status: 'new',
      title: 'But what is a GPU, really? Parallelism from first principles',
      url: '#', author: '24m', published_ts: now - 4 * d,
      raw_text: 'A visual tour of SIMD, memory bandwidth, and why matrix multiplication is the workhorse of deep learning.',
      tags: ['hardware', 'intuition'],
    },
    {
      id: 'a9', kind: 'opportunity', source: 'Devpost', domain: 'tech', score: 6.1, status: 'new',
      title: 'Google Cloud Rapid Agent Hackathon \u2014 online',
      url: '#', author: 'Deadline Jun 30 \u00b7 Remote', published_ts: now - 5 * d,
      raw_text: 'Build an autonomous agent on Vertex AI in 10 days. Remote, open to students worldwide. Prizes include cloud credits and mentorship.',
      tags: ['hackathon', 'agents', 'remote'],
    },
    {
      id: 'a10', kind: 'paper', source: 'arXiv', domain: 'fintech', score: 5.4, status: 'new',
      title: 'Transformer Forecasting of Volatile Order-Book Dynamics',
      url: '#', author: 'Okafor, Singh', published_ts: now - 6 * d,
      raw_text: 'Applies a lightweight temporal transformer to limit-order-book microstructure, showing modest gains over GRU baselines for short-horizon prediction.',
      tags: ['transformers', 'forecasting'],
    },
    {
      id: 'a11', kind: 'news', source: 'Interconnects', domain: 'ai', score: 4.8, status: 'saved',
      title: 'The quiet standardization of evals',
      url: '#', author: 'Nathan Lambert', published_ts: now - 7 * d,
      raw_text: 'Why shared evaluation harnesses are becoming the real moat, and what that means for small teams shipping fine-tunes.',
      tags: ['evals', 'RLHF'],
    },
    {
      id: 'a12', kind: 'repo', source: 'GitHub', domain: 'agrotech', score: 3.9, status: 'new',
      title: 'open-agro/leaf-vision', url: '#', author: '1.1k★', published_ts: now - 9 * d,
      raw_text: 'On-device crop-disease classification with a quantized vision model, packaged for low-end Android phones used by smallholder farmers.',
      tags: ['VLM', 'edge', 'agriculture'],
    },
  ];
})();
