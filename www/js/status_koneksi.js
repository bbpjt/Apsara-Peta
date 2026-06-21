(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'statusKoneksi',
    init: function() {
      // Menggunakan window.$ dari core.js
      const slot = window.$('mastheadBadges'); // Mendarat berbaris dengan "Tersimpan"
      if (!slot) return;
      const pil = document.createElement('span');
      pil.className = 'status-dot status-dot-small';
      slot.appendChild(pil);

      function refresh() {
        const online = navigator.onLine;
        const iconDaring = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;vertical-align:-2px"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>';
        const iconLuring = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;vertical-align:-2px"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>';
        pil.innerHTML = (online ? iconDaring : iconLuring) + '<span class="badge-text">' + (online ? 'Daring' : 'Luring') + '</span>';
        pil.style.background = online ? 'var(--hijau-soft)' : 'var(--merah-soft)';
        pil.style.color = online ? 'var(--hijau)' : 'var(--merah)';
        pil.style.borderColor = online ? 'color-mix(in oklch, var(--hijau) 30%, transparent)' : 'color-mix(in oklch, var(--merah) 30%, transparent)';
      }
      window.addEventListener('online', refresh);
      window.addEventListener('offline', refresh);
      refresh();
    }
  });
})();
