(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'gabungData',
    init: function() {
      const $ = window.$;
  // ==========================================
  // MODUL 06 - GABUNG DATA TIM 
  // ==========================================
    const tombol = $('btnMergeData');
    if (!tombol) return;
    tombol.addEventListener('click', () => {
      if (!confirm("Fitur ini akan membaca file ZIP/Excel dari tim lain, lalu memindah teks beriannya ke HP Anda (hanya jika kolom berian di HP Anda kosong).\n\nLanjutkan?")) return;

      const input = document.createElement('input');
      input.type = 'file'; input.accept = '.zip';
      input.onchange = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        try {
          const zip = new JSZip();
          await zip.loadAsync(file);
          let xlsName = Object.keys(zip.files).find(n => n.endsWith('.xls') || n.endsWith('.xlsx'));
          if (!xlsName) { alert('File Excel berian tidak ditemukan dalam ZIP tersebut.'); return; }
          window.ApsaraAPI.toast("Sedang memproses gabung data...");

          const excelBuffer = await zip.file(xlsName).async('arraybuffer');
          if (!window.XLSX) throw new Error("Pustaka SheetJS belum dimuat");
          const wb = XLSX.read(excelBuffer, { type: 'array' });
          const wsName = wb.SheetNames.includes("Berian") ? "Berian" : wb.SheetNames[wb.SheetNames.length - 1];
          const ws = wb.Sheets[wsName];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

          const api = window.ApsaraAPI;
          const tx = api.db.transaction(api.dbStoreName, 'readwrite');
          const store = tx.objectStore(api.dbStoreName);

          let headerMap = { berian: 4, ragu: 5, catatan: 6 };
          let imported = 0;
          rows.forEach((row, index) => {
            if (index === 0) {
              if (row[0] === 'No') {
                const h = row.map(c => String(c).toLowerCase());
                const bIdx = h.findIndex(x => x.includes('berian'));
                const rIdx = h.findIndex(x => x.includes('ragu'));
                const cIdx = h.findIndex(x => x.includes('catatan'));
                if (bIdx >= 0) headerMap.berian = bIdx;
                if (rIdx >= 0) headerMap.ragu = rIdx;
                if (cIdx >= 0) headerMap.catatan = cIdx;
              }
              return;
            }
            if (row.length < 3) return;
            const id = String(row[0]).trim();
            if (!id || isNaN(Number(id))) return;
            const berian = String(row[headerMap.berian] || '').trim();
            const ragu = String(row[headerMap.ragu] || '').trim() === '✓';
            const catatan = String(row[headerMap.catatan] || '').trim();

            if (berian || catatan) {
              const existing = api.userData[id] || {};
              if (!(existing.berian || '').trim()) {
                existing.id = Number(id);
                existing.berian = berian; existing.ragu = ragu; existing.catatan = catatan;
                api.userData[id] = existing; store.put(existing); imported++;
              }
            }
          });
          tx.oncomplete = () => { api.refreshUI(); alert(`Proses selesai! Berhasil menggabung ${imported} konsep baru dari tim lain ke perangkat Anda.`); };
        } catch (err) { alert('Gagal memproses file ZIP: Pastikan format benar.'); }
      };
      input.click();
    });
    }
  });
})();
