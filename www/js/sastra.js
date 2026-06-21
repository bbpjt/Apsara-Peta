(function() {
  const DB_NAME = 'BerianDB_v1';
  const STORE_SASTRA = 'sastra_data';
  let dbSastra = null;
  let currentSastraData = null;
  let autoSaveInterval = null;

  function toast(msg) { if (window.ApsaraAPI && typeof window.ApsaraAPI.toast === 'function') window.ApsaraAPI.toast(msg); else console.log(msg); }

  // =========================================================
  //  GAYA
  // =========================================================
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .preset-group { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 10px 0; }
    .preset-btn { padding: 5px 12px; font-size: 12px; border-radius: 6px; background: var(--paper-tint); color: var(--ink); border: 1px solid var(--line); cursor: pointer; transition: all 0.15s ease; }
    .preset-btn:hover { background: var(--krem); }
    .preset-btn.active { background: var(--krem); color: var(--emas-tua); border-color: var(--emas); font-weight: 600; }
    .sub-fields { margin-left: 14px; padding-left: 12px; border-left: 2px solid var(--krem); }
    .kemajuan-bar { width: 100%; height: 6px; background: var(--line); border-radius: 3px; overflow: hidden; margin: 4px 0 2px 0; }
    .kemajuan-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
    .kemajuan-text { font-size: 10px; color: var(--ink-muted); font-family: var(--mono); }
    input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 1; display: block; }

    .sastra-card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-md); padding: 12px 14px; margin-bottom: 10px; transition: box-shadow 0.2s ease, transform 0.15s ease; cursor: pointer; }
    .sastra-card:hover { box-shadow: var(--sh-2); transform: translateY(-1px); }
    .sastra-card-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px; }
    .sastra-card-subtitle { font-size: 12px; color: var(--ink-muted); font-style: italic; margin-bottom: 4px; }
    .sastra-card-meta { font-size: 11px; color: var(--ink-faint); margin-bottom: 8px; font-family: var(--mono); }
    .sastra-card-actions { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
    .btn-edit-sastra, .btn-hapus-sastra, .btn-duplikat-sastra { padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 6px; cursor: pointer; }
    .btn-edit-sastra { background: var(--paper-tint); color: var(--ink); border: 1px solid var(--line); }
    .btn-hapus-sastra { background: var(--merah-soft); color: var(--merah); border: 1px solid color-mix(in oklch, var(--merah) 30%, transparent); }
    .btn-duplikat-sastra { background: var(--krem); color: var(--emas-tua); border: 1px solid color-mix(in oklch, var(--emas) 30%, transparent); }

    .genre-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 100px; color: #fff; line-height: 1.3; }
    .genre-badge svg { display: block; }
    .genre-badge.lainnya { background: var(--ink-muted); }
    .konteks-chip { font-family: var(--mono); font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; padding: 3px 8px; border-radius: 100px; border: 1px solid var(--line-strong); color: var(--ink-muted); }

    .sastra-filter-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }

    .sastra-multi { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 8px 0; }
    .sastra-multi label { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; font-size: 12px; border: 1px solid var(--line); border-radius: 6px; background: var(--paper-tint); cursor: pointer; }
    .sastra-multi input { accent-color: var(--emas); cursor: pointer; }

    .sastra-hint { font-size: 12px; color: var(--ink-muted); font-style: italic; padding: 10px 12px; border: 1px dashed var(--line-strong); border-radius: var(--r-sm); background: var(--paper-deep); }
    .field-info { margin-top: 6px; font-size: 11px; line-height: 1.55; color: var(--ink-soft); background: var(--paper-deep); border: 1px solid var(--line); border-left: 3px solid var(--emas); border-radius: var(--r-sm); padding: 8px 10px; }
    .field-info strong { color: var(--emas-tua); font-weight: 700; }
    .field-info .fi-head { display: inline-flex; align-items: center; gap: 5px; }
    .panduan-lengkap { margin-top: 6px; border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--paper-deep); }
    .panduan-lengkap > summary { cursor: pointer; list-style: none; padding: 8px 10px; font-size: 11px; font-weight: 700; color: var(--biru); display: flex; align-items: center; gap: 6px; user-select: none; }
    .panduan-lengkap > summary::-webkit-details-marker { display: none; }
    .panduan-lengkap > summary:hover { color: var(--cokelat); }
    .panduan-body { padding: 2px 8px 8px; max-height: 320px; overflow-y: auto; }
    .panduan-item { font-size: 11px; line-height: 1.5; padding: 6px 8px; border-radius: 6px; cursor: pointer; border-bottom: 1px solid var(--line); }
    .panduan-item:last-child { border-bottom: none; }
    .panduan-item:hover { background: var(--krem); }
    .panduan-name { font-weight: 700; color: var(--ink); }
    .panduan-item em { color: var(--ink-muted); font-style: italic; }

    .genre-key-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 10px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--paper-deep); }
    .genre-key-ico { width: 34px; height: 34px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; color: #fff; flex: 0 0 34px; }
    .genre-key-text { font-family: var(--display); font-weight: 600; font-size: 15px; color: var(--ink); }
    .genre-key-sub { font-size: 11px; color: var(--ink-muted); font-family: var(--mono); }

    .rec-block { margin-bottom: 18px; }
    .rec-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 6px 0; }
    .rec-video-preview { width: 100%; max-width: 360px; border-radius: var(--r-md); background: #000; display: none; margin: 8px 0; }
    .rec-timer { font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--ink-muted); }
    .rec-size { font-family: var(--mono); font-size: 11px; color: var(--ink-muted); }
    .rec-level { width: 90px; height: 6px; background: var(--line); border-radius: 3px; overflow: hidden; }
    .rec-level-bar { height: 100%; width: 0%; background: var(--hijau); transition: width 0.08s linear; }
    .rec-playback { margin-top: 8px; }
    .rec-playback audio, .rec-playback video { width: 100%; max-width: 360px; display: block; }
    .rec-pb-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
    .btn-rec-toggle { display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: var(--r-md); background: var(--hijau); color: #fff; font-weight: 700; font-size: 12.5px; cursor: pointer; border: none; transition: background 0.2s ease, transform 0.12s ease; }
    .btn-rec-toggle:hover { transform: translateY(-1px); }
    .btn-rec-toggle.recording { background: var(--merah); animation: rec-pulse 1.6s infinite; }
    .btn-rec-toggle .rec-dot { width: 9px; height: 9px; border-radius: 50%; background: currentColor; }
    @keyframes rec-pulse { 0%,100% { box-shadow: 0 0 0 0 color-mix(in oklch, var(--merah) 50%, transparent); } 70% { box-shadow: 0 0 0 10px transparent; } }
    .btn-media-del { padding: 6px 10px; font-size: 11px; font-weight: 600; border-radius: 6px; cursor: pointer; background: var(--merah-soft); color: var(--merah); border: 1px solid color-mix(in oklch, var(--merah) 30%, transparent); }
    .sastra-upload-label { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; font-size: 11.5px; font-weight: 600; border: 1px solid var(--line-strong); border-radius: var(--r-sm); background: var(--paper-deep); cursor: pointer; }
    .sastra-gallery { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .sastra-gallery-item { position: relative; }
    .sastra-gallery-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid var(--line); }
    .sastra-gallery-item .btn-remove { position: absolute; top: -6px; right: -6px; background: var(--merah); color: #fff; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; border: 2px solid var(--paper); }
  `;
  document.head.appendChild(styleEl);

  let cachedListData = [];
  let currentFilter = 'semua';
  let currentFilterGenre = 'semua';
  let currentFilterKonteks = 'semua';
  let openSectionKey = 'A'; // seksi yang sedang terbuka (dipertahankan saat form dibangun ulang)

  // =========================================================
  //  IKON SVG MONOLINE — stroke=currentColor, kontekstual nusantara
  // =========================================================
  const ICON_PATHS = {
    // Cerita Rakyat — gulungan/lontar terbuka
    cerita_rakyat: '<path d="M4 6a2 2 0 0 1 2-2h9v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M15 4a2 2 0 0 1 2 2v11a2 2 0 0 0 2 2"/><path d="M7.5 8h4M7.5 11h4"/>',
    // Puisi Rakyat — stylus/quill + baris teks
    puisi_rakyat: '<path d="M19 4c-7 0-12 5-12 12l-2 3"/><path d="M7 16c6 0 11-4 12-10"/><path d="M4 21h7"/>',
    // Nyanyian Rakyat — gelombang suara
    nyanyian_rakyat: '<path d="M4 10v4M8 6.5v11M12 4v16M16 6.5v11M20 10v4"/>',
    // Ungkapan Tradisional — awan bicara
    ungkapan_tradisional: '<path d="M21 11.5a8 7 0 0 1-8 7H8l-4 3v-4.6A8 7 0 1 1 21 11.5z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>',
    // Teka-teki — tanda tanya dalam bingkai
    teka_teki: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9.5 9.3a2.6 2.6 0 1 1 3.7 2.4c-.9.4-1.2 1-1.2 1.8"/><path d="M12 16.6h.01"/>',
    // Teater / Drama — topeng stilasi
    drama: '<path d="M3 5h8v4a4 4 0 0 1-8 0z"/><path d="M5.5 6.6h.01M8.5 6.6h.01"/><path d="M13 8h8v4a4 4 0 0 1-8 0z"/><path d="M15.5 9.6h.01M18.5 9.6h.01"/>',
    // Lainnya / netral
    lainnya: '<circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/>',
  };
  function svgIcon(key, size, color) {
    const p = ICON_PATHS[key] || ICON_PATHS.lainnya;
    return `<svg viewBox="0 0 24 24" width="${size || 22}" height="${size || 22}" fill="none" stroke="${color || 'currentColor'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  }
  function infoIcon(size) {
    return `<svg viewBox="0 0 24 24" width="${size || 14}" height="${size || 14}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>`;
  }
  // Daftar lengkap sub-genre satu genre (referensi cepat; tiap baris bisa diklik)
  function panduanLengkapHTML(genre) {
    const map = (typeof SUBGENRE_INFO !== 'undefined' && SUBGENRE_INFO[genre]) || {};
    const list = (SUB_GENRES[genre] || []).filter(s => s !== 'Lainnya');
    if (!list.length) return '';
    const label = GENRES[genre] ? GENRES[genre].label : '';
    const items = list.map(s => {
      const i = map[s];
      const ciri = i ? i.ciri : '';
      const contoh = i && i.contoh ? ` <em>${i.contoh}</em>` : '';
      return `<div class="panduan-item" data-sub="${s}"><span class="panduan-name">${s}</span> — ${ciri}.${contoh}</div>`;
    }).join('');
    return `<details class="panduan-lengkap"><summary>${infoIcon(13)} Lihat semua jenis ${label} (${list.length})</summary><div class="panduan-body">${items}</div></details>`;
  }

  // =========================================================
  //  GENRE (Hutomo/Danandjaja/Bascom) — warna dari token tema
  // =========================================================
  const GENRES = {
    cerita_rakyat:        { label: 'Cerita Rakyat',         code: 'NAR',      color: 'var(--biru)',    sifat: 'Berisi alur, tokoh, dan peristiwa (prosa naratif)', desc: 'mite, legenda, dongeng, hikayat, epos, babad, kaba' },
    puisi_rakyat:         { label: 'Puisi Rakyat',          code: 'PUISI',    color: 'var(--emas-tua)', sifat: 'Berirama, berpola bunyi, tersusun dalam larik/bait', desc: 'pantun, syair, gurindam, tembang, mantra' },
    nyanyian_rakyat:      { label: 'Nyanyian Rakyat',       code: 'NYANYI',   color: 'var(--hijau)',   sifat: 'Dilagukan, memiliki melodi', desc: 'lagu daerah, dolanan, dendang, salawat' },
    ungkapan_tradisional: { label: 'Ungkapan Tradisional',  code: 'UNGKAPAN', color: 'var(--cokelat)', sifat: 'Pendek, fungsional, berbentuk formula', desc: 'peribahasa, umpasa, bidalan, pamali' },
    teka_teki:            { label: 'Teka-teki Tradisional', code: 'TEKATEKI', color: 'var(--merah)',   sifat: 'Berbentuk pertanyaan-penjawab', desc: 'cangkriman, teka-teki, wawangsalan' },
    drama:                { label: 'Teater / Drama Rakyat', code: 'DRAMA',    color: 'color-mix(in oklch, var(--biru) 50%, var(--merah))', sifat: 'Pertunjukan hidup, multidimensi', desc: 'wayang, ludruk, ketoprak, randai, lenong' },
  };
  const GENRE_ALIAS = {
    cerita_naratif: 'cerita_rakyat', puisi_lisan: 'puisi_rakyat', tembang_nyanyian: 'nyanyian_rakyat',
    pertunjukan_drama: 'drama', teater_rakyat: 'drama', lelucon_parodi: 'cerita_rakyat', campuran: 'drama',
  };
  const KONTEKS_LABELS = { pertunjukan: 'Pertunjukan', teks: 'Murni Teks / Tuturan' };

  const SUB_GENRES = {
    cerita_rakyat: ['Mite (Mitos)', 'Legenda', 'Sage (Saga)', 'Hikayat', 'Epos / Wiracarita', 'Cerita Panji', 'Babad', 'Riwayat / Silsilah', 'Kaba', 'Dongeng Biasa', 'Fabel (Dongeng Binatang)', 'Dongeng Berumus', 'Dongeng Jenaka (Lelucon/Anekdot)', 'Cerita Pelipur Lara', 'Lainnya'],
    puisi_rakyat: ['Pantun', 'Pantun Berkembang', 'Pantun Dua Kerat', 'Talibun', 'Karmina', 'Paparikan', 'Sisindiran', 'Wawangsalan', 'Syair', 'Gurindam', 'Seloka', 'Nazam', 'Tembang Macapat', 'Kidung', 'Kekawin (Kakawin)', 'Geguritan', 'Pupuh', 'Gending', 'Mantra (Mantera)', 'Dikir Barat / Dikir', "Bai'ah / Baiah", 'Rarak', 'Belian', 'Lainnya'],
    nyanyian_rakyat: ['Lagu Daerah', 'Tembang Dolanan', 'Lagu Pengantar Tidur', 'Dendang', 'Lagu Ritual / Upacara', 'Nyanyian Kerja / Fungsional', 'Salawat', 'Keroncong Asli / Moresco', 'Lainnya'],
    ungkapan_tradisional: ['Peribahasa / Pepatah', 'Umpasa', 'Perbilangan', 'Bidalan', 'Pameo', 'Tamsil', 'Pantang Larang / Pamali', 'Julukan / Gelar Tradisional', 'Sapaan Tradisional', 'Ungkapan Kiasan / Sindiran', 'Lainnya'],
    teka_teki: ['Teka-teki Binatang', 'Teka-teki Alam / Tumbuhan', 'Teka-teki Benda / Alat', 'Teka-teki Tubuh / Manusia', 'Teka-teki Logika / Anekdot', 'Teka-teki Berbalas', 'Lainnya'],
    drama: ['Wayang Kulit', 'Wayang Golek', 'Wayang Krucil / Klithik', 'Wayang Beber', 'Wayang Orang / Wong', 'Wayang Suluh', 'Wayang Potehi', 'Ketoprak', 'Ludruk', 'Lenong', 'Topeng Betawi', 'Topeng Cirebon', 'Topeng Malangan', 'Topeng Bali', 'Randai', 'Arja', 'Gambuh', 'Sendratari', 'Drama Gong', 'Calonarang', 'Reog Ponorogo', 'Barongan', 'Kuda Lumping / Jaran Kepang', 'Srandul / Sandur', 'Kentrung', 'Babad Pertunjukan', 'Mamanda', 'Sinrilik', 'Mak Yong', 'Bangsawan / Opera Melayu', 'Komedi Stambul / Opera', 'Jemblung', 'Boria', 'Hadrah / Debus', 'Saman', 'Seudati', "Rapa'i Geleng", 'Didong', 'Tari Hudoq', 'Tari Perang', 'Maengket', 'Kabasaran', 'Masamper', 'Lenso / Cakalele', 'Likurai', 'Drama Tradisional Lain', 'Lainnya'],
  };

  const UNSUR_OPTIONS = ['Naratif (cerita/alur)', 'Puisi (syair, tembang, pantun)', 'Nyanyian / Vokal', 'Komedi / Dagelan', 'Musik / Iringan', 'Tari / Gerak', 'Ritual / Sakral', 'Dialog / Tutur'];

  // Panduan sub-genre (Bagian 3): { ciri, contoh } — ditampilkan saat dipilih
  const SUBGENRE_INFO = {
    cerita_rakyat: {
      'Mite (Mitos)': { ciri: 'Asal-usul alam, dewa, hal gaib; dianggap benar & sakral', contoh: 'Asal-usul Danau Toba (Batak), Sangkuriang (Sunda), Aji Saka & Nyi Roro Kidul (Jawa), Batara Guru (Bugis), Nunusaku (Maluku)' },
      'Legenda': { ciri: 'Asal-usul tempat/nama/fenomena alam; setengah dipercaya', contoh: 'Malin Kundang (Minang), Tangkuban Perahu (Sunda), Rawa Pening (Jawa), Danau Kelimutu (Flores), Danau Sentani (Papua)' },
      'Sage (Saga)': { ciri: 'Berlatar tokoh/sejarah bercampur fiksi', contoh: 'Panji (Jawa), Hang Tuah (Melayu), Si Pahit Lidah (Minang), Sawerigading (Bugis), Cut Nyak Dhien (Aceh)' },
      'Hikayat': { ciri: 'Cerita prosa panjang, sering pengaruh Melayu/Islam', contoh: 'Hikayat Hang Tuah, Hikayat Seri Rama, Hikayat Raja-raja Pasai (Aceh), Hikayat Banjar' },
      'Epos / Wiracarita': { ciri: 'Cerita panjang bersifat epik, tokoh heroik', contoh: 'Ramayana & Mahabharata (Jawa/Bali), I La Galigo (Bugis/Makassar — epos terpanjang dunia), Sutasoma (Jawa)' },
      'Cerita Panji': { ciri: 'Sub-epos Jawa, tokoh Panji Inu Kertapati', contoh: 'Panji Semirang, Ande-Ande Lumut (Jatim), Galuh Chandrakirana, Panji Malat (Bali)' },
      'Babad': { ciri: 'Kronik/tradisi sejarah Jawa', contoh: 'Babad Tanah Jawi, Babad Pajajaran, Babad Diponegoro, Babad Cirebon' },
      'Riwayat / Silsilah': { ciri: 'Asal-usul keturunan / genealogi', contoh: 'Tambo Alam Minangkabau, Silsilah Raja Gowa-Tallo (Sulsel), Kesultanan Kutai, Ternate/Tidore' },
      'Kaba': { ciri: 'Cerita prosa panjang Minangkabau', contoh: 'Kaba Cindua Mato, Kaba Anggun Nan Tungga, Kaba Rancak di Labuah (Minang)' },
      'Dongeng Biasa': { ciri: 'Cerita fiksi, tidak dianggap benar', contoh: 'Timun Mas & Keong Emas (Jawa), Bawang Merah Bawang Putih (Melayu/Sunda), Jaka Tarub (Jawa)' },
      'Fabel (Dongeng Binatang)': { ciri: 'Tokoh binatang berperilaku manusia', contoh: 'Kancil (Jawa/Melayu), Burung Enggang (Dayak), Sigarlaki & Si Limbat (Sangihe), Burung Cendrawasih (Papua)' },
      'Dongeng Berumus': { ciri: 'Mengandung pola/pengulangan formula', contoh: 'Sangkuriang (formula angka), Timun Mas (hadiah bertahap), Putri Tandampalik (Makassar)' },
      'Dongeng Jenaka (Lelucon/Anekdot)': { ciri: 'Humoris, menghibur, sering menyindir', contoh: 'Si Kabayan (Sunda), Pak Pandir & Pak Belalang (Melayu), Abu Nawas (Melayu/Jawa), Si Lebai Malang (Minang)' },
      'Cerita Pelipur Lara': { ciri: 'Pengantar tidur, cerita ibu/anak', contoh: 'Dongeng sebelum tidur, cerita binatang penghibur (berbagai daerah)' },
    },
    puisi_rakyat: {
      'Pantun': { ciri: 'Empat larik, sajak a-b-a-b, sampiran-isi', contoh: 'Melayu (Riau, Jambi, Palembang), Minang, Betawi, Banjar, Bugis, Sunda' },
      'Pantun Berkembang': { ciri: 'Dua larik, sajak a-b', contoh: 'Melayu' },
      'Pantun Dua Kerat': { ciri: 'Dua baris', contoh: 'Melayu' },
      'Talibun': { ciri: 'Enam/8/10 baris bersajak', contoh: 'Melayu' },
      'Karmina': { ciri: 'Pantun kilat dua larik', contoh: 'Jawa' },
      'Paparikan': { ciri: 'Mirip pantun', contoh: 'Sunda' },
      'Sisindiran': { ciri: 'Pantun Sunda, sampiran-isi', contoh: 'Sunda' },
      'Wawangsalan': { ciri: 'Teka-teki berbentuk puisi', contoh: 'Sunda' },
      'Syair': { ciri: 'Empat larik bersajak a-a-a-a, semua isi', contoh: 'Melayu (Riau, Palembang), Aceh, Bugis, Banjar' },
      'Gurindam': { ciri: 'Dua larik bersajak a-a, berisi nasihat', contoh: 'Melayu Riau (Gurindam Dua Belas)' },
      'Seloka': { ciri: 'Empat larik bersajak, sindiran', contoh: 'Melayu' },
      'Nazam': { ciri: 'Puisi bersajak khas Aceh', contoh: 'Aceh' },
      'Tembang Macapat': { ciri: 'Sistem metrum Jawa (Maskumambang, Sinom, Kinanthi, Asmaradana, Pangkur, Pocung, dll.)', contoh: 'Jawa (Jateng, Jatim, DIY), Bali' },
      'Kidung': { ciri: 'Puisi berirama Jawa Kuno/Bali', contoh: 'Jawa, Bali' },
      'Kekawin (Kakawin)': { ciri: 'Puisi Jawa Kuno/Bali bermetrum India', contoh: 'Bali, Jawa Kuno' },
      'Geguritan': { ciri: 'Puisi bebas Jawa/Bali', contoh: 'Jawa, Bali' },
      'Pupuh': { ciri: 'Sistem metrum Sunda (Kinanti, Sinom, Asmarandana, Dangdanggula, dll.)', contoh: 'Sunda' },
      'Gending': { ciri: 'Puisi/lagu Bali', contoh: 'Bali' },
      'Mantra (Mantera)': { ciri: 'Formula ritual, pengobatan, perlindungan', contoh: 'Rapal (Jawa), Rajah (Sunda), mantera bawian (Dayak), jappi (Bugis) — semua suku' },
      'Dikir Barat / Dikir': { ciri: 'Puisi Melayu berbalas', contoh: 'Riau, Melayu' },
      "Bai'ah / Baiah": { ciri: 'Sumpah/janji adat', contoh: 'Minangkabau' },
      'Rarak': { ciri: 'Puisi ritual Dayak', contoh: 'Dayak' },
      'Belian': { ciri: 'Mantera ritual Dayak', contoh: 'Dayak (Kalsel, Kalteng)' },
    },
    nyanyian_rakyat: {
      'Lagu Daerah': { ciri: 'Lagu rakyat bermelodi tetap', contoh: 'Cublak-Cublak Suweng (Jawa), Manuk Dadali (Sunda), Rasa Sayange (Maluku), Apuse (Papua), Angin Mamiri (Sulsel), Ampar-Ampar Pisang (Kalsel)' },
      'Tembang Dolanan': { ciri: 'Nyanyian permainan anak', contoh: 'Lir-Ilir, Jamuran (Jawa), Cing Cangkeling (Sunda), Jali-Jali (Betawi)' },
      'Lagu Pengantar Tidur': { ciri: 'Nyanyian menidurkan anak', contoh: 'Nina Bobo (Melayu), Suwe Ora Jamu (Jawa)' },
      'Dendang': { ciri: 'Nyanyian dengan iringan', contoh: 'Dendang Melayu, Kawih (Sunda), Dendang Minang, Dendang Aceh' },
      'Lagu Ritual / Upacara': { ciri: 'Nyanyian untuk upacara adat', contoh: 'Tortor (Batak), lagu kematian/ratapan (Toraja, Flores), lagu pengobatan (berbagai)' },
      'Nyanyian Kerja / Fungsional': { ciri: 'Nyanyian pengiring aktivitas', contoh: 'Lagu menumbuk padi, mendayung, memanen (Jawa, Sunda, Dayak)' },
      'Salawat': { ciri: 'Nyanyian pujian Islami', contoh: 'Salawat Dulang (Minang), Salawat Badar (Jawa), Hadrah, Marhaban' },
      'Keroncong Asli / Moresco': { ciri: 'Nyanyian akulturasi Portugis-Melayu', contoh: 'Keroncong Tugu (Betawi), Moresco (Maluku)' },
    },
    ungkapan_tradisional: {
      'Peribahasa / Pepatah': { ciri: 'Kalimat pendek berisi kebijaksanaan', contoh: 'Peribahasa Melayu, Pepatah Minang (Adat Basandi Syarak), Parikan (Jawa), Umpasa (Batak)' },
      'Umpasa': { ciri: 'Peribahasa/petuah Batak', contoh: 'Batak (Toba, Mandailing, Karo, Simalungun)' },
      'Perbilangan': { ciri: 'Peribahasa adat Minangkabau', contoh: 'Minangkabau' },
      'Bidalan': { ciri: 'Ungkapan sindiran halus', contoh: 'Melayu, Jawa, Sunda' },
      'Pameo': { ciri: 'Ungkapan populer/semboyan', contoh: 'Nasional/Melayu' },
      'Tamsil': { ciri: 'Perumpamaan', contoh: 'Melayu, Aceh, Minang' },
      'Pantang Larang / Pamali': { ciri: 'Larangan adat', contoh: 'Pamali (Sunda/Jawa), Tabu (Batak), Pantang (Dayak/Minang) — semua suku' },
      'Julukan / Gelar Tradisional': { ciri: 'Nama/julukan/gelar rakyat', contoh: 'Gelar adat Minang, nama kejawen (Jawa), gelar Bugis' },
      'Sapaan Tradisional': { ciri: 'Cara menyapa khas daerah', contoh: 'Mbak/Mas (Jawa), Uda/Uni (Minang), Amang/Inang (Batak)' },
      'Ungkapan Kiasan / Sindiran': { ciri: 'Metafora tradisional', contoh: '“Seperti katak di bawah tempurung” (Melayu), “Mikul dhuwur mendhem jero” (Jawa)' },
    },
    teka_teki: {
      'Teka-teki Binatang': { ciri: 'Teka-teki tentang hewan', contoh: 'Semua suku' },
      'Teka-teki Alam / Tumbuhan': { ciri: 'Tentang alam & tumbuhan', contoh: 'Semua suku' },
      'Teka-teki Benda / Alat': { ciri: 'Tentang benda sehari-hari', contoh: 'Semua suku' },
      'Teka-teki Tubuh / Manusia': { ciri: 'Tentang anggota tubuh', contoh: 'Semua suku' },
      'Teka-teki Logika / Anekdot': { ciri: 'Butuh pemikiran/jebakan', contoh: 'Semua suku' },
      'Teka-teki Berbalas': { ciri: 'Dilombakan/diadu', contoh: 'Batak, Jawa, Minang, Melayu (cangkriman, wangsalan)' },
    },
    drama: {
      'Wayang Kulit': { ciri: 'Boneka kulit, dalang, layar cahaya', contoh: 'Jawa, Bali, Sunda, Lombok' },
      'Wayang Golek': { ciri: 'Boneka kayu tiga dimensi', contoh: 'Sunda (Jabar), Jawa' },
      'Wayang Krucil / Klithik': { ciri: 'Wayang kayu tipis, cerita Panji', contoh: 'Jawa (Jateng, Jatim)' },
      'Wayang Beber': { ciri: 'Gulungan bergambar dibuka-buka (langka)', contoh: 'Jawa (Wonogiri, Pacitan)' },
      'Wayang Orang / Wong': { ciri: 'Manusia memerankan tokoh wayang', contoh: 'Jawa, Bali' },
      'Wayang Suluh': { ciri: 'Wayang modern, tokoh revolusi', contoh: 'Jawa' },
      'Wayang Potehi': { ciri: 'Boneka tangan Tionghoa-Jawa', contoh: 'Jawa, Bali' },
      'Ketoprak': { ciri: 'Drama panggung Jawa', contoh: 'Jawa (Jateng, Jatim, DIY)' },
      'Ludruk': { ciri: 'Drama komedi Jawa Timur', contoh: 'Jawa Timur' },
      'Lenong': { ciri: 'Teater rakyat Betawi', contoh: 'Betawi (DKI Jakarta)' },
      'Topeng Betawi': { ciri: 'Topeng/drama Betawi', contoh: 'Betawi' },
      'Topeng Cirebon': { ciri: 'Topeng/drama Cirebon', contoh: 'Cirebon (Jabar)' },
      'Topeng Malangan': { ciri: 'Topeng/drama Malang', contoh: 'Malang (Jatim)' },
      'Topeng Bali': { ciri: 'Topeng sakral/hiburan', contoh: 'Bali' },
      'Randai': { ciri: 'Teater tari-silat Minang', contoh: 'Minangkabau (Sumbar)' },
      'Arja': { ciri: 'Drama tari (opera) Bali', contoh: 'Bali' },
      'Gambuh': { ciri: 'Drama tari klasik Bali', contoh: 'Bali' },
      'Sendratari': { ciri: 'Drama tari tanpa dialog', contoh: 'Jawa, Bali' },
      'Drama Gong': { ciri: 'Drama Bali diiringi gong', contoh: 'Bali' },
      'Calonarang': { ciri: 'Drama tari magis Bali', contoh: 'Bali' },
      'Reog Ponorogo': { ciri: 'Teater tari topeng besar (dadak merak)', contoh: 'Ponorogo (Jatim)' },
      'Barongan': { ciri: 'Teater tari topeng', contoh: 'Jawa (Jateng)' },
      'Kuda Lumping / Jaran Kepang': { ciri: 'Tari trance berkuda anyaman', contoh: 'Jawa (Jateng, Jatim)' },
      'Srandul / Sandur': { ciri: 'Tari-drama rakyat', contoh: 'Jawa (Jateng)' },
      'Kentrung': { ciri: 'Tutur prosa + tembang diiringi rebana', contoh: 'Jawa (Jateng, Jatim)' },
      'Babad Pertunjukan': { ciri: 'Pembacaan babad/dongeng berirama', contoh: 'Jawa (Jateng)' },
      'Mamanda': { ciri: 'Teater rakyat Banjar', contoh: 'Kalimantan Selatan' },
      'Sinrilik': { ciri: 'Teater tutur epik Makassar', contoh: 'Sulawesi Selatan' },
      'Mak Yong': { ciri: 'Teater tari Melayu klasik', contoh: 'Riau, Sumatera' },
      'Bangsawan / Opera Melayu': { ciri: 'Teater istana Melayu', contoh: 'Melayu (Riau, Sumut, Kalbar)' },
      'Komedi Stambul / Opera': { ciri: 'Teater akulturasi Hindia', contoh: 'Melayu, Jawa' },
      'Jemblung': { ciri: 'Pertunjukan tutur/drama Banyumas', contoh: 'Jawa (Banyumas)' },
      'Boria': { ciri: 'Teater komedi Melayu', contoh: 'Melayu (Medan, Sumut)' },
      'Hadrah / Debus': { ciri: 'Teater Islami + atraksi kekebalan', contoh: 'Jawa, Sunda, Aceh, Banten' },
      'Saman': { ciri: 'Tari-drama syair Gayo/Aceh', contoh: 'Aceh' },
      'Seudati': { ciri: 'Tari-drama bersyair Aceh', contoh: 'Aceh' },
      "Rapa'i Geleng": { ciri: 'Tari perkusi berdrama Aceh', contoh: 'Aceh' },
      'Didong': { ciri: 'Seni tutur-drama Gayo', contoh: 'Gayo (Aceh)' },
      'Tari Hudoq': { ciri: 'Tari ritual bertopeng', contoh: 'Dayak (Kutai, Kaltim)' },
      'Tari Perang': { ciri: 'Tari/drama peperangan', contoh: 'Papua, NTT, Dayak' },
      'Maengket': { ciri: 'Tari-drama Minahasa', contoh: 'Minahasa (Sulut)' },
      'Kabasaran': { ciri: 'Tari perang/drama Minahasa', contoh: 'Minahasa (Sulut)' },
      'Masamper': { ciri: 'Nyanyi-drama kompetisi', contoh: 'Sangihe/Minahasa (Sulut)' },
      'Lenso / Cakalele': { ciri: 'Tari-drama perang Maluku', contoh: 'Maluku' },
      'Likurai': { ciri: 'Tari-drama Timor', contoh: 'Timor (NTT)' },
      'Drama Tradisional Lain': { ciri: 'Bentuk lokal spesifik', contoh: 'Berbagai daerah' },
    },
  };

  // =========================================================
  //  SEKSI A — DATA NARASUMBER (tetap)
  // =========================================================
  const NARA_FIELDS = [
    { id: 'sastra_nama',            label: 'Nama Narasumber',  type: 'text' },
    { id: 'sastra_foto_narasumber', label: 'Foto Narasumber',  type: 'camera' },
    { id: 'sastra_jk',              label: 'Jenis Kelamin',    type: 'preset', options: ['Laki-laki', 'Perempuan'] },
    { id: 'sastra_komunitas_ada',     label: 'Komunitas: Ada/Tidak', type: 'preset', options: ['Ada', 'Tidak'] },
    { id: 'sastra_komunitas_nama',    label: 'Nama Komunitas',       type: 'text',     dependsOn: 'sastra_komunitas_ada', dependsValue: 'Ada' },
    { id: 'sastra_komunitas_tgl',     label: 'Tanggal Pendirian',    type: 'date',     dependsOn: 'sastra_komunitas_ada', dependsValue: 'Ada' },
    { id: 'sastra_komunitas_pendiri', label: 'Nama Pendiri',         type: 'text',     dependsOn: 'sastra_komunitas_ada', dependsValue: 'Ada' },
    { id: 'sastra_komunitas_alamat',  label: 'Alamat Sekretariat',   type: 'textarea', dependsOn: 'sastra_komunitas_ada', dependsValue: 'Ada' },
    { id: 'sastra_tempat_lahir',    label: 'Tempat Lahir',     type: 'text', placeholder: 'Contoh: Semarang' },
    { id: 'sastra_tanggal_lahir',   label: 'Tanggal Lahir',    type: 'date' },
    { id: 'sastra_usia',            label: 'Usia (otomatis)',  type: 'number', readonly: true },
    { id: 'sastra_kategori_ns',     label: 'Kategori Narasumber', type: 'preset', options: ['Juru cerita/pendukung aktif', 'Bukan juru cerita/pendukung pasif'] },
    { id: 'sastra_pekerjaan',       label: 'Pekerjaan',        type: 'text' },
    { id: 'sastra_keahlian',        label: 'Keahlian Selain Pekerjaan', type: 'text' },
    { id: 'sastra_suku',            label: 'Suku Bangsa',      type: 'text' },
    { id: 'sastra_daerah_asal',     label: 'Daerah Asal Narasumber', type: 'text' },
    { id: 'sastra_bahasa_dikuasai', label: 'Bahasa yang Dikuasai', type: 'text' },
    { id: 'sastra_kondisi_fisik',   label: 'Kondisi Fisik Informan', type: 'text' },
    { id: 'nara_alamat',            label: 'Alamat Lengkap',   type: 'textarea', placeholder: 'Alamat lengkap narasumber...' },
    { id: 'nara_koordinat',         label: 'Titik Koordinat Narasumber (GPS)', type: 'gps' },
  ];

  // =========================================================
  //  SEKSI B — IDENTIFIKASI SASTRA LISAN (kunci formulir)
  // =========================================================
  function identFields(konteks, genre) {
    const subOpts = SUB_GENRES[genre] || [];
    const f = [
      { id: 'sastra_nama_sastra', label: 'B1. Nama Sastra Lisan', type: 'text', placeholder: 'mis. Syair Lampung Kuning, Sinrilik Pattingalloang' },
      { id: 'sastra_lokasi_desa',      label: 'B2a. Desa',       type: 'text' },
      { id: 'sastra_lokasi_kecamatan', label: 'B2b. Kecamatan',  type: 'text' },
      { id: 'sastra_lokasi_kabupaten', label: 'B2c. Kabupaten',  type: 'text' },
      { id: 'sastra_lokasi_provinsi',  label: 'B2d. Provinsi',   type: 'text' },
      { id: 'sastra_lokasi_pulau',     label: 'B2e. Pulau',      type: 'text' },
      { id: 'sastra_lokasi_koordinat', label: 'B2f. Koordinat GPS', type: 'gps' },
      { id: 'sastra_lokasi_waktu',     label: 'B2g. Waktu (otomatis dari GPS)', type: 'text', readonly: true },
      { id: 'konteks', label: 'B3. Konteks Penyampaian', type: 'preset', options: [
          { value: 'pertunjukan', label: 'Pertunjukan' },
          { value: 'teks',        label: 'Murni Teks / Tuturan' },
        ] },
      { id: 'genre', label: 'B4. Genre Utama', type: 'select', showInfo: 'genre', options: [
          ...Object.keys(GENRES).map(k => ({ value: k, label: GENRES[k].label })),
          { value: 'lainnya', label: 'Lainnya...' },
        ] },
      { id: 'genre_lain', label: 'B4b. Genre Lainnya (tulis manual)', type: 'text', dependsOn: 'genre', dependsValue: 'lainnya' },
    ];
    if (genre && genre !== 'lainnya' && subOpts.length) {
      f.push({ id: 'sub_genre', label: 'B5. Sub-genre', type: 'select', showInfo: 'subgenre', panduanGenre: genre, options: subOpts });
    }
    if (konteks === 'pertunjukan') {
      f.push({ id: 'unsur', label: 'B6. Unsur yang Terkandung (centang semua yang ada)', type: 'checkbox-multi', options: UNSUR_OPTIONS });
      f.push({ id: 'unsur_lain', label: 'B6b. Unsur Lainnya (jika ada)', type: 'text' });
    }
    f.push({ id: 'sastra_bahasa_sastra', label: 'B7. Bahasa yang Digunakan', type: 'text', placeholder: 'mis. Jawa halus, Melayu Palembang, Bugis Wajo' });
    f.push({ id: 'sastra_keterangan', label: 'B8. Catatan / Keterangan Tambahan', type: 'textarea' });
    return f;
  }

  // =========================================================
  //  SEKSI C — DATA KARYA (inti + per genre)
  // =========================================================
  const CORE_C_FIELDS = [
    { id: 'judul',        label: 'C1. Judul Karya',          type: 'text' },
    { id: 'pengarang',    label: 'C2. Pengarang / Pencipta (opsional)', type: 'text' },
    { id: 'sumber_tahun', label: 'C3. Sumber / Tahun Pertama (opsional)', type: 'text' },
    { id: 'tema',         label: 'C4. Tema / Isi Pokok',     type: 'textarea' },
    { id: 'bahasa_karya', label: 'C5. Bahasa Karya',         type: 'text' },
  ];
  const GENRE_C_FIELDS = {
    cerita_rakyat: [
      { id: 'cn_tokoh',   label: 'Tokoh Utama',           type: 'text' },
      { id: 'cn_latar',   label: 'Latar (waktu & tempat)', type: 'text' },
      { id: 'cn_alur',    label: 'Alur Singkat',          type: 'textarea' },
      { id: 'cn_durasi',  label: 'Durasi Tuturan (menit)', type: 'number' },
      { id: 'cn_episode', label: 'Jumlah Episode/Bab (opsional)', type: 'number' },
    ],
    puisi_rakyat: [
      { id: 'cp_jumlah_bait',    label: 'Jumlah Bait',         type: 'number' },
      { id: 'cp_larik_per_bait', label: 'Jumlah Larik per Bait', type: 'number' },
      { id: 'cp_pola_sajak',     label: 'Pola Sajak',          type: 'text', placeholder: 'a-b-a-b, a-a-a-a' },
      { id: 'cp_metrum',         label: 'Tembang / Metrum (opsional)', type: 'text', placeholder: 'mis. Sinom, Asmaradana' },
      { id: 'cp_durasi',         label: 'Durasi Tuturan / Nyanyi (menit)', type: 'number' },
    ],
    nyanyian_rakyat: [
      { id: 'cy_laras',     label: 'Tangga Nada / Laras', type: 'text', placeholder: 'Slendro, Pelog, Mayor, Pentatonis' },
      { id: 'cy_irama',     label: 'Irama / Tempo',       type: 'text' },
      { id: 'cy_jumlah_bait', label: 'Jumlah Bait',       type: 'number' },
      { id: 'cy_pengiring', label: 'Alat Pengiring (opsional)', type: 'text' },
      { id: 'cy_durasi',    label: 'Durasi Nyanyi (menit)', type: 'number' },
    ],
    ungkapan_tradisional: [
      { id: 'cu_teks',    label: 'Teks Lengkap',     type: 'textarea' },
      { id: 'cu_makna',   label: 'Makna / Arti',     type: 'textarea' },
      { id: 'cu_konteks', label: 'Konteks Penggunaan (opsional)', type: 'textarea' },
      { id: 'cu_fungsi',  label: 'Fungsi Sosial (opsional)', type: 'text' },
    ],
    teka_teki: [
      { id: 'ct_pertanyaan', label: 'Pertanyaan',       type: 'textarea' },
      { id: 'ct_jawaban',    label: 'Jawaban',          type: 'textarea' },
      { id: 'ct_penjelasan', label: 'Penjelasan / Makna (opsional)', type: 'textarea' },
    ],
    drama: [
      { id: 'cd_lakon',    label: 'Judul Lakon / Cerita', type: 'text' },
      { id: 'cd_pemimpin', label: 'Dalang / Sutradara / Pemimpin', type: 'text' },
      { id: 'cd_kelompok', label: 'Kelompok / Sanggar', type: 'text' },
      { id: 'cd_durasi',   label: 'Durasi Total (menit)', type: 'number' },
      { id: 'cd_pemain',   label: 'Jumlah Pemain',      type: 'number' },
      { id: 'cd_musik',    label: 'Alat Musik Pengiring', type: 'text' },
      { id: 'cd_properti', label: 'Properti / Kostum Utama', type: 'text' },
    ],
  };

  // =========================================================
  //  SEKSI D — KONDISI PENYAMPAIAN
  // =========================================================
  const D_PERTUNJUKAN = [
    { id: 'sastra_tempat',            label: 'Tempat Pertunjukan',  type: 'text' },
    { id: 'sastra_frekuensi',         label: 'Frekuensi Pertunjukan', type: 'select', options: ['Sering', 'Jarang', 'Tidak pernah'] },
    { id: 'sastra_waktu',             label: 'Waktu Pertunjukan',   type: 'select', options: ['Pagi', 'Siang', 'Sore', 'Malam', 'Tidak tentu'] },
    { id: 'sastra_penonton',          label: 'Jumlah Penonton Rata-rata', type: 'number' },
    { id: 'sastra_penonton_siapa',    label: 'Siapa Penonton',      type: 'text' },
    { id: 'sastra_iringan',           label: 'Iringan Musik',       type: 'text' },
    { id: 'sastra_properti',          label: 'Properti / Alat Pentas', type: 'text' },
    { id: 'sastra_bahasa_pertunjukan',label: 'Bahasa Pertunjukan',  type: 'text' },
    { id: 'sastra_catatan',           label: 'Catatan Pertunjukan', type: 'textarea' },
  ];
  const D_TEKS = [
    { id: 'teks_kondisi',     label: 'D1. Kondisi Penuturan', type: 'preset', options: ['Dibacakan', 'Dihafal', 'Improvisasi', 'Campuran'] },
    { id: 'teks_penutur',     label: 'D2. Siapa yang Mengucapkan', type: 'text' },
    { id: 'teks_pendengar',   label: 'D3. Kepada Siapa',      type: 'text' },
    { id: 'teks_bahasa',      label: 'D4. Bahasa yang Digunakan', type: 'text' },
    { id: 'teks_frekuensi',   label: 'D5. Frekuensi Penuturan', type: 'select', options: ['Sering', 'Jarang', 'Hampir punah'] },
    { id: 'teks_durasi',      label: 'D6. Durasi Penuturan (menit)', type: 'number' },
    { id: 'teks_jumlah_bait', label: 'D7. Jumlah Baris / Bait', type: 'number' },
    { id: 'teks_catatan',     label: 'D8. Catatan',           type: 'textarea' },
  ];

  // =========================================================
  //  SEKSI E / F / Z — tetap
  // =========================================================
  const BAHASA_FIELDS = [
    { id: 'ab_register', label: 'Register / Tingkat Tutur', type: 'textarea' },
    { id: 'ab_kosakata', label: 'Kosakata Khusus dalam Teks', type: 'textarea' },
  ];
  const PEWARISAN_FIELDS = [
    { id: 'pw_dari_siapa',  label: 'Dari Siapa Mempelajari Ini', type: 'text' },
    { id: 'pw_hubungan',    label: 'Hubungan dengan Narasumber', type: 'select', options: ['Keluarga', 'Tetua adat', 'Guru', 'Teman', 'Otodidak', 'Lainnya'] },
    { id: 'pw_sejak_kapan', label: 'Sejak Kapan Mengenal',     type: 'text' },
    { id: 'pw_masih_hidup', label: 'Masih Hidup / Lazim Diketahui', type: 'select', options: ['Ya, masih hidup', 'Mulai jarang', 'Hampir punah', 'Sudah punah'] },
    { id: 'pw_terakhir',    label: 'Kapan Terakhir Didengar/Diceritakan', type: 'text' },
    { id: 'sastra_pewarisan', label: 'Sistem Pewarisan', type: 'preset', options: ['Terbuka', 'Tertutup'] },
    { id: 'pw_varian',      label: 'Ada Varian Lain di Tempat Lain', type: 'textarea' },
  ];
  const STATUS_FIELDS = [
    { id: 'sastra_pengambil_nama',     label: 'Nama Pewawancara / Pengambil Data', type: 'text' },
    { id: 'sastra_pengambil_satker',   label: 'Lembaga / Satuan Kerja', type: 'text' },
    { id: 'sastra_pengambil_tanggal',  label: 'Tanggal Pengambilan Data', type: 'timestamp' },
    { id: 'sastra_dokumentasi_bentuk',   label: 'Bentuk Dokumentasi (mis. Audio, Video, Foto)', type: 'text' },
    { id: 'sastra_dokumentasi_tautan',   label: 'Tautan Hasil Dokumentasi', type: 'text' },
    { id: 'sastra_dokumentasi_perekam',  label: 'Nama Perekam',        type: 'text' },
    { id: 'sastra_dokumentasi_instansi', label: 'Asal Instansi Perekam', type: 'text' },
    { id: 'sastra_transaksi_lampiran',   label: 'Lampiran Transkripsi', type: 'textarea' },
    { id: 'sastra_transaksi_nama',       label: 'Nama Pentranskripsi',  type: 'text' },
    { id: 'sastra_transaksi_instansi',   label: 'Asal Instansi Pentranskripsi', type: 'text' },
    { id: 'sastra_terjemahan_lampiran',  label: 'Lampiran Terjemahan',  type: 'textarea' },
    { id: 'sastra_terjemahan_nama',      label: 'Nama Penerjemah',      type: 'text' },
    { id: 'sastra_terjemahan_instansi',  label: 'Asal Instansi Penerjemah', type: 'text' },
    { id: 'sastra_catatan_lapangan',     label: 'Catatan Lapangan',     type: 'textarea' },
  ];

  // ---- "Lainnya" -> kolom isian manual ----
  function hasLainnya(f) { return Array.isArray(f.options) && f.options.some(o => (typeof o === 'object' ? o.value : o) === 'Lainnya'); }
  function withLainnya(fields) {
    const out = [];
    (fields || []).forEach(f => {
      out.push(f);
      if ((f.type === 'select' || f.type === 'preset') && hasLainnya(f)) {
        out.push({ id: f.id + '_lain', label: f.label + ' — sebutkan (jika "Lainnya")', type: 'text', placeholder: 'Tulis manual...', dependsOn: f.id, dependsValue: 'Lainnya' });
      }
    });
    return out;
  }

  // Kompatibilitas mundur (Bagian 8) — pemetaan key D-Pertunjukan lama -> baru.
  // Zero-migration: saat memuat, salin nilai key lama ke key baru lalu buang key lama;
  // saat menyimpan hanya key baru yang ditulis.
  const LEGACY_DP_MAP = {
    sastra_tempat:    'sastra_tempat_pertunjukan',
    sastra_waktu:     'sastra_waktu_pertunjukan',
    sastra_penonton:  'sastra_khalayak_jumlah',
    sastra_iringan:   'sastra_iringan_musik',
    sastra_properti:  'sastra_kostum',
  };
  function migrateLegacyKeys(item) {
    Object.keys(LEGACY_DP_MAP).forEach(newKey => {
      const oldKey = LEGACY_DP_MAP[newKey];
      if (!(oldKey in item)) return;
      const cur = item[newKey];
      if ((cur === undefined || cur === null || cur === '') && item[oldKey] !== undefined && item[oldKey] !== '') {
        item[newKey] = item[oldKey];
      }
      delete item[oldKey]; // key lama disuperseksi -> bersih saat disimpan ulang
    });
    // Normalisasi nilai preset/select waktu lama
    if (item.sastra_waktu === 'Tidak tentu (Bebas)') item.sastra_waktu = 'Tidak tentu';
  }

  function getKonteks(item) { if (!item) return 'pertunjukan'; return item.konteks || item.objek_kajian || 'pertunjukan'; }
  function getGenre(item) {
    if (!item) return 'drama';
    if (item.genre === undefined) return 'drama';
    return GENRE_ALIAS[item.genre] || item.genre;
  }

  function buildSections(item) {
    const konteks = getKonteks(item);
    const genre = getGenre(item);
    const cFields = genre && genre !== 'lainnya' ? (GENRE_C_FIELDS[genre] || []) : (genre === 'lainnya' ? [] : null);
    const cVisible = genre !== '' && genre !== undefined && genre !== null;
    const dFields = konteks === 'teks' ? D_TEKS : D_PERTUNJUKAN;
    const dTitle = konteks === 'teks' ? 'D. Kondisi Penyampaian (Teks)' : 'D. Konteks Pertunjukan';
    return [
      { key: 'A', title: 'A. Data Narasumber', fields: withLainnya(NARA_FIELDS) },
      { key: 'B', title: 'B. Identifikasi Sastra Lisan', fields: withLainnya(identFields(konteks, genre)) },
      { key: 'C', title: 'C. Data Karya' + (cVisible && GENRES[genre] ? ' — ' + GENRES[genre].label : ''), fields: cVisible ? withLainnya([...CORE_C_FIELDS, ...(cFields || [])]) : [], hint: cVisible ? null : 'Pilih Genre Utama di Seksi B untuk menampilkan Data Karya.' },
      { key: 'D', title: dTitle, fields: withLainnya(dFields) },
      { key: 'E', title: 'E. Analisis Bahasa', fields: withLainnya(BAHASA_FIELDS) },
      { key: 'F', title: 'F. Pewarisan', fields: withLainnya(PEWARISAN_FIELDS) },
      { key: 'G', title: 'G. Dokumentasi Media', fields: [], isMedia: true },
      { key: 'Z', title: 'Z. Status', fields: withLainnya(STATUS_FIELDS) },
    ];
  }

  function allFields() {
    const list = [];
    const add = (f) => { if (!list.find(x => x.id === f.id)) list.push(f); };
    withLainnya(NARA_FIELDS).forEach(add);
    withLainnya(identFields('pertunjukan', 'cerita_rakyat')).forEach(add);
    withLainnya(CORE_C_FIELDS).forEach(add);
    Object.keys(GENRE_C_FIELDS).forEach(g => withLainnya(GENRE_C_FIELDS[g]).forEach(add));
    withLainnya(D_PERTUNJUKAN).forEach(add);
    withLainnya(D_TEKS).forEach(add);
    withLainnya(BAHASA_FIELDS).forEach(add);
    withLainnya(PEWARISAN_FIELDS).forEach(add);
    withLainnya(STATUS_FIELDS).forEach(add);
    return list;
  }
  function allFieldDefById(key) { return allFields().find(f => f.id === key); }

  window.ApsaraSastraGenreConfig = { GENRES, GENRE_ALIAS, KONTEKS_LABELS, SUB_GENRES, allFields, getKonteks, getGenre };

  // =========================================================
  //  DB
  // =========================================================
  function getDB() {
    return new Promise((resolve, reject) => {
      if (dbSastra) return resolve(dbSastra);
      const req = indexedDB.open(DB_NAME, 3);
      req.onupgradeneeded = (e) => { const db = e.target.result; if (!db.objectStoreNames.contains(STORE_SASTRA)) db.createObjectStore(STORE_SASTRA, { keyPath: 'id' }); };
      req.onsuccess = (e) => { dbSastra = e.target.result; resolve(dbSastra); };
      req.onerror = reject;
    });
  }
  async function getAllSastra() {
    const db = await getDB();
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(STORE_SASTRA)) return resolve([]);
      const req = db.transaction([STORE_SASTRA], 'readonly').objectStore(STORE_SASTRA).getAll();
      req.onsuccess = () => resolve(req.result || []); req.onerror = () => resolve([]);
    });
  }
  async function saveSastraToDB(data) {
    const db = await getDB();
    return new Promise((resolve, reject) => { const tx = db.transaction([STORE_SASTRA], 'readwrite'); tx.objectStore(STORE_SASTRA).put(data); tx.oncomplete = resolve; tx.onerror = reject; });
  }
  async function deleteSastraFromDB(id) {
    const db = await getDB();
    return new Promise((resolve, reject) => { const tx = db.transaction([STORE_SASTRA], 'readwrite'); tx.objectStore(STORE_SASTRA).delete(id); tx.oncomplete = resolve; tx.onerror = reject; });
  }

  // =========================================================
  //  PROGRESS (7 seksi relevan)
  // =========================================================
  function hitungKemajuan(item) {
    const filled = (fields) => (fields || []).some(f => { const v = item[f.id]; return v !== undefined && v !== null && String(v).trim() !== ''; });
    const konteks = getKonteks(item), genre = getGenre(item);
    const s = [];
    s.push(filled(NARA_FIELDS));
    s.push(filled(identFields(konteks, genre)));
    if (genre) s.push(filled([...CORE_C_FIELDS, ...(GENRE_C_FIELDS[genre] || [])]));
    s.push(filled(konteks === 'teks' ? D_TEKS : D_PERTUNJUKAN));
    s.push(filled(BAHASA_FIELDS));
    s.push(filled(PEWARISAN_FIELDS));
    s.push((item.fotoBlobs && item.fotoBlobs.length > 0) || item.audioBlob || item.videoBlob);
    const total = s.length, terisi = s.filter(Boolean).length;
    return { terisi, total, persen: Math.round(terisi / total * 100) };
  }

  // =========================================================
  //  DUPLIKAT
  // =========================================================
  async function duplikatSastra(entriLama) {
    const clone = {};
    Object.keys(entriLama).forEach(k => { if (['fotoBlobs', 'audioBlob', 'videoBlob', 'created_at', 'updated_at'].includes(k)) return; clone[k] = entriLama[k]; });
    clone.id = Date.now(); clone.status = 'draft'; clone.fotoBlobs = []; clone.audioBlob = null; clone.videoBlob = null;
    await saveSastraToDB(clone); openForm(clone);
  }

  // =========================================================
  //  DAFTAR KARTU
  // =========================================================
  function renderListView(container, listData) {
    let filtered = listData.slice();
    if (currentFilter === 'belum') filtered = filtered.filter(it => { const k = hitungKemajuan(it); return k.terisi < k.total; });
    else if (currentFilter === 'sudah') filtered = filtered.filter(it => { const k = hitungKemajuan(it); return k.terisi === k.total; });
    if (currentFilterGenre !== 'semua') filtered = filtered.filter(it => getGenre(it) === currentFilterGenre);
    if (currentFilterKonteks !== 'semua') filtered = filtered.filter(it => getKonteks(it) === currentFilterKonteks);

    const genreOpts = Object.keys(GENRES).map(k => `<option value="${k}">${GENRES[k].label}</option>`).join('');

    let html = `
      <div class="sastra-list-container">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap: wrap; gap: 8px;">
          <h2 style="font-family:var(--display); font-size:20px; color:var(--ink);">Daftar Sastra Lisan</h2>
          <button class="btn btn-primary" id="btnSastraNew">+ Entri Baru</button>
        </div>
        <div class="sastra-filter-row">
          <select id="filterSastraLengkap" class="select-pretty" style="padding:4px 8px; font-size:12px; min-width:130px;">
            <option value="semua">Semua</option><option value="belum">Belum Lengkap</option><option value="sudah">Sudah Lengkap</option>
          </select>
          <select id="filterSastraGenre" class="select-pretty" style="padding:4px 8px; font-size:12px; min-width:150px;">
            <option value="semua">Semua Genre</option>${genreOpts}
          </select>
          <select id="filterSastraKonteks" class="select-pretty" style="padding:4px 8px; font-size:12px; min-width:140px;">
            <option value="semua">Semua Konteks</option><option value="pertunjukan">Pertunjukan</option><option value="teks">Murni Teks</option>
          </select>
        </div>
        <div class="sastra-cards-container">
    `;

    if (filtered.length === 0) {
      html += `<div style="text-align:center; padding: 20px; color:var(--ink-faint);">Tidak ada data sastra lisan yang sesuai.</div>`;
    } else {
      filtered.sort((a, b) => b.id - a.id).forEach(item => {
        const d = new Date(item.id);
        const pad = (n) => String(n).padStart(2, '0');
        const dateStr = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()} (${pad(d.getHours())}:${pad(d.getMinutes())})`;
        const esc = window.escHTML || (s => s);
        const nama = esc(item.sastra_nama || '(Tanpa Nama)');
        const statusClass = item.status === 'selesai' ? 'selesai' : 'draft';
        const judul = esc(item.sastra_nama_sastra || item.judul || '(Belum diisi)');
        const konteks = getKonteks(item), genre = getGenre(item);
        let badge;
        if (genre && GENRES[genre]) {
          const g = GENRES[genre];
          const subTxt = item.sub_genre ? ' — ' + esc(item.sub_genre) : '';
          badge = `<span class="genre-badge" style="background:${g.color}">${svgIcon(genre, 13, '#fff')} ${g.label}${subTxt}</span>`;
        } else {
          const lain = item.genre_lain ? ' — ' + esc(item.genre_lain) : '';
          badge = `<span class="genre-badge lainnya">${svgIcon('lainnya', 13, '#fff')} Lainnya${lain}</span>`;
        }
        const kemajuan = hitungKemajuan(item);
        const warnaBar = kemajuan.terisi === kemajuan.total ? 'var(--hijau)' : 'var(--emas)';

        html += `
          <div class="sastra-card" data-id="${item.id}">
            <div class="sastra-card-header">${badge}<span class="sastra-status ${statusClass}">${(item.status || 'draft').toUpperCase()}</span></div>
            <div style="font-size:12px; color:var(--ink-soft); margin:4px 0 2px;">Narasumber: <strong>${nama}</strong></div>
            <div class="sastra-card-subtitle">Judul: ${judul}</div>
            <div style="margin-bottom:6px;"><span class="konteks-chip">${esc(KONTEKS_LABELS[konteks] || konteks)}</span></div>
            <div class="sastra-card-meta">${dateStr}</div>
            <div class="kemajuan-bar"><div class="kemajuan-fill" style="width:${kemajuan.persen}%; background:${warnaBar};"></div></div>
            <span class="kemajuan-text">${kemajuan.terisi}/${kemajuan.total} seksi</span>
            <div class="sastra-card-actions">
              <button class="btn-edit-sastra" data-id="${item.id}">Edit</button>
              <button class="btn-hapus-sastra" data-id="${item.id}">Hapus</button>
              <button class="btn-duplikat-sastra" data-id="${item.id}">Duplikat</button>
            </div>
          </div>`;
      });
    }
    html += `</div></div>`;
    html += `<div style="margin-top: 16px; text-align: right;"><button class="btn btn-accent" id="btnSastraExport">Ekspor Data Sastra (ZIP)</button></div>`;
    container.innerHTML = html;

    const f1 = container.querySelector('#filterSastraLengkap');
    const f2 = container.querySelector('#filterSastraGenre');
    const f3 = container.querySelector('#filterSastraKonteks');
    if (f1) { f1.value = currentFilter; f1.addEventListener('change', e => { currentFilter = e.target.value; renderListView(container, listData); }); }
    if (f2) { f2.value = currentFilterGenre; f2.addEventListener('change', e => { currentFilterGenre = e.target.value; renderListView(container, listData); }); }
    if (f3) { f3.value = currentFilterKonteks; f3.addEventListener('change', e => { currentFilterKonteks = e.target.value; renderListView(container, listData); }); }

    container.querySelector('#btnSastraNew').addEventListener('click', () => {
      openForm({ id: Date.now(), status: 'draft', konteks: 'pertunjukan', genre: '', fotoBlobs: [] });
    });
    container.querySelectorAll('.sastra-card').forEach(card => card.addEventListener('click', () => { const data = listData.find(d => d.id === Number(card.dataset.id)); if (data) openForm(data); }));
    container.querySelectorAll('.btn-edit-sastra').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); const data = listData.find(d => d.id === Number(btn.dataset.id)); if (data) openForm(data); }));
    container.querySelectorAll('.btn-hapus-sastra').forEach(btn => btn.addEventListener('click', async (e) => {
      e.stopPropagation(); const id = Number(btn.dataset.id); const item = listData.find(d => d.id === id);
      const nama = (item && item.sastra_nama) ? item.sastra_nama : 'entri ini';
      if (!confirm(`Hapus data sastra lisan "${nama}"?\nTindakan ini tidak dapat dibatalkan.`)) return;
      await deleteSastraFromDB(id); initSastraUI();
    }));
    container.querySelectorAll('.btn-duplikat-sastra').forEach(btn => btn.addEventListener('click', async (e) => { e.stopPropagation(); const data = listData.find(d => d.id === Number(btn.dataset.id)); if (data) await duplikatSastra(data); }));
    const btnExport = container.querySelector('#btnSastraExport');
    if (btnExport) btnExport.addEventListener('click', () => { if (window.ApsaraSastraExport) window.ApsaraSastraExport(listData); else alert('Modul ekspor sastra belum dimuat.'); });
  }

  // =========================================================
  //  RENDER FIELD
  // =========================================================
  function renderFieldHTML(f) {
    const depAttr = f.dependsOn ? `data-depends-on="${f.dependsOn}" data-depends-value="${f.dependsValue}" style="display:none;"` : '';
    const fieldClass = f.dependsOn ? 'field sub-fields' : 'field';
    let html = `<div class="${fieldClass}" style="grid-column: 1 / -1;" ${depAttr}>`;
    html += `<label class="field-label">${f.label}</label>`;
    const ph = f.placeholder ? `placeholder="${f.placeholder}"` : '';
    if (f.type === 'text') html += `<input type="text" class="field-input sastra-input" data-key="${f.id}" ${f.readonly ? 'readonly style="background:var(--paper-tint);"' : ''} ${ph}>`;
    else if (f.type === 'number') html += `<input type="number" class="field-input sastra-input" data-key="${f.id}" ${f.readonly ? 'readonly style="background:var(--paper-tint);"' : ''}>`;
    else if (f.type === 'date') html += `<input type="text" class="field-input sastra-input" data-key="${f.id}" placeholder="dd/mm/yyyy" onfocus="this.type='date';try{this.showPicker()}catch(e){}" onblur="if(!this.value)this.type='text'">`;
    else if (f.type === 'textarea') html += `<textarea class="field-input sastra-input" data-key="${f.id}" ${ph} style="min-height:60px;"></textarea>`;
    else if (f.type === 'preset') html += `<input type="hidden" class="sastra-input" data-key="${f.id}"><div class="preset-group" data-for="${f.id}">${f.options.map(o => { const v = (typeof o === 'object') ? o.value : o; const l = (typeof o === 'object') ? o.label : o; return `<button type="button" class="preset-btn" data-value="${v}">${l}</button>`; }).join('')}</div>`;
    else if (f.type === 'select') { const opts = (f.options || []).map(o => { const v = (typeof o === 'object') ? o.value : o; const l = (typeof o === 'object') ? o.label : o; return `<option value="${v}">${l}</option>`; }).join(''); html += `<select class="select-pretty sastra-input" data-key="${f.id}" style="width:100%;"><option value="">-- Pilih --</option>${opts}</select>`; if (f.showInfo) html += `<div class="field-info" data-info-for="${f.id}" data-info-kind="${f.showInfo}" style="display:none;"></div>`; if (f.panduanGenre) html += panduanLengkapHTML(f.panduanGenre); }
    else if (f.type === 'checkbox-multi') html += `<input type="hidden" class="sastra-input" data-key="${f.id}"><div class="sastra-multi" data-for="${f.id}">${f.options.map(o => `<label><input type="checkbox" value="${o}"> ${o}</label>`).join('')}</div>`;
    else if (f.type === 'gps') html += `<div style="display:flex; gap:8px;"><input type="text" class="field-input sastra-input" data-key="${f.id}" placeholder="-6.123, 106.456" readonly style="flex:1; background:var(--paper-tint);"><button type="button" class="btn btn-primary btn-gps-ambil" style="padding:10px;">Ambil GPS</button></div>`;
    else if (f.type === 'timestamp') html += `<div style="display:flex; gap:8px;"><input type="text" class="field-input sastra-input" data-key="${f.id}" placeholder="Klik Ambil..." readonly style="flex:1; background:var(--paper-tint);"><button type="button" class="btn btn-primary btn-timestamp-ambil" style="padding:10px;">Ambil</button></div>`;
    else if (f.type === 'camera') html += cameraFieldHTML(f.id);
    html += `</div>`;
    return html;
  }

  function cameraFieldHTML(id) {
    return `
      <input type="hidden" class="sastra-input" data-key="${id}" id="sastra_foto_narasumber_input">
      <div class="sastra-camera-container" style="margin-top:8px;">
        <div class="sastra-video-wrap" style="display:none; margin-bottom:10px; border:1px solid var(--line); border-radius:8px; overflow:hidden; position:relative; background:#000; max-width:320px;">
          <video autoplay playsinline muted style="width:100%; display:block;"></video>
          <button type="button" class="btn-capture-live" style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); z-index:10; width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.92); color:var(--ink); border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.3); cursor:pointer;"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/></svg></button>
        </div>
        <div class="sastra-photo-preview-wrap" style="display:none; margin-bottom:10px; border:1px solid var(--line); border-radius:8px; padding:6px; background:var(--paper-tint); max-width:320px; text-align:center;">
          <img class="sastra-photo-preview" style="max-width:100%; max-height:240px; border-radius:6px; display:block; margin:0 auto;">
          <div style="display:flex; gap:6px; justify-content:center; margin-top:6px;">
            <button type="button" class="btn-ganti-foto" style="padding:3px 8px; font-size:11px; background:var(--paper-tint); color:var(--ink); border:1px solid var(--line); border-radius:4px; cursor:pointer;">Ganti Foto</button>
            <button type="button" class="btn-remove-foto" style="padding:3px 8px; font-size:11px; background:var(--merah-soft); color:var(--merah); border:none; border-radius:4px; cursor:pointer;">Hapus Foto</button>
          </div>
        </div>
        <div class="sastra-camera-actions" style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; width:100%;">
          <button type="button" class="btn-start-camera sastra-upload-label" title="Buka Kamera" style="flex:0 0 44px; width:44px; justify-content:center;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </button>
          <label class="sastra-upload-label" style="flex:1; min-width:140px; justify-content:center;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            Pilih dari Galeri
            <input type="file" accept="image/*" class="sastra-file-foto-input" style="display:none;">
          </label>
        </div>
      </div>`;
  }

  function mediaSectionHTML() {
    return `
      <div class="rec-block">
        <label class="field-label">G1. Audio Sampel (rekam ≤ 60 detik / unggah)</label>
        <div class="rec-controls">
          <button type="button" class="btn-rec-toggle" data-rec="audio"><span class="rec-dot"></span><span class="rec-label">Rekam Audio</span></button>
          <span class="rec-timer" data-rec-timer="audio">00:00</span>
          <div class="rec-level"><div class="rec-level-bar" data-rec-level="audio"></div></div>
          <span class="rec-size" data-rec-size="audio"></span>
          <label class="sastra-upload-label">Unggah Audio<input type="file" accept="audio/*" id="sastra_audio_input" style="display:none;"></label>
        </div>
        <div class="rec-playback" data-rec-pb="audio"></div>
      </div>

      <div class="rec-block">
        <label class="field-label">G2. Video Sampel (rekam ≤ 60 detik, 640×480 / unggah)</label>
        <video class="rec-video-preview" playsinline muted></video>
        <div class="rec-controls">
          <button type="button" class="btn-rec-toggle" data-rec="video"><span class="rec-dot"></span><span class="rec-label">Rekam Video</span></button>
          <span class="rec-timer" data-rec-timer="video">00:00</span>
          <span class="rec-size" data-rec-size="video"></span>
          <label class="sastra-upload-label">Unggah Video<input type="file" accept="video/*" id="sastra_video_input" style="display:none;"></label>
        </div>
        <div class="rec-playback" data-rec-pb="video"></div>
      </div>

      <div class="rec-block">
        <label class="field-label">G3. Foto / Dokumen</label>
        <div class="rec-controls">
          <label class="sastra-upload-label">Ambil Foto<input type="file" accept="image/*" capture="environment" id="sastra_foto_capture" style="display:none;"></label>
          <label class="sastra-upload-label">Pilih dari Galeri<input type="file" accept="image/*" multiple id="sastra_foto_input" style="display:none;"></label>
        </div>
        <div class="sastra-gallery" id="sastra_foto_gallery"></div>
      </div>`;
  }

  function genreKeyCardHTML(item) {
    const genre = getGenre(item), konteks = getKonteks(item);
    if (genre && GENRES[genre]) {
      const g = GENRES[genre];
      return `<div class="genre-key-card"><div class="genre-key-ico" style="background:${g.color}">${svgIcon(genre, 20, '#fff')}</div><div><div class="genre-key-text">${g.label}${item.sub_genre ? ' · ' + item.sub_genre : ''}</div><div class="genre-key-sub">${KONTEKS_LABELS[konteks]} · ${g.code}</div></div></div>`;
    }
    const lain = item.genre_lain ? ' · ' + item.genre_lain : '';
    return `<div class="genre-key-card"><div class="genre-key-ico" style="background:var(--ink-muted)">${svgIcon('lainnya', 20, '#fff')}</div><div><div class="genre-key-text">${genre === 'lainnya' ? 'Genre Lainnya' + lain : 'Belum ada genre'}</div><div class="genre-key-sub">${KONTEKS_LABELS[konteks]} · pilih genre di Seksi B</div></div></div>`;
  }

  function formHeaderHTML() {
    return `
      <div class="sastra-form-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <button class="btn" id="btnSastraBack" style="padding:6px 14px; font-size:12px; font-weight:600; background:var(--merah-soft); color:var(--merah); border:1px solid color-mix(in oklch, var(--merah) 30%, transparent); border-radius:8px; cursor:pointer;">&lt; Kembali</button>
        <div style="display:flex; gap:8px; align-items:center;">
          <span id="sastraSaveIndicator" style="font-size:11px; color:var(--hijau); opacity:0; transition:opacity 0.3s;">[Tersimpan]</span>
          <select id="sastra_status_input" class="select-pretty" style="padding:4px 8px; font-size:12px;"><option value="draft">Draft</option><option value="selesai">Selesai</option></select>
        </div>
      </div>`;
  }

  function buildFormHTML(item) {
    let html = formHeaderHTML();
    html += genreKeyCardHTML(item);
    const secs = buildSections(item);
    if (!secs.some(s => s.key === openSectionKey)) openSectionKey = 'A';
    secs.forEach((sec) => {
      html += `<details class="meta-section-card sastra-section" name="sastra-sections" data-seckey="${sec.key}" ${sec.key === openSectionKey ? 'open' : ''}><summary class="meta-section-summary">${sec.title}</summary><div class="meta-section-body">`;
      if (sec.isMedia) html += mediaSectionHTML();
      else if (sec.hint) html += `<div class="sastra-hint">${sec.hint}</div>`;
      else { html += `<div class="field-grid">`; sec.fields.forEach(f => { html += renderFieldHTML(f); }); html += `</div>`; }
      html += `</div></details>`;
    });
    return html;
  }

  // =========================================================
  //  KAMERA NARASUMBER
  // =========================================================
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

    if (hiddenInput && hiddenInput.value) { previewImg.src = hiddenInput.value; previewWrap.style.display = ''; cameraActions.style.display = 'none'; }

    if (startCameraBtn) startCameraBtn.addEventListener('click', () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 800 } } })
          .then(stream => { currentStream = stream; video.srcObject = stream; videoWrap.style.display = ''; cameraActions.style.display = 'none'; })
          .catch(err => alert('Kamera tidak tersedia: ' + err.message + '\nSilakan pilih dari galeri.'));
      } else alert('Browser tidak mendukung kamera langsung. Silakan pilih dari galeri.');
    });
    if (captureBtn) captureBtn.addEventListener('click', () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d'); ctx.drawImage(video, 0, 0);
        if (canvas.width > 800) { const s = 800 / canvas.width; canvas.width = 800; canvas.height = canvas.height * s; ctx.drawImage(video, 0, 0, canvas.width, canvas.height); }
        canvas.toBlob(blob => { const r = new FileReader(); r.onload = () => { hiddenInput.value = r.result; previewImg.src = r.result; previewWrap.style.display = ''; videoWrap.style.display = 'none'; cameraActions.style.display = 'none'; scheduleAutoSave(); }; r.readAsDataURL(blob); }, 'image/jpeg', 0.7);
        if (currentStream) { currentStream.getTracks().forEach(t => t.stop()); currentStream = null; }
      }
    });
    if (fileInput) fileInput.addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas'); const max = 800; let w = img.width, h = img.height;
        if (w > max) { h = h * max / w; w = max; }
        canvas.width = w; canvas.height = h; canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => { const r = new FileReader(); r.onload = () => { hiddenInput.value = r.result; previewImg.src = r.result; previewWrap.style.display = ''; cameraActions.style.display = 'none'; scheduleAutoSave(); }; r.readAsDataURL(blob); }, 'image/jpeg', 0.7);
      };
      img.src = URL.createObjectURL(file);
    });
    if (removeBtn) removeBtn.addEventListener('click', () => { hiddenInput.value = ''; previewWrap.style.display = 'none'; cameraActions.style.display = ''; scheduleAutoSave(); });
    if (gantiBtn) gantiBtn.addEventListener('click', () => { previewWrap.style.display = 'none'; cameraActions.style.display = ''; });
    const backBtn = container.querySelector('#btnSastraBack');
    if (backBtn) backBtn.addEventListener('click', () => { if (currentStream) { currentStream.getTracks().forEach(t => t.stop()); currentStream = null; } });
  }

  function updateFieldInfo(container) {
    const genre = getGenre(currentSastraData);
    container.querySelectorAll('.field-info').forEach(box => {
      const kind = box.dataset.infoKind;
      if (kind === 'genre') {
        const g = GENRES[genre];
        if (g) { box.innerHTML = `<span class="fi-head">${svgIcon(genre, 13, 'var(--emas-tua)')} <strong>Sifat:</strong></span> ${g.sifat}. <strong>Contoh:</strong> ${g.desc}.`; box.style.display = ''; }
        else { box.innerHTML = ''; box.style.display = 'none'; }
      } else if (kind === 'subgenre') {
        const sel = container.querySelector('.sastra-input[data-key="sub_genre"]');
        const val = sel ? sel.value : '';
        const info = (SUBGENRE_INFO[genre] || {})[val];
        if (info) { box.innerHTML = `<strong>Ciri:</strong> ${info.ciri}.<br><strong>Contoh &amp; asal:</strong> ${info.contoh}.`; box.style.display = ''; }
        else { box.innerHTML = '<em>Pilih sub-genre untuk melihat ciri &amp; contoh daerahnya.</em>'; box.style.display = ''; }
      }
    });
  }

  function applyConditionalLogic(container) {
    container.querySelectorAll('.sastra-input').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.dataset.key, val = input.value;
        container.querySelectorAll(`[data-depends-on="${id}"]`).forEach(dep => {
          if (val === dep.dataset.dependsValue) dep.style.display = 'block';
          else { dep.style.display = 'none'; const di = dep.querySelector('.sastra-input'); if (di) { di.value = ''; const grp = dep.querySelector(`.preset-group[data-for="${di.dataset.key}"]`); if (grp) grp.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active')); } }
        });
      });
    });
  }

  // =========================================================
  //  RECORDER AUDIO / VIDEO (sampel ≤ 60 detik)
  // =========================================================
  const REC_MAX_MS = 60 * 1000, REC_WARN_MS = 50 * 1000;
  function fmtTime(ms) { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }

  function wireRecorder(container, kind) {
    const btn = container.querySelector(`.btn-rec-toggle[data-rec="${kind}"]`);
    if (!btn) return;
    const label = btn.querySelector('.rec-label');
    const timerEl = container.querySelector(`[data-rec-timer="${kind}"]`);
    const sizeEl = container.querySelector(`[data-rec-size="${kind}"]`);
    const levelBar = container.querySelector(`[data-rec-level="${kind}"]`);
    const preview = kind === 'video' ? container.querySelector('.rec-video-preview') : null;
    let rec = null, chunks = [], stream = null, timerInt = null, startTs = 0, totalBytes = 0, warned = false, audioCtx = null, rafId = null;

    function setLabel(t) { if (label) label.textContent = t; }
    function updSize() { if (sizeEl) sizeEl.textContent = totalBytes ? '~' + (totalBytes / 1048576).toFixed(1) + ' MB' : ''; }

    function startLevel() {
      if (kind !== 'audio' || !levelBar || !stream) return;
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtx.createMediaStreamSource(stream), an = audioCtx.createAnalyser(); an.fftSize = 256; src.connect(an);
        const arr = new Uint8Array(an.frequencyBinCount);
        const loop = () => { if (!rec || rec.state !== 'recording') return; an.getByteFrequencyData(arr); let sum = 0; for (let i = 0; i < arr.length; i++) sum += arr[i]; levelBar.style.width = Math.min(100, (sum / arr.length / 128) * 100) + '%'; rafId = requestAnimationFrame(loop); };
        loop();
      } catch (e) { /* abaikan */ }
    }

    async function start() {
      try {
        const constraints = kind === 'video' ? { video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } }, audio: true } : { audio: { channelCount: 1 } };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) { alert('Izin perangkat ditolak: ' + e.message); return; }
      if (kind === 'video' && preview) { preview.srcObject = stream; preview.style.display = 'block'; preview.play().catch(() => {}); }
      chunks = []; totalBytes = 0; warned = false; updSize();
      let mime = kind === 'video' ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' : '') : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : '');
      try { rec = new MediaRecorder(stream, mime ? { mimeType: mime } : {}); } catch (e) { rec = new MediaRecorder(stream); }
      rec.ondataavailable = e => { if (e.data && e.data.size > 0) { chunks.push(e.data); totalBytes += e.data.size; updSize(); } };
      rec.onstop = finalize;
      rec.start(1000);
      startTs = Date.now();
      btn.classList.add('recording'); setLabel(kind === 'video' ? 'Hentikan Video' : 'Hentikan Audio');
      startLevel();
      timerInt = setInterval(() => {
        const el = Date.now() - startTs;
        if (timerEl) timerEl.textContent = fmtTime(el);
        if (el >= REC_WARN_MS && !warned) { warned = true; if (timerEl) timerEl.style.color = 'var(--merah)'; toast('10 detik lagi — sampel berhenti otomatis di 60 detik'); }
        if (el >= REC_MAX_MS) stop();
      }, 250);
    }

    function stop() {
      if (timerInt) clearInterval(timerInt);
      if (rafId) cancelAnimationFrame(rafId);
      if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
      if (levelBar) levelBar.style.width = '0%';
      if (rec && rec.state !== 'inactive') rec.stop();
      if (stream) stream.getTracks().forEach(t => t.stop());
      btn.classList.remove('recording'); setLabel(kind === 'video' ? 'Rekam Video' : 'Rekam Audio');
      if (timerEl) timerEl.style.color = '';
      if (kind === 'video' && preview) { preview.style.display = 'none'; preview.srcObject = null; }
    }

    function finalize() {
      if (!chunks.length) return;
      const type = kind === 'video' ? 'video/webm' : 'audio/webm';
      const blob = new Blob(chunks, { type });
      if (kind === 'video') currentSastraData.videoBlob = blob; else currentSastraData.audioBlob = blob;
      scheduleAutoSave(); renderPlayback(container, kind);
    }

    btn.addEventListener('click', () => { if (rec && rec.state === 'recording') stop(); else start(); });
    renderPlayback(container, kind);
  }

  function renderPlayback(container, kind) {
    const pb = container.querySelector(`[data-rec-pb="${kind}"]`);
    if (!pb) return;
    const blob = kind === 'video' ? currentSastraData.videoBlob : currentSastraData.audioBlob;
    if (!blob) { pb.innerHTML = ''; return; }
    const url = URL.createObjectURL(blob);
    const sizeKB = Math.round(blob.size / 1024);
    const media = kind === 'video' ? `<video controls src="${url}"></video>` : `<audio controls src="${url}"></audio>`;
    pb.innerHTML = `${media}<div class="rec-pb-row"><span class="rec-size">${sizeKB} KB tersimpan</span><button type="button" class="btn-media-del">Hapus ${kind === 'video' ? 'Video' : 'Audio'}</button></div>`;
    const del = pb.querySelector('.btn-media-del');
    if (del) del.addEventListener('click', () => { if (!confirm('Hapus rekaman ini?')) return; if (kind === 'video') currentSastraData.videoBlob = null; else currentSastraData.audioBlob = null; scheduleAutoSave(); renderPlayback(container, kind); });
  }

  function wireMedia(container) {
    wireRecorder(container, 'audio');
    wireRecorder(container, 'video');
    const fotoInput = container.querySelector('#sastra_foto_input');
    const fotoCapture = container.querySelector('#sastra_foto_capture');
    const audioInput = container.querySelector('#sastra_audio_input');
    const videoInput = container.querySelector('#sastra_video_input');
    if (fotoInput) fotoInput.addEventListener('change', handleFotoUpload);
    if (fotoCapture) fotoCapture.addEventListener('change', handleFotoUpload);
    if (audioInput) audioInput.addEventListener('change', (e) => { const f = e.target.files[0]; if (!f) return; currentSastraData.audioBlob = f; renderPlayback(container, 'audio'); scheduleAutoSave(); });
    if (videoInput) videoInput.addEventListener('change', (e) => { const f = e.target.files[0]; if (!f) return; currentSastraData.videoBlob = f; renderPlayback(container, 'video'); scheduleAutoSave(); });
    renderGallery(container);
  }

  function handleFotoUpload(e) {
    const files = e.target.files; if (!files.length) return;
    currentSastraData.fotoBlobs = currentSastraData.fotoBlobs || [];
    Array.from(files).forEach(file => currentSastraData.fotoBlobs.push(file));
    renderGallery(document.getElementById('sastraAppContainer'));
    scheduleAutoSave(); e.target.value = '';
  }

  function renderGallery(container) {
    const gallery = container.querySelector('#sastra_foto_gallery');
    if (!gallery) return;
    gallery.innerHTML = '';
    (currentSastraData.fotoBlobs || []).forEach((blob, index) => {
      const url = URL.createObjectURL(blob);
      const div = document.createElement('div');
      div.className = 'sastra-gallery-item';
      div.innerHTML = `<img src="${url}"><button type="button" class="btn-remove" data-index="${index}">×</button>`;
      gallery.appendChild(div);
    });
    gallery.querySelectorAll('.btn-remove').forEach(btn => btn.addEventListener('click', (e) => { const idx = Number(e.currentTarget.dataset.index); currentSastraData.fotoBlobs.splice(idx, 1); renderGallery(container); scheduleAutoSave(); }));
  }

  // =========================================================
  //  GPS / TIMESTAMP / USIA
  // =========================================================
  function wireGPS(container) {
    container.querySelectorAll('.btn-gps-ambil').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!navigator.geolocation) { alert('GPS tidak didukung.'); return; }
        const wrap = btn.closest('.field'); const input = wrap ? wrap.querySelector('.sastra-input') : null;
        if (!input) return;
        const key = input.dataset.key;
        btn.textContent = 'Mencari...';
        navigator.geolocation.getCurrentPosition(pos => {
          const lat = pos.coords.latitude, lon = pos.coords.longitude;
          input.value = `${lat}, ${lon}`; input.dispatchEvent(new Event('input', { bubbles: true }));
          btn.textContent = 'Ambil GPS'; scheduleAutoSave();
          if (key === 'sastra_lokasi_koordinat') { const w = container.querySelector('[data-key="sastra_lokasi_waktu"]'); if (w) { w.value = tanggalSekarangStr(); w.dispatchEvent(new Event('input', { bubbles: true })); } }
          const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 5000);
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, { headers: { 'User-Agent': 'Apsara-Peta/1.0' }, signal: ctrl.signal })
            .then(r => r.json()).then(data => {
              clearTimeout(to); if (!data || !data.address) return; const a = data.address;
              if (key === 'sastra_lokasi_koordinat') {
                const map = { sastra_lokasi_provinsi: a.state || '', sastra_lokasi_kabupaten: a.city || a.regency || a.county || '', sastra_lokasi_kecamatan: a.suburb || a.municipality || a.district || a.subdistrict || a.town || '', sastra_lokasi_desa: a.village || a.hamlet || a.neighbourhood || a.suburb || '' };
                Object.keys(map).forEach(k => { const el = container.querySelector(`[data-key="${k}"]`); if (el && map[k]) { el.value = map[k]; el.dispatchEvent(new Event('input', { bubbles: true })); } });
              } else if (key === 'nara_koordinat') {
                const el = container.querySelector('[data-key="nara_alamat"]'); if (el && data.display_name && !el.value) { el.value = data.display_name; el.dispatchEvent(new Event('input', { bubbles: true })); }
              }
              toast('Lokasi terisi otomatis'); scheduleAutoSave();
            }).catch(() => { clearTimeout(to); });
        }, err => { alert('Gagal ambil GPS: ' + err.message); btn.textContent = 'Ambil GPS'; }, { enableHighAccuracy: true, timeout: 10000 });
      });
    });
  }

  function tanggalSekarangStr() {
    const now = new Date();
    let s = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
    const tz = now.getTimezoneOffset();
    if (tz === -420) s += ' WIB'; else if (tz === -480) s += ' WITA'; else if (tz === -540) s += ' WIT';
    return s;
  }
  function wireTanggal(container) {
    container.querySelectorAll('.btn-timestamp-ambil').forEach(btn => btn.addEventListener('click', () => { const inp = btn.closest('.field').querySelector('.sastra-input'); if (inp) { inp.value = tanggalSekarangStr(); scheduleAutoSave(); } }));
  }
  function wireUsia(container) {
    const tgl = container.querySelector('[data-key="sastra_tanggal_lahir"]'), usia = container.querySelector('[data-key="sastra_usia"]');
    if (!tgl || !usia) return;
    const hitung = () => { const lahir = new Date(tgl.value); if (isNaN(lahir.getTime())) return; const now = new Date(); let u = now.getFullYear() - lahir.getFullYear(); const m = now.getMonth() - lahir.getMonth(); if (m < 0 || (m === 0 && now.getDate() < lahir.getDate())) u--; usia.value = u; scheduleAutoSave(); };
    tgl.addEventListener('change', hitung); if (tgl.value) hitung();
  }

  // =========================================================
  //  BUKA FORM
  // =========================================================
  function openForm(existingData, keepSection) {
    const container = document.getElementById('sastraAppContainer');
    if (!keepSection) openSectionKey = 'A';
    currentSastraData = existingData;
    migrateLegacyKeys(currentSastraData);
    currentSastraData.konteks = getKonteks(currentSastraData);
    if (currentSastraData.genre && GENRE_ALIAS[currentSastraData.genre]) currentSastraData.genre = GENRE_ALIAS[currentSastraData.genre];
    if (currentSastraData.genre === undefined) currentSastraData.genre = 'drama'; // entri lama
    if (!currentSastraData.sastra_pengambil_tanggal) currentSastraData.sastra_pengambil_tanggal = tanggalSekarangStr();
    currentSastraData.fotoBlobs = currentSastraData.fotoBlobs || [];

    container.innerHTML = buildFormHTML(currentSastraData);
    wireCommon(container);

    ['konteks', 'genre'].forEach(k => {
      const el = container.querySelector(`.sastra-input[data-key="${k}"]`);
      if (el) el.addEventListener('change', () => {
        openSectionKey = 'B'; // perubahan dilakukan di Seksi B → tetap di B
        const y = window.scrollY;
        doSaveSastra();
        openForm(currentSastraData, true);
        window.scrollTo(0, y);
      });
    });
  }

  function wireCommon(container) {
    const inputs = container.querySelectorAll('.sastra-input');
    inputs.forEach(input => {
      const key = input.dataset.key;
      if (currentSastraData[key] !== undefined && currentSastraData[key] !== null) {
        input.value = currentSastraData[key];
        const def = allFieldDefById(key);
        if (def && def.type === 'date' && input.value) input.type = 'date';
        const grp = container.querySelector(`.preset-group[data-for="${key}"]`);
        if (grp) grp.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.value === String(input.value)));
      }
    });

    const statusInput = container.querySelector('#sastra_status_input');
    if (statusInput) statusInput.value = currentSastraData.status || 'draft';

    container.querySelectorAll('.sastra-multi').forEach(wrap => {
      const key = wrap.dataset.for, hidden = container.querySelector(`.sastra-input[data-key="${key}"]`);
      const vals = (hidden && hidden.value ? hidden.value.split(',') : []).map(s => s.trim());
      wrap.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = vals.includes(cb.value);
        cb.addEventListener('change', () => { const checked = Array.from(wrap.querySelectorAll('input:checked')).map(c => c.value); if (hidden) hidden.value = checked.join(', '); scheduleAutoSave(); });
      });
    });

    applyConditionalLogic(container);
    inputs.forEach(input => { if (input.tagName === 'SELECT' || input.type === 'hidden') input.dispatchEvent(new Event('change')); });

    initCameraField(container);
    wireMedia(container);

    container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const grp = btn.closest('.preset-group'), key = grp.dataset.for, hidden = container.querySelector(`.sastra-input[data-key="${key}"]`);
        if (hidden) { hidden.value = btn.dataset.value; grp.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); hidden.dispatchEvent(new Event('change', { bubbles: true })); hidden.dispatchEvent(new Event('input', { bubbles: true })); }
      });
    });

    inputs.forEach(input => { input.addEventListener('input', scheduleAutoSave); input.addEventListener('change', scheduleAutoSave); });
    if (statusInput) statusInput.addEventListener('change', scheduleAutoSave);

    // Panduan dinamis: perbarui kotak info saat sub-genre berubah
    updateFieldInfo(container);
    const subSel = container.querySelector('.sastra-input[data-key="sub_genre"]');
    if (subSel) subSel.addEventListener('change', () => updateFieldInfo(container));
    // Klik baris pada "Lihat semua jenis" -> pilih sub-genre itu
    container.querySelectorAll('.panduan-item[data-sub]').forEach(it => it.addEventListener('click', () => {
      if (subSel) { subSel.value = it.dataset.sub; subSel.dispatchEvent(new Event('change', { bubbles: true })); }
    }));

    // Lacak seksi yang terbuka agar tidak melompat ke A saat form dibangun ulang
    container.querySelectorAll('details.sastra-section').forEach(d => {
      d.addEventListener('toggle', () => { if (d.open && d.dataset.seckey) openSectionKey = d.dataset.seckey; });
    });

    container.querySelector('#btnSastraBack').addEventListener('click', () => { doSaveSastra(); initSastraUI(); });

    wireGPS(container); wireTanggal(container); wireUsia(container);
  }

  // =========================================================
  //  SIMPAN
  // =========================================================
  function scheduleAutoSave() { if (autoSaveInterval) clearTimeout(autoSaveInterval); autoSaveInterval = setTimeout(doSaveSastra, 1500); }

  function buildNestedMirror(data) {
    const pick = (fields) => { const o = {}; (fields || []).forEach(f => { if (data[f.id] !== undefined) o[f.id] = data[f.id]; }); return o; };
    const konteks = getKonteks(data), genre = getGenre(data);
    data.data_narasumber = pick(withLainnya(NARA_FIELDS));
    data.identifikasi = pick(withLainnya(identFields(konteks, genre)));
    data.data_karya = pick(withLainnya([...CORE_C_FIELDS, ...(GENRE_C_FIELDS[genre] || [])]));
    data.kondisi = pick(withLainnya(konteks === 'teks' ? D_TEKS : D_PERTUNJUKAN));
    data.analisis_bahasa = pick(withLainnya(BAHASA_FIELDS));
    data.pewarisan = pick(withLainnya(PEWARISAN_FIELDS));
    data.status_pencatat = pick(withLainnya(STATUS_FIELDS));
    data.media = { jumlah_foto: (data.fotoBlobs || []).length, ada_audio: !!data.audioBlob, ada_video: !!data.videoBlob };
    if (!data.created_at) data.created_at = new Date(data.id).toISOString();
    data.updated_at = new Date().toISOString();
  }

  function doSaveSastra() {
    if (!currentSastraData) return;
    const container = document.getElementById('sastraAppContainer'); if (!container) return;
    container.querySelectorAll('.sastra-input').forEach(input => { currentSastraData[input.dataset.key] = input.value; });
    const statusInput = container.querySelector('#sastra_status_input');
    if (statusInput) currentSastraData.status = statusInput.value;
    buildNestedMirror(currentSastraData);
    saveSastraToDB(currentSastraData).then(() => { const ind = container.querySelector('#sastraSaveIndicator'); if (ind) { ind.style.opacity = '1'; setTimeout(() => { ind.style.opacity = '0'; }, 2000); } });
  }

  async function initSastraUI() {
    const container = document.getElementById('sastraAppContainer'); if (!container) return;
    container.innerHTML = '<div style="text-align:center; padding: 40px; color:var(--ink-muted);">Memuat data...</div>';
    const data = await getAllSastra(); cachedListData = data; renderListView(container, data);
  }

  window.addEventListener('DOMContentLoaded', () => {
    const tabBahasa = document.getElementById('tabAppBahasa');
    const tabSastra = document.getElementById('tabAppSastra');
    const viewBahasa = document.getElementById('view-bahasa');
    const viewSastra = document.getElementById('view-sastra');
    if (tabBahasa && tabSastra) {
      tabBahasa.addEventListener('click', () => { tabBahasa.classList.add('active'); tabSastra.classList.remove('active'); viewBahasa.classList.add('active'); viewSastra.classList.remove('active'); viewBahasa.style.display = ''; viewSastra.style.display = 'none'; });
      tabSastra.addEventListener('click', () => { tabSastra.classList.add('active'); tabBahasa.classList.remove('active'); viewSastra.classList.add('active'); viewBahasa.classList.remove('active'); viewSastra.style.display = 'block'; viewBahasa.style.display = 'none'; initSastraUI(); });
    }
  });

})();
