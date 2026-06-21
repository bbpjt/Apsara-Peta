(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'entri',
    init: function() {
      const Internals = window.ApsaraInternals;
      const $ = (id) => document.getElementById(id);

      // Event Filter dan Pencarian
      $('categorySelect').addEventListener('change', () => { Internals.applyFilter(); Internals.render(); });
      $('searchInput').addEventListener('input', () => { Internals.applyFilter(); Internals.render(); });
      $('onlyUnfilled').addEventListener('change', () => { Internals.applyFilter(); Internals.render(); });

      // Tombol Hapus Berian
      $('btnClearBerian').addEventListener('click', () => { 
        if (!confirm('Hapus teks berian ini?')) return; 
        $('berianInput').value = ''; 
        $('raguInput').checked = false; 
        $('catatanInput').value = ''; 
        Internals.onEntryChange(); 
      });

      // Event Navigasi Kartu
      $('btnPrev').addEventListener('click', () => Internals.prev());
      $('btnNext').addEventListener('click', () => Internals.next());
      $('btnFlip').addEventListener('click', () => Internals.flip());
      $('btnFirst').addEventListener('click', () => Internals.goTo(0));
      $('btnLast').addEventListener('click', () => {
         if (Internals.filtered && Internals.filtered.length > 0) {
             Internals.goTo(Internals.filtered.length - 1);
         }
      });
      $('btnNextUnfilled').addEventListener('click', () => Internals.nextUnfilled());
    }
  });
})();
