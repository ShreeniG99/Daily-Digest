// Loads the Daily Digest design system (global CSS + component bundle) from the
// local web/ root — this app is self-contained so it can deploy to GitHub Pages.
(() => {
  const base = '.';
  const v = '?v=6';
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = base + '/styles.css' + v;
  document.head.appendChild(l);

  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js' + v;
  s.onerror = () => console.error('ds-base.js: failed to load ' + s.src);
  document.head.appendChild(s);
})();
