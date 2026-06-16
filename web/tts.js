/* Listen-aloud controller. Prefers the baked neural Indian-voice MP3 (item.audio,
   produced by scripts/audio.py) for a warm, natural read with real play/pause/seek.
   Falls back to the browser SpeechSynthesis API when an item has no audio file or
   the file fails to load (e.g. an older weekly/saved item whose MP3 was purged).
   Zero deps, offline-friendly, free. */
(function () {
  const synth = window.speechSynthesis;
  const speechOK = !!synth && typeof window.SpeechSynthesisUtterance === 'function';
  const listeners = new Set();
  let state = { mode: null, playing: false, id: null, t: 0, d: 0 };
  let audio = null;          // active HTMLAudioElement (mp3 mode)

  function set(next) { state = Object.assign({}, state, next); listeners.forEach((f) => f(state)); }

  // Pick the best Indian-English / Indian voice the browser offers for fallback TTS.
  function pickVoice() {
    if (!speechOK) return null;
    const v = synth.getVoices() || [];
    return v.find((x) => x.lang === 'en-IN')
      || v.find((x) => /en[-_]IN/i.test(x.lang))
      || v.find((x) => /\b(hi|hindi|india)\b/i.test(x.name))
      || v.find((x) => x.lang && x.lang.startsWith('en'))
      || null;
  }

  function stopAll() {
    if (audio) { audio.pause(); audio.src = ''; audio = null; }
    if (speechOK) synth.cancel();
  }

  function playAudio(id, src) {
    stopAll();
    audio = new Audio(src);
    audio.preload = 'auto';
    audio.onloadedmetadata = () => set({ d: audio.duration || 0 });
    audio.ontimeupdate = () => set({ t: audio.currentTime || 0, d: audio.duration || state.d });
    audio.onended = () => set({ mode: null, playing: false, id: null, t: 0 });
    audio.onerror = () => {                 // file missing/blocked -> browser TTS
      audio = null;
      if (state._fallbackText) speakBrowser(id, state._fallbackText);
      else set({ mode: null, playing: false, id: null });
    };
    set({ mode: 'audio', playing: true, id, t: 0, d: 0 });
    audio.play().catch(() => { if (audio) audio.onerror(); });
  }

  function speakBrowser(id, text) {
    if (!speechOK || !text) { set({ mode: null, playing: false, id: null }); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.lang = (voice && voice.lang) || 'en-IN';
    u.rate = 0.98; u.pitch = 1.0;
    u.onend = () => set({ mode: null, playing: false, id: null });
    u.onerror = () => set({ mode: null, playing: false, id: null });
    set({ mode: 'speech', playing: true, id, t: 0, d: 0 });
    synth.speak(u);
  }

  // Start playing item `it`: mp3 if present, else browser speech of `text`.
  function play(it, text) {
    state._fallbackText = text;
    if (it && it.audio) playAudio(it.id, it.audio);
    else speakBrowser(it && it.id, text);
  }

  function pause() {
    if (state.mode === 'audio' && audio) { audio.pause(); set({ playing: false }); }
    else if (state.mode === 'speech' && speechOK && synth.speaking && !synth.paused) { synth.pause(); set({ playing: false }); }
  }
  function resume() {
    if (state.mode === 'audio' && audio) { audio.play(); set({ playing: true }); }
    else if (state.mode === 'speech' && speechOK && synth.paused) { synth.resume(); set({ playing: true }); }
  }
  function stop() { stopAll(); set({ mode: null, playing: false, id: null, t: 0, d: 0 }); }

  function toggle(it, text) {
    if (state.id === (it && it.id) && state.mode) {
      if (state.playing) pause(); else resume();
    } else {
      play(it, text);
    }
  }
  function seek(frac) {
    if (state.mode === 'audio' && audio && audio.duration) {
      audio.currentTime = Math.max(0, Math.min(1, frac)) * audio.duration;
    }
  }

  window.DDTts = {
    supported: true,            // always: mp3 works everywhere, speech is the fallback
    speechOK,
    play, toggle, pause, resume, stop, seek,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    getState() { return state; },
  };

  // Some browsers populate voices asynchronously.
  if (speechOK && typeof synth.onvoiceschanged !== 'undefined') {
    synth.onvoiceschanged = () => { /* warm the voice list */ pickVoice(); };
  }
  window.addEventListener('beforeunload', stop);
})();
