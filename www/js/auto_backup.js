(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'autoBackup',
    init: function() {
      const KUNCI = 'apsara_autobackup_terakhir';
      setInterval(() => {
        const ud = window.ApsaraAPI.userData || {};
        let terisi = 0; for (const id in ud) if ((ud[id].berian || '').trim()) terisi++;
        const terakhir = parseInt(localStorage.getItem(KUNCI) || '0', 10);
        if (terisi >= terakhir + 50) {
          localStorage.setItem(KUNCI, String(Math.floor(terisi / 50) * 50));
          window.ApsaraAPI.toast('Sudah banyak data tersimpan! Disarankan untuk "Simpan Data (ZIP)" sekarang.');
        }
      }, 15000);
    }
  });
})();
