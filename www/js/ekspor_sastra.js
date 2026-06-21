(function() {
  function csvEscape(v) { return String(v === undefined || v === null ? '' : v).replace(/"/g, '""'); }
  function rowToCSV(arr) { return '"' + arr.map(csvEscape).join('","') + '"\n'; }

  window.ApsaraSastraExport = async function(listData) {
    if (!window.JSZip || !window.saveAs) { alert("Library JSZip/FileSaver belum dimuat."); return; }

    const zip = new JSZip();
    const cfg = window.ApsaraSastraGenreConfig;
    if (!cfg) { alert('Konfigurasi sastra belum dimuat.'); return; }
    const { GENRES, KONTEKS_LABELS, allFields, getKonteks, getGenre } = cfg;

    const FIXED = ['ID', 'Konteks Penyampaian', 'Genre', 'Sub-genre', 'Nama Sastra Lisan', 'Judul Karya', 'Nama Narasumber', 'Jenis Kelamin', 'Usia', 'Tanggal Pengambilan', 'Status'];
    const SKIP = ['konteks', 'genre', 'sub_genre', 'sastra_nama_sastra', 'judul', 'sastra_nama', 'sastra_jk', 'sastra_usia', 'sastra_pengambil_tanggal'];

    const dyn = allFields().filter(f => !SKIP.includes(f.id));
    let csv = rowToCSV([...FIXED, ...dyn.map(f => f.label)]);

    listData.forEach(item => {
      const gKey = getGenre(item);
      const g = GENRES[gKey];
      const fixed = [
        item.id,
        KONTEKS_LABELS[getKonteks(item)] || '',
        g ? g.label : (item.genre_lain ? 'Lainnya: ' + item.genre_lain : (item.genre || '')),
        item.sub_genre || '',
        item.sastra_nama_sastra || '',
        item.judul || '',
        item.sastra_nama || '',
        item.sastra_jk || '',
        item.sastra_usia || '',
        item.sastra_pengambil_tanggal || '',
        item.status || 'draft',
      ];
      csv += rowToCSV([...fixed, ...dyn.map(f => item[f.id] || '')]);

      const safeName = (item.sastra_nama || 'TanpaNama').replace(/[^a-zA-Z0-9]/g, '_');
      const safeJudul = (item.sastra_nama_sastra || item.judul || 'Sastra').replace(/[^a-zA-Z0-9]/g, '_');
      const folder = zip.folder(`${safeName}_${safeJudul}_${item.id}`);

      if (item.audioBlob) {
        let ext = 'webm';
        if (item.audioBlob.type) { if (item.audioBlob.type.includes('mp4')) ext = 'm4a'; else if (item.audioBlob.type.includes('wav')) ext = 'wav'; }
        folder.file(`audio_${item.id}.${ext}`, item.audioBlob);
      }
      if (item.videoBlob) {
        let ext = (item.videoBlob.type && item.videoBlob.type.includes('mp4')) ? 'mp4' : 'webm';
        folder.file(`video_${item.id}.${ext}`, item.videoBlob);
      }
      if (item.fotoBlobs && item.fotoBlobs.length > 0) {
        item.fotoBlobs.forEach((foto, idx) => {
          let ext = 'jpg';
          if (foto.type && foto.type.includes('png')) ext = 'png';
          else if (foto.name && foto.name.toLowerCase().endsWith('.png')) ext = 'png';
          folder.file(`foto_${idx + 1}_${item.id}.${ext}`, foto);
        });
      }
    });

    zip.file("Sastra_Lisan.csv", "﻿" + csv);

    const btn = document.getElementById('btnSastraExport');
    if (btn) btn.textContent = 'Memproses ZIP...';
    try {
      const content = await zip.generateAsync({ type: "blob" });
      const tgl = new Date();
      const tglStr = `${tgl.getFullYear()}${String(tgl.getMonth() + 1).padStart(2, '0')}${String(tgl.getDate()).padStart(2, '0')}`;
      saveAs(content, `Ekspor_Sastra_${tglStr}.zip`);
    } catch (err) {
      console.error(err);
      alert("Gagal membuat ZIP: " + err.message);
    } finally {
      if (btn) btn.textContent = 'Ekspor Data Sastra (ZIP)';
    }
  };
})();
