(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'metadata',
    init: function() {
      const Internals = window.ApsaraInternals;
      const $ = (id) => document.getElementById(id);
      
      const btnGetLocation = $('btnGetLocation');
      if (btnGetLocation) {
        btnGetLocation.addEventListener('click', () => Internals.deteksiLokasi());
      }
    }
  });
})();
