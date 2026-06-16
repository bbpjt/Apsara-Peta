(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'validasiEkspor',
    init: function() {
      const $ = window.$;
      const tombol = $('btnExportLocal');
      if (!tombol) return;
      tombol.addEventListener('click', (e) => {
        const meta = window.ApsaraAPI.metaData || {};
        const masalah = [];
        if (!meta.bahasa) masalah.push('Nama Isolek belum diisi');
        if (!meta.lintang) masalah.push('Koordinat GPS belum dideteksi');
        if (masalah.length > 0 && !confirm('PERHATIAN: \n• ' + masalah.join('\n• ') + '\n\nTetap lanjutkan ekspor ZIP?')) {
          e.stopImmediatePropagation(); e.preventDefault();
        }
      }, true);
    }
  });
})();
