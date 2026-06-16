(function() {
  const DB_NAME = 'BerianDB_v1';
  const STORE_SASTRA = 'sastra_data';
  let dbSastra = null;
  let currentSastraData = null; // Data form saat ini
  let autoSaveInterval = null;

  // Injeksi gaya preset secara dinamis
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .preset-group {
      display: flex; flex-wrap: wrap; gap: 6px;
      margin: 4px 0 10px 0;
    }
    .preset-btn {
      padding: 5px 12px;
      font-size: 12px;
      border-radius: 6px;
      background: var(--paper-tint);
      color: var(--ink);
      border: 1px solid var(--line);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .preset-btn:hover {
      background: var(--emas-soft);
    }
    .preset-btn.active {
      background: var(--emas-soft);
      color: var(--emas-tua);
      border-color: var(--emas);
      font-weight: 600;
    }
    .sub-fields {
      margin-left: 16px;
      padding-left: 12px;
      border-left: 2px solid var(--emas-soft);
    }
    .section-header {
      font-weight: 700;
      font-size: 13px;
      color: var(--emas-tua);
      margin: 14px 0 8px 0;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--line);
    }
    input[type="date"]::-webkit-calendar-picker-indicator {
      cursor: pointer;
      opacity: 1;
      display: block;
    }
    .kemajuan-bar {
      width: 100%;
      height: 6px;
      background: var(--line);
      border-radius: 3px;
      overflow: hidden;
      margin: 4px 0 2px 0;
    }
    .kemajuan-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    .kemajuan-text {
      font-size: 10px;
      color: var(--ink-muted);
    }
    .sastra-card {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 10px;
      transition: box-shadow 0.2s ease;
      cursor: pointer;
    }
    .sastra-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .sastra-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .sastra-card-nama {
      font-weight: 700;
      font-size: 14px;
      color: var(--ink);
    }
    .sastra-card-subtitle {
      font-size: 12px;
      color: var(--ink-muted);
      font-style: italic;
      margin-bottom: 6px;
    }
    .sastra-card-meta {
      font-size: 11px;
      color: var(--ink-faint);
      margin-bottom: 8px;
    }
    .sastra-card-actions {
      display: flex;
      gap: 6px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    .btn-edit-sastra, .btn-hapus-sastra, .btn-duplikat-sastra {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-edit-sastra {
      background: var(--paper-tint);
      color: var(--ink);
      border: 1px solid var(--line);
    }
    .btn-hapus-sastra {
      background: var(--merah-soft);
      color: var(--merah);
      border: 1px solid color-mix(in oklch, var(--merah) 30%, transparent);
    }
    .btn-duplikat-sastra {
      background: var(--emas-soft);
      color: var(--emas-tua);
      border: 1px solid color-mix(in oklch, var(--emas) 30%, transparent);
    }
  `;
  // Set variabel root hijau jika belum ada
  document.documentElement.style.setProperty('--hijau', '#10b981');
  document.head.appendChild(styleEl);

  let cachedListData = [];
  let currentFilter = 'semua';

  const SASTRA_FIELDS = [
    // Bagian A: Data Narasumber (16 field)
    { id: "sastra_nama", label: "A1. Nama Lengkap", type: "text", section: "A" },
    { id: "sastra_komunitas_ada", label: "A2. Komunitas: Ada/Tidak", type: "preset", options: ["Ada", "Tidak"], section: "A" },
    { id: "sastra_komunitas_nama", label: "A2a. Nama Komunitas", type: "text", section: "A", dependsOn: "sastra_komunitas_ada", dependsValue: "Ada" },
    { id: "sastra_komunitas_tgl", label: "A2b. Tanggal Pendirian", type: "date", section: "A", dependsOn: "sastra_komunitas_ada", dependsValue: "Ada" },
    { id: "sastra_komunitas_pendiri", label: "A2c. Nama Pendiri", type: "text", section: "A", dependsOn: "sastra_komunitas_ada", dependsValue: "Ada" },
    { id: "sastra_komunitas_alamat", label: "A2d. Alamat Sekretariat", type: "textarea", section: "A", dependsOn: "sastra_komunitas_ada", dependsValue: "Ada" },
    { id: "sastra_tempat_lahir", label: "A3a. Tempat Lahir", type: "text", placeholder: "Contoh: Jakarta", section: "A" },
    { id: "sastra_tanggal_lahir", label: "A3b. Tanggal Lahir", type: "date", section: "A" },
    { id: "sastra_usia", label: "A3c. Usia", type: "number", readonly: true, section: "A" },
    { id: "sastra_jk", label: "A4. Jenis Kelamin", type: "preset", options: ["Laki-laki", "Perempuan"], section: "A" },
    { id: "sastra_kategori_ns", label: "A5. Kategori Narasumber", type: "preset", options: ["Juru cerita/pendukung aktif", "Bukan juru cerita/pendukung pasif"], section: "A" },
    { id: "sastra_pekerjaan", label: "A6. Pekerjaan", type: "text", section: "A" },
    { id: "sastra_keahlian", label: "A7. Keahlian Selain Pekerjaan", type: "text", section: "A" },
    { id: "sastra_suku", label: "A8. Suku Bangsa", type: "text", section: "A" },
    { id: "sastra_daerah_asal", label: "A9. Daerah Asal Narasumber", type: "text", section: "A" },
    { id: "sastra_bahasa_dikuasai", label: "A10. Bahasa yang Dikuasai", type: "text", section: "A" },
    { id: "sastra_kondisi_fisik", label: "A11. Kondisi Fisik Informan", type: "text", section: "A" },
    { id: "sastra_foto_narasumber", label: "Foto Narasumber", type: "camera", section: "A" },

    // Bagian B: Data Sastra Lisan (24 field)
    { id: "sastra_nama_sastra", label: "B1. Nama Sastra Lisan", type: "text", section: "B" },
    { id: "sastra_lokasi_provinsi", label: "B2a. Provinsi", type: "text", section: "B" },
    { id: "sastra_lokasi_kabupaten", label: "B2b. Kabupaten/Kota", type: "text", section: "B" },
    { id: "sastra_lokasi_kecamatan", label: "B2c. Kecamatan", type: "text", section: "B" },
    { id: "sastra_lokasi_desa", label: "B2d. Desa/Kelurahan", type: "text", section: "B" },
    { id: "sastra_lokasi_jalan", label: "B2e. Jalan", type: "text", section: "B" },
    { id: "sastra_lokasi_kodepos", label: "B2f. Kode Pos", type: "text", section: "B" },
    { id: "sastra_lokasi_koordinat", label: "B2g. Titik Koordinat", type: "gps", section: "B" },
    { id: "sastra_kategori_penutur", label: "B3. Kategori Penutur", type: "preset", options: ["Sendiri", "Duet", "Kelompok"], section: "B" },
    { id: "sastra_bentuk_tuturan", label: "B4. Bentuk Tuturan", type: "preset", options: ["Diceritakan", "Dinyanyikan", "Dibacakan", "Dialog"], section: "B" },
    { id: "sastra_bahasa_sastra", label: "B5. Bahasa yang Digunakan dalam Sastra Lisan", type: "text", section: "B" },
    { id: "sastra_iringan_musik", label: "B6. Iringan Musik", type: "text", section: "B" },
    // Sub-bagian: DESKRIPSI FISIK PERTUNJUKAN
    { id: "sastra_tempat_pertunjukan", label: "B7. Tempat Pertunjukan", type: "textarea", placeholder: "Jelaskan tempat pertunjukan...", section: "B" },
    { id: "sastra_dekorasi", label: "B8. Dekorasi", type: "textarea", placeholder: "Jelaskan dekorasi yang digunakan...", section: "B" },
    { id: "sastra_kostum", label: "B9. Kostum/Properti", type: "textarea", placeholder: "Jelaskan kostum/properti...", section: "B" },
    { id: "sastra_formasi", label: "B10. Formasi Penutur", type: "textarea", placeholder: "Jelaskan formasi penutur...", section: "B" },
    { id: "sastra_posisi_penonton", label: "B11. Posisi Penonton", type: "preset", options: ["Teratur", "Tidak Teratur (Bebas)"], section: "B" },
    { id: "sastra_interaksi_penonton", label: "B11-a. Interaksi Penutur dan Penonton", type: "preset", options: ["Ada", "Tidak Ada"], section: "B" },
    { id: "sastra_interaksi_penonton_desk", label: "Jelaskan interaksi...", type: "textarea", section: "B", dependsOn: "sastra_interaksi_penonton", dependsValue: "Ada" },
    { id: "sastra_waktu_pertunjukan", label: "B11-b. Waktu Pertunjukan", type: "preset", options: ["Pagi", "Siang", "Malam", "Tidak tentu (Bebas)"], section: "B" },
    { id: "sastra_syarat_pertunjukan", label: "B11-c. Syarat Pertunjukan", type: "preset", options: ["Ada", "Tidak Ada"], section: "B" },
    { id: "sastra_syarat_pertunjukan_desk", label: "Jelaskan syarat...", type: "textarea", section: "B", dependsOn: "sastra_syarat_pertunjukan", dependsValue: "Ada" },
    // Sub-bagian: ISI
    { id: "sastra_deskripsi_isi", label: "B12. Deskripsi Singkat Isi Sastra Lisan", type: "textarea", section: "B" },
    { id: "sastra_kutipan", label: "B13. Kutipan Tuturan Sastra Lisan", type: "textarea", section: "B" },
    
    // Bagian C: Konteks (14 field)
    { id: "sastra_daerah_asal_sastra", label: "B14. Daerah Asal Sastra Lisan", type: "text", section: "C" },
    { id: "sastra_persebaran", label: "B15. Persebaran", type: "text", section: "C" },
    { id: "sastra_suku_pemilik", label: "B16. Suku Pemilik Sastra Lisan", type: "text", section: "C" },
    { id: "sastra_topografi", label: "B17. Gambaran Topografis", type: "preset", options: ["Pesisir", "Pegunungan", "Wilayah antara"], section: "C" },
    { id: "sastra_khalayak_jumlah", label: "B18a. Jumlah Penonton", type: "number", section: "C" },
    { id: "sastra_khalayak_usia", label: "B18b. Usia Penonton (contoh: anak-anak, dewasa)", type: "text", section: "C" },
    { id: "sastra_khalayak_jk", label: "B18c. Jenis Kelamin Penonton (contoh: campur, laki-laki saja)", type: "text", section: "C" },
    { id: "sastra_tujuan", label: "B19. Tujuan Pertunjukan", type: "text", section: "C" },
    { id: "sastra_suasana", label: "B20. Suasana Pertunjukan", type: "text", section: "C" },
    { id: "sastra_frekuensi", label: "B21. Frekuensi Saat Ini", type: "preset", options: ["Sering", "Jarang", "Tidak pernah"], section: "C" },
    { id: "sastra_status_sastra", label: "B21a. Status", type: "preset", options: ["Berkembang", "Mengalami kemunduran", "Terancam punah"], section: "C" },
    { id: "sastra_komunitas_penghidup", label: "B22. Komunitas yang Menghidupi", type: "text", section: "C" },
    { id: "sastra_pewarisan", label: "B23. Sistem Pewarisan", type: "preset", options: ["Terbuka", "Tertutup"], section: "C" },
    { id: "sastra_infrastruktur", label: "B24. Infrastruktur yang Tersedia", type: "text", section: "C" },

    // Bagian D: Pengambil Data & Dokumentasi (13 field)
    { id: "sastra_pengambil_nama", label: "B25a. Nama Pengambil Data", type: "text", section: "D" },
    { id: "sastra_pengambil_satker", label: "B25b. Satuan Kerja", type: "text", section: "D" },
    { id: "sastra_pengambil_tanggal", label: "B25c. Tanggal Pengambilan", type: "timestamp", section: "D" },
    { id: "sastra_dokumentasi_bentuk", label: "B26a. Bentuk Dokumentasi (contoh: Audio, Video, Foto)", type: "text", section: "D" },
    { id: "sastra_dokumentasi_tautan", label: "B26b. Tautan Hasil Dok.", type: "text", section: "D" },
    { id: "sastra_dokumentasi_perekam", label: "B26c. Nama Perekam", type: "text", section: "D" },
    { id: "sastra_dokumentasi_instansi", label: "B26d. Asal Instansi Perekam", type: "text", section: "D" },
    { id: "sastra_transaksi_lampiran", label: "B27a. Lampiran Transkripsi", type: "textarea", section: "D" },
    { id: "sastra_transaksi_nama", label: "B27b. Nama Pentranskripsi", type: "text", section: "D" },
    { id: "sastra_transaksi_instansi", label: "B27c. Asal Instansi Pentranskripsi", type: "text", section: "D" },
    { id: "sastra_terjemahan_lampiran", label: "B28a. Lampiran Terjemahan", type: "textarea", section: "D" },
    { id: "sastra_terjemahan_nama", label: "B28b. Nama Penerjemah", type: "text", section: "D" },
    { id: "sastra_terjemahan_instansi", label: "B28c. Asal Instansi Penerjemah", type: "text", section: "D" },
  ];
  
  window.ApsaraSastraFields = SASTRA_FIELDS;

  function getDB() {
    return new Promise((resolve, reject) => {
      if (dbSastra) return resolve(dbSastra);
      const req = indexedDB.open(DB_NAME, 3);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_SASTRA)) {
          db.createObjectStore(STORE_SASTRA, { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => { dbSastra = e.target.result; resolve(dbSastra); };
      req.onerror = reject;
    });
  }

  async function getAllSastra() {
    const db = await getDB();
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(STORE_SASTRA)) return resolve([]);
      const req = db.transaction([STORE_SASTRA], 'readonly').objectStore(STORE_SASTRA).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async function saveSastraToDB(data) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_SASTRA], 'readwrite');
      const store = tx.objectStore(STORE_SASTRA);
      const req = store.put(data);
      req.onsuccess = resolve;
      req.onerror = reject;
    });
  }

  async function deleteSastraFromDB(id) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_SASTRA], 'readwrite');
      tx.objectStore(STORE_SASTRA).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  }

  function hitungKemajuan(item) {
    const seksiTerisi = [];

    // Cek Seksi A: minimal 1 field terisi
    const seksiA = SASTRA_FIELDS.filter(f => f.section === 'A');
    if (seksiA.some(f => item[f.id] && String(item[f.id]).trim() !== '')) {
      seksiTerisi.push('A');
    }

    // Cek Seksi B
    const seksiB = SASTRA_FIELDS.filter(f => f.section === 'B');
    if (seksiB.some(f => item[f.id] && String(item[f.id]).trim() !== '')) {
      seksiTerisi.push('B');
    }

    // Cek Seksi C
    const seksiC = SASTRA_FIELDS.filter(f => f.section === 'C');
    if (seksiC.some(f => item[f.id] && String(item[f.id]).trim() !== '')) {
      seksiTerisi.push('C');
    }

    // Cek Seksi D
    const seksiD = SASTRA_FIELDS.filter(f => f.section === 'D');
    if (seksiD.some(f => item[f.id] && String(item[f.id]).trim() !== '')) {
      seksiTerisi.push('D');
    }

    // Cek Seksi E (media)
    if ((item.fotoBlobs && item.fotoBlobs.length > 0) || item.audioBlob || item.videoBlob) {
      seksiTerisi.push('E');
    }

    return {
      terisi: seksiTerisi.length,
      total: 5,
      persen: Math.round(seksiTerisi.length / 5 * 100)
    };
  }

  async function duplikatSastra(entriLama) {
    const entriBaru = {
      id: Date.now(),
      status: 'draft'
    };

    // Salin field seksi A
    SASTRA_FIELDS
      .filter(f => f.section === 'A')
      .forEach(f => {
        if (entriLama[f.id] !== undefined) {
          entriBaru[f.id] = entriLama[f.id];
        }
      });

    // Kosongkan seksi B, C, D
    SASTRA_FIELDS
      .filter(f => ['B', 'C', 'D'].includes(f.section))
      .forEach(f => {
        entriBaru[f.id] = '';
      });

    // Kosongkan media
    entriBaru.fotoBlobs = [];
    entriBaru.audioBlob = null;
    entriBaru.videoBlob = null;

    // Simpan ke DB
    await saveSastraToDB(entriBaru);

    // Buka form
    openForm(entriBaru);
  }

  function renderListView(container, listData) {
    // Terapkan penyaringan filter sebelum render
    let filteredData = listData;
    if (currentFilter === 'belum') {
      filteredData = listData.filter(item => hitungKemajuan(item).terisi < 5);
    } else if (currentFilter === 'sudah') {
      filteredData = listData.filter(item => hitungKemajuan(item).terisi === 5);
    }

    let html = `
      <div class="sastra-list-container">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap: wrap; gap: 8px;">
          <h2 style="font-family:var(--display); font-size:20px; color:var(--ink);">Daftar Sastra Lisan</h2>
          <div style="display:flex; gap:8px; align-items:center;">
            <select id="filterSastraLengkap" class="select-pretty" style="padding: 4px 8px; font-size:12px; min-width: 120px;">
              <option value="semua">Semua</option>
              <option value="belum">Belum Lengkap</option>
              <option value="sudah">Sudah Lengkap</option>
            </select>
            <button class="btn btn-primary" id="btnSastraNew">+ Tambah Baru</button>
          </div>
        </div>
        <div class="sastra-cards-container">
    `;

    if (filteredData.length === 0) {
      html += `<div style="text-align:center; padding: 20px; color:var(--ink-faint);">Tidak ada data sastra lisan yang sesuai.</div>`;
    } else {
      filteredData.sort((a,b) => b.id - a.id).forEach(item => {
        const d = new Date(item.id);
        const pad = (n) => String(n).padStart(2, '0');
        const dateStr = `${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`;
        const timeStr = `(${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())})`;
        const nama = item.sastra_nama || '(Tanpa Nama)';
        const sastra = item.sastra_nama_sastra || '(Belum diisi)';
        const statusClass = item.status === 'selesai' ? 'selesai' : 'draft';
        const kemajuan = hitungKemajuan(item);
        const warnaBar = kemajuan.terisi === 5 ? 'var(--hijau)' : 'var(--emas)';

        html += `
          <div class="sastra-card" data-id="${item.id}">
            <div class="sastra-card-header">
              <div class="sastra-card-nama">${nama}</div>
              <span class="sastra-status ${statusClass}">
                ${item.status.toUpperCase()}
              </span>
            </div>
            <div class="sastra-card-subtitle">${sastra}</div>
            <div class="sastra-card-meta">
              ${dateStr} ${timeStr}
            </div>
            <div class="kemajuan-bar">
              <div class="kemajuan-fill"
                style="width:${kemajuan.persen}%;
                background:${warnaBar};">
              </div>
            </div>
            <span class="kemajuan-text">
              ${kemajuan.terisi}/5 seksi
            </span>
            <div class="sastra-card-actions">
              <button class="btn-edit-sastra"
                data-id="${item.id}">Edit</button>
              <button class="btn-hapus-sastra"
                data-id="${item.id}">Hapus</button>
              <button class="btn-duplikat-sastra"
                data-id="${item.id}">📋 Duplikat</button>
            </div>
          </div>
        `;
      });
    }

    html += `</div></div>`;
    
    html += `
      <div style="margin-top: 16px; text-align: right;">
        <button class="btn btn-accent" id="btnSastraExport">Ekspor Data Sastra (ZIP)</button>
      </div>
    `;

    container.innerHTML = html;

    // Set dropdown select ke filter terpilih
    const filterSelect = container.querySelector('#filterSastraLengkap');
    if (filterSelect) {
      filterSelect.value = currentFilter;
      filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderListView(container, listData);
      });
    }

    container.querySelector('#btnSastraNew').addEventListener('click', () => {
      openForm(null);
    });

    container.querySelectorAll('.sastra-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = Number(card.dataset.id);
        const data = listData.find(d => d.id === id);
        if (data) openForm(data);
      });
    });

    container.querySelectorAll('.btn-edit-sastra').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        const data = listData.find(d => d.id === id);
        if (data) openForm(data);
      });
    });

    container.querySelectorAll('.btn-hapus-sastra').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        const item = listData.find(d => d.id === id);
        const nama = (item && item.sastra_nama) ? item.sastra_nama : 'entri ini';
        if (!confirm(`Hapus data sastra lisan "${nama}"?\nTindakan ini tidak dapat dibatalkan.`)) return;
        await deleteSastraFromDB(id);
        initSastraUI();
      });
    });

    container.querySelectorAll('.btn-duplikat-sastra').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        const data = listData.find(d => d.id === id);
        if (data) await duplikatSastra(data);
      });
    });

    const btnExport = container.querySelector('#btnSastraExport');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        if (window.ApsaraSastraExport) {
          window.ApsaraSastraExport(listData);
        } else {
          alert('Modul ekspor sastra belum dimuat.');
        }
      });
    }
  }

  function buildFormHTML() {
    const sections = { A: "A. Data Narasumber", B: "B. Informasi Sastra Lisan", C: "C. Konteks & Khalayak", D: "D. Status & Pencatat" };
    let html = `
      <div class="sastra-form-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <button class="btn" id="btnSastraBack" style="padding: 6px 14px; font-size: 12px; font-weight: 600; background: var(--merah-soft); color: var(--merah); border: 1px solid color-mix(in oklch, var(--merah) 30%, transparent); border-radius: 8px; cursor: pointer;">&lt; Kembali</button>
        <div style="display:flex; gap:8px; align-items:center;">
          <span id="sastraSaveIndicator" style="font-size:11px; color:var(--hijau); opacity:0; transition:opacity 0.3s;">[Tersimpan]</span>
          <select id="sastra_status_input" class="select-pretty" style="padding:4px 8px; font-size:12px;">
            <option value="draft">Draft</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
      </div>
    `;

    Object.keys(sections).forEach(secKey => {
      html += `
        <details class="meta-section-card sastra-section" name="sastra-sections" open>
          <summary class="meta-section-summary">${sections[secKey]}</summary>
          <div class="meta-section-body">
            <div class="field-grid">
      `;
      
      const secFields = SASTRA_FIELDS.filter(f => f.section === secKey);
      secFields.forEach(f => {
        const depAttr = f.dependsOn ? `data-depends-on="${f.dependsOn}" data-depends-value="${f.dependsValue}" style="display:none;"` : '';
        const fieldClass = f.dependsOn ? 'field sub-fields' : 'field';
        html += `<div class="${fieldClass}" style="grid-column: 1 / -1;" ${depAttr}>`;
        html += `<label class="field-label">${f.label}</label>`;
        if (f.type === 'text') {
          const placeholderAttr = f.placeholder ? `placeholder="${f.placeholder}"` : '';
          html += `<input type="text" class="field-input sastra-input" data-key="${f.id}" ${placeholderAttr}>`;
        } else if (f.type === 'number') {
          const roAttr = f.readonly ? 'readonly style="background:var(--paper-tint);"' : '';
          html += `<input type="number" class="field-input sastra-input" data-key="${f.id}" ${roAttr}>`;
        } else if (f.type === 'date') {
          html += `<input type="text" class="field-input sastra-input" data-key="${f.id}" placeholder="dd/mm/yyyy" pattern="\\d{2}/\\d{2}/\\d{4}" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value)this.type='text'">`;
        } else if (f.type === 'textarea') {
          const placeholderAttr = f.placeholder ? `placeholder="${f.placeholder}"` : '';
          html += `<textarea class="field-input sastra-input" data-key="${f.id}" ${placeholderAttr} style="min-height:60px;"></textarea>`;
        } else if (f.type === 'preset') {
          html += `<input type="hidden" class="sastra-input" data-key="${f.id}">
                  <div class="preset-group" data-for="${f.id}">
                    ${f.options.map(o => `<button type="button" class="preset-btn" data-value="${o}">${o}</button>`).join('')}
                  </div>`;
        } else if (f.type === 'gps') {
          html += `<div style="display:flex; gap:8px;">
            <input type="text" class="field-input sastra-input" data-key="${f.id}" placeholder="-6.123, 106.456" readonly style="flex:1; background:var(--paper-tint);">
            <button type="button" class="btn btn-primary" id="btnSastraGPS" style="padding: 10px;">Ambil GPS</button>
          </div>`;
        } else if (f.type === 'timestamp') {
          html += `<div style="display:flex; gap:8px;">
            <input type="text" class="field-input sastra-input" data-key="${f.id}" placeholder="Klik Ambil..." readonly style="flex:1; background:var(--paper-tint);">
            <button type="button" class="btn btn-primary" id="btnSastraTanggal" style="padding: 10px;">Ambil</button>
          </div>`;
        } else if (f.type === 'select') {
          html += `<select class="select-pretty sastra-input" data-key="${f.id}" style="width:100%;">
            <option value="">-- Pilih --</option>
            ${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}
          </select>`;
        } else if (f.type === 'camera') {
          html += `
            <input type="hidden"
              class="sastra-input"
              data-key="${f.id}"
              id="sastra_foto_narasumber_input">
            <div class="sastra-camera-container"
              style="margin-top:8px;">
              <div class="sastra-video-wrap"
                style="display:none; margin-bottom:10px;
                border:1px solid var(--line);
                border-radius:8px; overflow:hidden;
                position:relative; background:#000;
                max-width:320px;">
                <video autoplay playsinline muted
                  style="width:100%; display:block;">
                </video>
                <button type="button"
                  class="btn-capture-live"
                  style="position:absolute; bottom:10px;
                  left:50%; transform:translateX(-50%);
                  z-index:10; width:52px; height:52px;
                  border-radius:50%; display:flex;
                  align-items:center; justify-content:center;
                  font-size:22px;
                  background:rgba(255,255,255,0.9);
                  color:#333; border:3px solid white;
                  box-shadow:0 2px 8px rgba(0,0,0,0.3);
                  cursor:pointer;">
                  📷
                </button>
              </div>
              <div class="sastra-photo-preview-wrap"
                style="display:none; margin-bottom:10px;
                border:1px solid var(--line);
                border-radius:8px; padding:6px;
                background:var(--paper-tint);
                max-width:320px; text-align:center;">
                <img class="sastra-photo-preview"
                  style="max-width:100%; max-height:240px;
                  border-radius:6px; display:block;
                  margin:0 auto;">
                <div style="display:flex; gap:6px;
                  justify-content:center; margin-top:6px;">
                  <button type="button"
                    class="btn-ganti-foto"
                    style="padding:3px 8px; font-size:11px;
                    background:var(--paper-tint);
                    color:var(--ink); border:1px solid
                    var(--line); border-radius:4px;
                    cursor:pointer;">
                    Ganti Foto
                  </button>
                  <button type="button"
                    class="btn-remove-foto"
                    style="padding:3px 8px; font-size:11px;
                    background:var(--merah-soft);
                    color:var(--merah); border:none;
                    border-radius:4px; cursor:pointer;">
                    Hapus Foto
                  </button>
                </div>
              </div>
              <div class="sastra-camera-actions"
                style="display:flex; gap:8px;
                flex-wrap:wrap; align-items:center; width:100%;">
                <button type="button" class="btn btn-primary btn-start-camera" title="Buka Kamera Live"
                  style="padding: 10px; background: var(--emas); color: oklch(15% 0.008 48); border: 1px solid var(--emas); border-radius: 8px; flex: 0 0 44px; width: 44px; height: 40px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                </button>
                <label class="btn btn-primary"
                  style="padding: 10px 14px; background: var(--paper-deep); color: var(--ink); border: 1px solid var(--line-strong); border-radius: 8px; font-size: 12px; font-weight: 700; flex:1; min-width: 140px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; margin:0;">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  Pilih dari Galeri
                  <input type="file" accept="image/*"
                    class="sastra-file-foto-input"
                    style="display:none;">
                </label>
              </div>
            </div>
          `;
        }
        html += `</div>`;
      });

      html += `</div></div></details>`;
    });

    html += `
      <details class="meta-section-card sastra-section" name="sastra-sections">
        <summary class="meta-section-summary">E. Dokumentasi Media</summary>
        <div class="meta-section-body">
          
          <div class="field" style="margin-bottom: 16px;">
            <label class="field-label">1. Audio Rekaman (Bisa menggunakan Praat form Bahasa, atau pilih file)</label>
            <input type="file" id="sastra_audio_input" accept="audio/*" class="sastra-media-input">
            <div id="sastra_audio_status" style="font-size:12px; margin-top:4px; color:var(--emas-tua);"></div>
          </div>

          <div class="field" style="margin-bottom: 16px;">
            <label class="field-label">2. Foto-foto Pertunjukan (Pilih banyak)</label>
            <input type="file" id="sastra_foto_input" accept="image/*" multiple class="sastra-media-input" style="margin-bottom:8px;">
            <div class="sastra-gallery" id="sastra_foto_gallery"></div>
          </div>

          <div class="field">
            <label class="field-label">3. Video Pertunjukan (Opsional)</label>
            <input type="file" id="sastra_video_input" accept="video/*" class="sastra-media-input">
            <div id="sastra_video_status" style="font-size:12px; margin-top:4px; color:var(--emas-tua);"></div>
          </div>

        </div>
      </details>
    `;

    return html;
  }

  function initCameraField(container) {
    const videoWrap = container.querySelector('.sastra-video-wrap');
    if (!videoWrap) return;
    const video = videoWrap.querySelector('video');
    const captureBtn = container.querySelector('.btn-capture-live');
    const previewWrap = container.querySelector('.sastra-photo-preview-wrap');
    const previewImg = container.querySelector('.sastra-photo-preview');
    const cameraActions = container.querySelector('.sastra-camera-actions');
    const startCameraBtn = container.querySelector('.btn-start-camera');
    const fileInput = container.querySelector('.sastra-file-foto-input');
    const removeBtn = container.querySelector('.btn-remove-foto');
    const gantiBtn = container.querySelector('.btn-ganti-foto');
    const hiddenInput = container.querySelector('#sastra_foto_narasumber_input');

    let currentStream = null;

    // B. SAAT EDIT ENTRI LAMA (foto sudah ada):
    if (hiddenInput && hiddenInput.value) {
      previewImg.src = hiddenInput.value;
      previewWrap.style.display = '';
      cameraActions.style.display = 'none';
    }

    // C. KLIK "📸 Buka Kamera Live":
    if (startCameraBtn) {
      startCameraBtn.addEventListener('click', () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 800 } }
          })
          .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
            videoWrap.style.display = '';
            cameraActions.style.display = 'none';
          })
          .catch(err => {
            alert('Kamera tidak tersedia: ' + err.message + '\nSilakan pilih dari galeri.');
          });
        } else {
          alert('Browser Anda tidak mendukung kamera langsung. Silakan pilih dari galeri.');
        }
      });
    }

    // D. KLIK TOMBOL CAPTURE (📷):
    if (captureBtn) {
      captureBtn.addEventListener('click', () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);

          // Kompresi jika lebar > 800
          if (canvas.width > 800) {
            const scale = 800 / canvas.width;
            canvas.width = 800;
            canvas.height = canvas.height * scale;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }

          canvas.toBlob(blob => {
            const reader = new FileReader();
            reader.onload = () => {
              hiddenInput.value = reader.result;
              previewImg.src = reader.result;
              previewWrap.style.display = '';
              videoWrap.style.display = 'none';
              cameraActions.style.display = 'none';
              scheduleAutoSave();
            };
            reader.readAsDataURL(blob);
          }, 'image/jpeg', 0.7);

          // Stop stream
          if (currentStream) {
            currentStream.getTracks().forEach(t => t.stop());
            currentStream = null;
          }
        }
      });
    }

    // E. INPUT FILE GALERI (.sastra-file-foto-input):
    if (fileInput) {
      fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 800;
          let w = img.width, h = img.height;
          if (w > maxSize) {
            h = h * maxSize / w;
            w = maxSize;
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          canvas.toBlob(blob => {
            const reader = new FileReader();
            reader.onload = () => {
              hiddenInput.value = reader.result;
              previewImg.src = reader.result;
              previewWrap.style.display = '';
              cameraActions.style.display = 'none';
              scheduleAutoSave();
            };
            reader.readAsDataURL(blob);
          }, 'image/jpeg', 0.7);
        };
        img.src = URL.createObjectURL(file);
      });
    }

    // F. TOMBOL "Hapus Foto":
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        hiddenInput.value = '';
        previewWrap.style.display = 'none';
        cameraActions.style.display = '';
        scheduleAutoSave();
      });
    }

    // G. TOMBOL "Ganti Foto":
    if (gantiBtn) {
      gantiBtn.addEventListener('click', () => {
        previewWrap.style.display = 'none';
        cameraActions.style.display = '';
      });
    }

    // H. SAAT KLIK "< KEMBALI" (stop stream):
    const backBtn = container.querySelector('#btnSastraBack');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (currentStream) {
          currentStream.getTracks().forEach(t => t.stop());
          currentStream = null;
        }
      });
    }
  }

  function applyConditionalLogic(container) {
    const inputs = container.querySelectorAll('.sastra-input');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        const id = input.dataset.key;
        const val = input.value;
        const dependents = container.querySelectorAll(`[data-depends-on="${id}"]`);
        dependents.forEach(dep => {
          if (val === dep.dataset.dependsValue) {
            dep.style.display = 'block';
          } else {
            dep.style.display = 'none';
            const depInput = dep.querySelector('.sastra-input');
            if(depInput) {
              depInput.value = '';
              // Also update any nested preset buttons
              const group = dep.querySelector(`.preset-group[data-for="${depInput.dataset.key}"]`);
              if (group) {
                group.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
              }
            }
          }
        });
      });
    });
  }

  function openForm(existingData) {
    const container = document.getElementById('sastraAppContainer');
    container.innerHTML = buildFormHTML();

    currentSastraData = existingData || { id: Date.now(), status: 'draft', fotoBlobs: [] };
    if (!existingData) {
      const now = new Date();
      const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      };
      let dateStr = now.toLocaleDateString('id-ID', options);
      const tzOffset = now.getTimezoneOffset();
      if (tzOffset === -420) {
        dateStr += ' WIB';
      } else if (tzOffset === -480) {
        dateStr += ' WITA';
      } else if (tzOffset === -540) {
        dateStr += ' WIT';
      }
      currentSastraData.sastra_pengambil_tanggal = dateStr;
    }

    const inputs = container.querySelectorAll('.sastra-input');
    inputs.forEach(input => {
      const key = input.dataset.key;
      if (currentSastraData[key] !== undefined) {
        input.value = currentSastraData[key];
        const fieldDef = SASTRA_FIELDS.find(f => f.id === key);
        if (fieldDef && fieldDef.type === 'date' && input.value) {
          input.type = 'date';
        }
        // Set preset button active state
        const group = container.querySelector(`.preset-group[data-for="${key}"]`);
        if (group) {
          group.querySelectorAll('.preset-btn').forEach(btn => {
            if (btn.dataset.value === String(input.value)) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          });
        }
      }
    });
    
    const statusInput = container.querySelector('#sastra_status_input');
    if (statusInput) statusInput.value = currentSastraData.status || 'draft';

    inputs.forEach(input => {
      if (input.tagName === 'SELECT' || input.type === 'hidden') {
        const e = new Event('change');
        input.dispatchEvent(e);
      }
    });

    applyConditionalLogic(container);
    renderGallery(container);
    renderAudioVideoStatus(container);
    initCameraField(container);

    // Preset button click listener
    container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.closest('.preset-group');
        const key = group.dataset.for;
        const hiddenInput = container.querySelector(`.sastra-input[data-key="${key}"]`);
        if (hiddenInput) {
          hiddenInput.value = btn.dataset.value;
          group.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
          hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });

    inputs.forEach(input => {
      input.addEventListener('input', scheduleAutoSave);
      input.addEventListener('change', scheduleAutoSave);
    });
    if (statusInput) statusInput.addEventListener('change', scheduleAutoSave);

    container.querySelector('#btnSastraBack').addEventListener('click', () => {
      doSaveSastra();
      initSastraUI();
    });

    const btnGps = container.querySelector('#btnSastraGPS');
    if (btnGps) {
      btnGps.addEventListener('click', () => {
        if (!navigator.geolocation) { alert('GPS tidak didukung.'); return; }
        btnGps.textContent = 'Mencari...';
        navigator.geolocation.getCurrentPosition(
          pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const gpsInput = container.querySelector('[data-key="sastra_lokasi_koordinat"]');
            if (gpsInput) {
              gpsInput.value = `${lat}, ${lon}`;
              gpsInput.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
              gpsInput.addEventListener('input', () => { gpsInput.style.backgroundColor = ''; }, { once: true });
            }
            btnGps.textContent = 'Ambil GPS';
            scheduleAutoSave();

            // Reverse Geocoding via Nominatim dengan timeout 5 detik
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
              headers: { 'User-Agent': 'Apsara-Peta/1.0' },
              signal: controller.signal
            })
            .then(res => res.json())
            .then(data => {
              clearTimeout(timeoutId);
              if (data && data.address) {
                const addr = data.address;
                const prov = addr.state || '';
                const kab = addr.city || addr.regency || addr.county || '';
                const kec = addr.suburb || addr.municipality || addr.district || addr.subdistrict || addr.village || addr.town || '';
                const desa = addr.village || addr.hamlet || addr.neighbourhood || addr.suburb || '';
                const kodepos = addr.postcode || '';

                const fields = {
                  sastra_lokasi_provinsi: prov,
                  sastra_lokasi_kabupaten: kab,
                  sastra_lokasi_kecamatan: kec,
                  sastra_lokasi_desa: desa,
                  sastra_lokasi_kodepos: kodepos
                };

                Object.keys(fields).forEach(key => {
                  const input = container.querySelector(`[data-key="${key}"]`);
                  if (input && fields[key]) {
                    input.value = fields[key];
                    input.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                    const resetBg = () => { input.style.backgroundColor = ''; };
                    input.addEventListener('input', resetBg, { once: true });
                    input.addEventListener('change', resetBg, { once: true });
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                });

                if (window.ApsaraAPI && typeof window.ApsaraAPI.toast === 'function') {
                  window.ApsaraAPI.toast('Lokasi terisi otomatis');
                } else {
                  console.log('Lokasi terisi otomatis');
                }
                scheduleAutoSave();
              }
            })
            .catch(err => {
              clearTimeout(timeoutId);
              if (window.ApsaraAPI && typeof window.ApsaraAPI.toast === 'function') {
                window.ApsaraAPI.toast('Koordinat tersimpan. Isi alamat manual jika diperlukan.');
              } else {
                console.log('Koordinat tersimpan. Isi alamat manual jika diperlukan.');
              }
            });
          },
          err => { alert('Gagal ambil GPS: ' + err.message); btnGps.textContent = 'Ambil GPS'; },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    }

    const btnTanggal = container.querySelector('#btnSastraTanggal');
    if (btnTanggal) {
      btnTanggal.addEventListener('click', () => {
        const tglInput = container.querySelector('[data-key="sastra_pengambil_tanggal"]');
        if (tglInput) {
          const now = new Date();
          const options = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          };
          let dateStr = now.toLocaleDateString('id-ID', options);
          const tzOffset = now.getTimezoneOffset();
          if (tzOffset === -420) {
            dateStr += ' WIB';
          } else if (tzOffset === -480) {
            dateStr += ' WITA';
          } else if (tzOffset === -540) {
            dateStr += ' WIT';
          }
          tglInput.value = dateStr;
          scheduleAutoSave();
        }
      });
    }

    // Kalkulasi Usia Otomatis dari Tanggal Lahir
    const tglLahirInput = container.querySelector('[data-key="sastra_tanggal_lahir"]');
    const usiaInput = container.querySelector('[data-key="sastra_usia"]');
    if (tglLahirInput && usiaInput) {
      const hitungUsia = () => {
        const lahir = new Date(tglLahirInput.value);
        if (isNaN(lahir.getTime())) return;
        const hariIni = new Date();
        let usia = hariIni.getFullYear() - lahir.getFullYear();
        const bulanIni = hariIni.getMonth() - lahir.getMonth();
        if (bulanIni < 0 || (bulanIni === 0 && hariIni.getDate() < lahir.getDate())) {
          usia--;
        }
        usiaInput.value = usia;
        scheduleAutoSave();
      };

      tglLahirInput.addEventListener('change', () => {
        hitungUsia();
        usiaInput.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
      });

      if (tglLahirInput.value) {
        hitungUsia();
      }
    }

    container.querySelector('#sastra_foto_input').addEventListener('change', handleFotoUpload);
    container.querySelector('#sastra_audio_input').addEventListener('change', handleAudioUpload);
    container.querySelector('#sastra_video_input').addEventListener('change', handleVideoUpload);
  }

  function handleFotoUpload(e) {
    const files = e.target.files;
    if (!files.length) return;
    currentSastraData.fotoBlobs = currentSastraData.fotoBlobs || [];
    
    Array.from(files).forEach(file => {
      currentSastraData.fotoBlobs.push(file);
    });
    renderGallery(document.getElementById('sastraAppContainer'));
    scheduleAutoSave();
    e.target.value = '';
  }

  function handleAudioUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    currentSastraData.audioBlob = file;
    renderAudioVideoStatus(document.getElementById('sastraAppContainer'));
    scheduleAutoSave();
  }

  function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    currentSastraData.videoBlob = file;
    renderAudioVideoStatus(document.getElementById('sastraAppContainer'));
    scheduleAutoSave();
  }

  function renderGallery(container) {
    const gallery = container.querySelector('#sastra_foto_gallery');
    if (!gallery) return;
    gallery.innerHTML = '';
    const fotos = currentSastraData.fotoBlobs || [];
    fotos.forEach((blob, index) => {
      const url = URL.createObjectURL(blob);
      const div = document.createElement('div');
      div.className = 'sastra-gallery-item';
      div.innerHTML = `
        <img src="${url}">
        <button type="button" class="btn-remove" data-index="${index}">[x]</button>
      `;
      gallery.appendChild(div);
    });

    gallery.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.dataset.index);
        currentSastraData.fotoBlobs.splice(idx, 1);
        renderGallery(container);
        scheduleAutoSave();
      });
    });
  }

  function renderAudioVideoStatus(container) {
    const aStat = container.querySelector('#sastra_audio_status');
    const vStat = container.querySelector('#sastra_video_status');
    if (aStat) aStat.textContent = currentSastraData.audioBlob ? 'Audio terlampir (' + Math.round(currentSastraData.audioBlob.size/1024) + ' KB)' : '';
    if (vStat) vStat.textContent = currentSastraData.videoBlob ? 'Video terlampir (' + Math.round(currentSastraData.videoBlob.size/1024) + ' KB)' : '';
  }

  function scheduleAutoSave() {
    if (autoSaveInterval) clearTimeout(autoSaveInterval);
    autoSaveInterval = setTimeout(() => {
      doSaveSastra();
    }, 1500);
  }

  function doSaveSastra() {
    if (!currentSastraData) return;
    const container = document.getElementById('sastraAppContainer');
    if (!container) return;
    
    const inputs = container.querySelectorAll('.sastra-input');
    inputs.forEach(input => {
      currentSastraData[input.dataset.key] = input.value;
    });
    
    const statusInput = container.querySelector('#sastra_status_input');
    if(statusInput) currentSastraData.status = statusInput.value;

    saveSastraToDB(currentSastraData).then(() => {
      const ind = container.querySelector('#sastraSaveIndicator');
      if (ind) {
        ind.style.opacity = '1';
        setTimeout(() => { ind.style.opacity = '0'; }, 2000);
      }
    });
  }

  async function initSastraUI() {
    const container = document.getElementById('sastraAppContainer');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center; padding: 40px; color:var(--ink-muted);">Memuat data...</div>';
    
    const data = await getAllSastra();
    cachedListData = data;
    renderListView(container, data);
  }

  window.addEventListener('DOMContentLoaded', () => {
    const tabBahasa = document.getElementById('tabAppBahasa');
    const tabSastra = document.getElementById('tabAppSastra');
    const viewBahasa = document.getElementById('view-bahasa');
    const viewSastra = document.getElementById('view-sastra');

    if (tabBahasa && tabSastra) {
      tabBahasa.addEventListener('click', () => {
        tabBahasa.classList.add('active'); tabSastra.classList.remove('active');
        viewBahasa.classList.add('active'); viewSastra.classList.remove('active');
        viewBahasa.style.display = ''; // Force remove inline none
        viewSastra.style.display = 'none'; // Force hide view-sastra
      });
      tabSastra.addEventListener('click', () => {
        tabSastra.classList.add('active'); tabBahasa.classList.remove('active');
        viewSastra.classList.add('active'); viewBahasa.classList.remove('active');
        viewSastra.style.display = 'block'; // Secara paksa tampilkan
        viewBahasa.style.display = 'none';
        initSastraUI();
      });
    }
  });

})();
