(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'installPWA',
    init: function() {
      const $ = window.$;
      let promptEvent = null;
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault(); promptEvent = e;
        if (!$('btnInstallPWA')) {
          const btn = document.createElement('button');
          btn.id = 'btnInstallPWA'; btn.textContent = '⬇ Pasang Aplikasi';
          btn.style.cssText = `position:fixed;bottom:100px;right:12px;z-index:900;padding:8px 14px;background:var(--merah);color:#fff;border:none;border-radius:8px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.2);cursor:pointer;`;
          btn.onclick = async () => {
            if (!promptEvent) return; promptEvent.prompt();
            const { outcome } = await promptEvent.userChoice;
            if (outcome === 'accepted') btn.remove();
            promptEvent = null;
          };
          document.body.appendChild(btn);
        }
      });
      window.addEventListener('appinstalled', () => { if ($('btnInstallPWA')) $('btnInstallPWA').remove(); });
    }
  });
})();
