(function() {
  window.ApsaraSastraExport = async function(listData) {
    if (!window.JSZip || !window.saveAs) {
      alert("Library JSZip/FileSaver belum dimuat.");
      return;
    }
    
    const zip = new JSZip();
    const fields = window.ApsaraSastraFields || [];
    
    // Build CSV Content
    const csvHeader = ['ID', 'Waktu Entri', 'Status'];
    fields.forEach(f => csvHeader.push(f.label));
    
    let csvContent = '"' + csvHeader.join('","') + '"\n';
    
    listData.forEach(item => {
      const d = new Date(item.id);
      const wkt = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      
      const row = [
        item.id,
        wkt,
        item.status || 'draft'
      ];
      
      fields.forEach(f => {
        let val = item[f.id] || '';
        val = String(val).replace(/"/g, '""'); // escape double quotes untuk CSV
        row.push(val);
      });
      
      csvContent += '"' + row.join('","') + '"\n';
      
      // Setup Folder untuk Narasumber ini
      const safeName = (item.sastra_nama || 'TanpaNama').replace(/[^a-zA-Z0-9]/g, '_');
      const safeSastra = (item.sastra_nama_sastra || 'Sastra').replace(/[^a-zA-Z0-9]/g, '_');
      const folderName = `${safeName}_${safeSastra}_${item.id}`;
      const folder = zip.folder(folderName);
      
      // Masukkan Media ke dalam Folder
      if (item.audioBlob) {
        let ext = 'webm';
        if(item.audioBlob.type) {
           if(item.audioBlob.type.includes('mp4')) ext = 'm4a';
           else if(item.audioBlob.type.includes('wav')) ext = 'wav';
        }
        folder.file(`audio_${item.id}.${ext}`, item.audioBlob);
      }
      
      if (item.videoBlob) {
        let ext = 'mp4';
        if(item.videoBlob.type && item.videoBlob.type.includes('webm')) ext = 'webm';
        folder.file(`video_${item.id}.${ext}`, item.videoBlob);
      }
      
      if (item.fotoBlobs && item.fotoBlobs.length > 0) {
        item.fotoBlobs.forEach((foto, idx) => {
          let ext = 'jpg';
          if (foto.type && foto.type.includes('png')) ext = 'png';
          else if (foto.name && foto.name.toLowerCase().endsWith('.png')) ext = 'png';
          
          folder.file(`foto_${idx+1}_${item.id}.${ext}`, foto);
        });
      }
    });
    
    // BOM (\uFEFF) agar Excel bisa membaca karakter UTF-8 (aksen, dll) dengan benar
    zip.file("Data_Sastra.csv", "\uFEFF" + csvContent);
    
    const btn = document.getElementById('btnSastraExport');
    if(btn) btn.textContent = 'Memproses ZIP...';
    
    try {
      const content = await zip.generateAsync({ type: "blob" });
      const tgl = new Date();
      const tglStr = `${tgl.getFullYear()}${String(tgl.getMonth()+1).padStart(2,'0')}${String(tgl.getDate()).padStart(2,'0')}`;
      
      saveAs(content, `Ekspor_Sastra_${tglStr}.zip`);
    } catch(err) {
      console.error(err);
      alert("Gagal membuat ZIP: " + err.message);
    } finally {
      if(btn) btn.textContent = '⬇ Ekspor Data Sastra (ZIP)';
    }
  };
})();
