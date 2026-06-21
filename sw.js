// =========================================================
// SERVICE WORKER â€” Apsara v3 (Offline-First Agresif)
// =========================================================
// Strategi: cache file inti saat install, lalu cache lazy untuk
// gambar dan font. Storage diminimalkan dengan pembatasan ukuran cache.
//
// Yang berubah dari v2:
// - Tambah cache size limit untuk gambar (auto-evict file terlama)
// - Tambah versioning otomatis berdasarkan tanggal build
// - Tambah "skip waiting" message handler untuk update tanpa restart
// - Pisahkan cache: APP_CACHE (inti, harus selalu fresh) vs ASSET_CACHE (gambar/font)
// =========================================================

const VERSION = 'v16-2026-06-22-berian-minor';
const APP_CACHE   = 'apsara-app-'   + VERSION;  // HTML, JS, CSS inti
const ASSET_CACHE = 'apsara-asset-' + VERSION;  // gambar berian, font

// File inti yang WAJIB ada offline
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',

  // Inti & loader
  './js/core.js',
  './js/loader.js',

  // Modul Fase-2
  './js/entri.js',
  './js/kibor.js',
  './js/metadata.js',
  './js/audio.js',
  './js/ekspor.js',
  './js/praat.js',
  './js/sastra.js',
  './js/ekspor_sastra.js',

  // Modul Fase-1
  './js/status_koneksi.js',
  './js/tema_gelap.js',
  './js/install_pwa.js',
  './js/auto_backup.js',
  './js/riwayat_versi.js',
  './js/shortcut_ipa.js',
  './js/validasi_ekspor.js',
  './js/tinjau_ragu.js',
  './js/gabung_data.js',
  './js/halaman_tentang.js',

  // Font & gambar inti
  './aset/DoulosSIL-Regular.ttf',
  './aset/berian_data.js',
  './aset/gambar_berian/0000.webp',
  './aset/gambar_berian/0000_favico.webp',
  './aset/gambar_panduan/panduan_01.png',
  './aset/gambar_panduan/panduan_02.png',
  './aset/gambar_panduan/panduan_03.png',
  './aset/gambar_panduan/panduan_04.png',
  './aset/gambar_panduan/panduan_05.png',
  './aset/gambar_panduan/panduan_06.png',
  './aset/gambar_panduan/panduan_07.png',
  './aset/gambar_panduan/panduan_08.png'
];

// Domain CDN yang dipakai (Google Fonts, JSZip)
const ALLOWED_CDN = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com'
];

// Pustaka CDN yang WAJIB tersedia luring (ekspor & gabung data).
// Di-cache eksplisit saat install sebagai permintaan CORS agar tidak opaque.
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Batas: maksimal 2500 entri di ASSET_CACHE (agar 1.191 gambar berian
// tidak terhapus saat enumerator berpindah-pindah pertanyaan secara offline)
const MAX_ASSET_ENTRIES = 2500;

// =========================================================
// INSTALL
// =========================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then(async (cache) => {
      await Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Lewati cache:', url, err.message);
          })
        )
      );
      // Pustaka CDN: minta sebagai CORS agar bisa disimpan (bukan opaque) untuk luring.
      await Promise.all(
        CDN_ASSETS.map((url) =>
          cache.add(new Request(url, { mode: 'cors' })).catch((err) => {
            console.warn('[SW] Lewati cache CDN:', url, err.message);
          })
        )
      );
    })
  );
});

// =========================================================
// ACTIVATE
// =========================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== APP_CACHE && n !== ASSET_CACHE)
          .map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// =========================================================
// MESSAGE
// =========================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// =========================================================
// FETCH
// =========================================================
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  const sameOrigin = url.origin === self.location.origin;
  const allowedCDN = ALLOWED_CDN.some((d) => url.hostname.includes(d));
  if (!sameOrigin && !allowedCDN) return;

  const isImage = url.pathname.includes('/gambar_berian/') ||
                  url.pathname.match(/\.(webp|png|jpg|jpeg|svg)$/i);

  if (isImage) {
    event.respondWith(handleImage(req));
  } else {
    event.respondWith(handleApp(req));
  }
});

async function handleApp(req) {
  const cached = await caches.match(req);
  if (cached) return cached;

  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200 && (fresh.type === 'basic' || fresh.type === 'cors')) {
      const cache = await caches.open(APP_CACHE);
      cache.put(req, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch (e) {
    if (req.mode === 'navigate') {
      return caches.match('./index.html');
    }
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function handleImage(req) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;

  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200) {
      cache.put(req, fresh.clone()).then(() => evictIfFull(cache));
    }
    return fresh;
  } catch (e) {
    return new Response('', { status: 404 });
  }
}

async function evictIfFull(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_ASSET_ENTRIES) {
    const toDelete = keys.length - MAX_ASSET_ENTRIES;
    for (let i = 0; i < toDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}
