/* Share helper — native share sheet (incl. WhatsApp on mobile) where available,
   else a direct WhatsApp wa.me link. */
(function () {
  function waLink(text) {
    return 'https://wa.me/?text=' + encodeURIComponent(text);
  }

  // Share a digest item: its title + source link.
  window.DDShare = function (item) {
    const url = item && item.url && item.url !== '#' ? item.url : location.href;
    const title = (item && item.title) || 'Daily Digest';
    if (navigator.share) {
      navigator.share({ title, text: title, url }).catch(() => {});
      return;
    }
    window.open(waLink(title + (url ? ' — ' + url : '')), '_blank', 'noopener');
  };

  // Share a plain message (used for the daily to-do, which has no URL).
  window.DDShareText = function (message) {
    const text = String(message || '').trim();
    if (!text) return;
    if (navigator.share) {
      navigator.share({ title: 'Daily Digest — today’s to-do', text }).catch(() => {});
      return;
    }
    window.open(waLink(text), '_blank', 'noopener');
  };
})();
