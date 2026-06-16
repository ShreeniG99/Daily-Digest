/* Listen-aloud controller over the browser SpeechSynthesis API. Zero deps,
   offline, free. Feature-detected: window.DDTts.supported is false where the
   browser has no speech synthesis, and the UI hides the audio bar. */
(function () {
  const synth = window.speechSynthesis;
  const supported = !!synth && typeof window.SpeechSynthesisUtterance === 'function';
  const listeners = new Set();
  let state = { speaking: false, paused: false, id: null };

  function set(next) { state = Object.assign({}, state, next); listeners.forEach((f) => f(state)); }

  function speak(id, text) {
    if (!supported || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.rate = 1.0; u.pitch = 1.0;
    u.onend = () => set({ speaking: false, paused: false, id: null });
    u.onerror = () => set({ speaking: false, paused: false, id: null });
    set({ speaking: true, paused: false, id });
    synth.speak(u);
  }
  function pause() { if (supported && synth.speaking && !synth.paused) { synth.pause(); set({ paused: true }); } }
  function resume() { if (supported && synth.paused) { synth.resume(); set({ paused: false }); } }
  function stop() { if (supported) synth.cancel(); set({ speaking: false, paused: false, id: null }); }
  function toggle(id, text) {
    if (state.id === id && state.speaking) {
      if (state.paused) resume(); else pause();
    } else {
      speak(id, text);
    }
  }

  window.DDTts = {
    supported, speak, pause, resume, stop, toggle,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    getState() { return state; },
  };

  // A navigating-away or reload should never leave a voice talking.
  window.addEventListener('beforeunload', stop);
})();
