(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'ekspor',
    init: function() {
      const Internals = window.ApsaraInternals;
      const $ = (id) => document.getElementById(id);
      
      const btnExportLocal = $('btnExportLocal');
      if (btnExportLocal) {
        btnExportLocal.addEventListener('click', () => Internals.exportToZip());
      }
    }
  });
})();
