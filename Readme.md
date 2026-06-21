# Apsara-Peta
## Aplikasi Pelindungan Bahasa dan Sastra: Kuesioner Pemetaan Bahasa dan Sastra
### Balai Bahasa Provinsi Jawa Tengah

**Apsara-Peta** adalah instrumen digital pengumpulan data pemetaan bahasa dan sastra lisan yang dikembangkan oleh **Balai Bahasa Provinsi Jawa Tengah**, Badan Pengembangan dan Pembinaan Bahasa, Kementerian Pendidikan Dasar dan Menengah. Aplikasi ini dirancang sebagai *Progressive Web App* (PWA) dengan pendekatan **100% luring (*offline-first*)**, tidak memerlukan server *backend*, dan menyimpan seluruh data lapangan di basis data peramban (*IndexedDB*) pada perangkat masing-masing pewawancara. Apsara-Peta menyediakan dua modul kuesioner yang dapat digunakan secara berdampingan dalam satu sesi pengambilan data, yaitu **Pemetaan Bahasa** dengan 1.191 konsep berian dan **Kuesioner Sastra Lisan** untuk pendokumentasian informan dan teks sastra lisan beserta media pendukungnya.

---

## Daftar Isi

1. [Informasi Teknis](#1-informasi-teknis)
   - [Versi Saat Ini](#11-versi-saat-ini)
   - [Prasyarat Sistem](#12-prasyarat-sistem)
   - [Struktur Proyek](#13-struktur-proyek)
   - [Tim Pengembang](#14-tim-pengembang)
2. [Panduan Pewawancara (Enumerator)](#2-panduan-pewawancara-enumerator)
   - [Pemasangan Aplikasi (PWA)](#21-pemasangan-aplikasi-pwa)
   - [Struktur Antarmuka](#22-struktur-antarmuka)
   - [Fitur Kuesioner Bahasa](#23-fitur-kuesioner-bahasa)
   - [Fitur Kuesioner Sastra Lisan](#24-fitur-kuesioner-sastra-lisan)
   - [Fitur Pendukung](#25-fitur-pendukung)
   - [Panduan Langkah demi Langkah](#26-panduan-langkah-demi-langkah)
   - [Tip dan Penanganan Masalah](#27-tip-dan-penanganan-masalah)
3. [Panduan Administrator](#3-panduan-administrator)
   - [Ringkasan Pembaruan](#31-ringkasan-pembaruan)
   - [Struktur Teknis Aplikasi](#32-struktur-teknis-aplikasi)
   - [Integrasi dan Pemasangan](#33-integrasi-dan-pemasangan)
   - [Distribusi dan Penerbitan](#34-distribusi-dan-penerbitan)
   - [Pembaruan Aplikasi](#35-pembaruan-aplikasi)
   - [Keamanan dan Pencadangan Data](#36-keamanan-dan-pencadangan-data)
   - [Monitoring Tim](#37-monitoring-tim)
   - [Pemasangan Massal (*Bulk Deployment*)](#38-pemasangan-massal-bulk-deployment)
4. [Panduan Khusus](#4-panduan-khusus)
   - [Daftar Pintasan IPA](#41-daftar-pintasan-ipa)
   - [Panduan Visualisasi Praat](#42-panduan-visualisasi-praat)
   - [Panduan Kuesioner Sastra Lisan](#43-panduan-kuesioner-sastra-lisan)
5. [Teknologi yang Digunakan](#5-teknologi-yang-digunakan)
6. [Kredit dan Penghargaan](#6-kredit-dan-penghargaan)
7. [Lisensi dan Kontak](#7-lisensi-dan-kontak)

---

## 1. Informasi Teknis

### 1.1 Versi Saat Ini

| Atribut | Nilai |
| :--- | :--- |
| Nama aplikasi | **Apsara-Peta** |
| Versi *service worker* | `v10-2026-06-18-sastra-genre-dinamis` |
| Tanggal rilis terakhir | 18 Juni 2026 |
| Jumlah berian bahasa | 1.191 konsep |

**Pembaruan utama pada versi ini (v10 — Kuesioner Sastra Lisan berbasis genre):**

- **Formulir sastra lisan dinamis berbasis genre.** Kuesioner sastra lisan dirombak dari formulir tunggal menjadi formulir bertingkat dengan **dua sumbu terpisah**: *Konteks Penyampaian* (Pertunjukan / Murni Teks) dan *Genre* sastra. Dasar teori: Suripan Sadi Hutomo (*Mutiara yang Terlupakan*, 1991), James Danandjaja (*Folklor Indonesia*, 1984), dan William Bascom.
- **Enam genre + taksonomi se-Indonesia.** Cerita Rakyat, Puisi Rakyat, Nyanyian Rakyat, Ungkapan Tradisional, Teka-teki Tradisional, dan Teater/Drama Rakyat, masing-masing dengan daftar sub-genre lengkap dari seluruh provinsi (mite, legenda, hikayat, kaba, pantun, syair, macapat, pupuh, tortor, wayang, randai, sinrilik, mak yong, dll.) plus opsi **"Lainnya"** untuk bentuk hiper-lokal.
- **Panduan kontekstual.** Saat genre/sub-genre dipilih, muncul panel "Sifat", "Ciri", dan "Contoh & asal daerah". Tersedia pula tombol **"ⓘ Lihat semua jenis"** yang menampilkan katalog lengkap genre dan dapat diklik untuk memilih.
- **Unsur yang Terkandung.** Untuk pertunjukan multi-unsur (mis. wayang = naratif + tembang + dagelan + musik + tari), tersedia centang unsur yang terkandung.
- **Seksi D adaptif.** Konteks *Pertunjukan* menampilkan kuesioner pertunjukan lengkap (kompatibel mundur dengan field `sastra_*` lama), sedangkan *Murni Teks* menampilkan formulir kondisi penuturan yang ringkas.
- **Rekam audio & video sampel mandiri.** Seksi Dokumentasi Media kini dapat merekam audio dan video langsung (MediaRecorder, ≤ 60 detik, indikator level, estimasi ukuran, auto-stop) selain mengunggah berkas.
- **Ikon SVG monoline** selaras tema (tanpa emoji), filter daftar berdasarkan **Genre** dan **Konteks**, serta progress bar X/7 seksi.
- **Kompatibilitas mundur penuh.** Entri lama tanpa genre otomatis diperlakukan sebagai *Pertunjukan* dan key lama dipetakan ke format baru saat dibuka (tanpa skrip migrasi).

**Pembaruan versi sebelumnya (v9):**

- **Card layout responsif:** daftar informan sastra lisan kini menggunakan kartu (card layout) yang responsif di perangkat mobile, menggantikan tampilan tabel sebelumnya.
- **Checklist kemajuan:** setiap entri sastra lisan menampilkan progress bar (X/5 seksi) dan filter penyaringan (Semua / Belum Lengkap / Sudah Lengkap).
- **Duplikat entri:** tombol "📋 Duplikat" pada setiap kartu memungkinkan pewawancara membuat entri baru berdasarkan data narasumber yang sama tanpa mengisi ulang.
- **GPS reverse geocoding:** tombol "Ambil GPS" kini mengisi otomatis koordinat beserta alamat (Provinsi, Kabupaten, Kecamatan, Desa, Kode Pos) melalui Nominatim (OpenStreetMap).
- **Date picker dan usia otomatis:** field Tanggal Lahir menggunakan kalender native peramban. Usia terhitung otomatis dari tanggal lahir.
- **Tanggal pengambilan otomatis:** tombol "Ambil" pada Seksi D mengisi tanggal dan waktu dari sistem perangkat.
- **Foto narasumber:** field kamera WebRTC dan galeri di Seksi A untuk mengambil foto narasumber langsung dari perangkat.
- **Preset buttons:** tombol pilihan cepat untuk field repetitif (Jenis Kelamin, Kategori Penutur, Bentuk Tuturan, dll).
- **Arsitektur modular tuntas:** seluruh logika fitur tambahan kini berada di 20 berkas JavaScript terpisah di dalam folder `js/`. Berkas monolit `apsara_modul_tambahan.js` dari versi sebelumnya digantikan oleh `loader.js` yang berperan sebagai *init-runner* tunggal (sekitar 24 baris kode).
- **Pemisahan data berian:** seluruh 1.191 entri berian (sekitar 468 KB) dipindahkan dari berkas `index.html` ke berkas khusus `aset/berian_data.js`. Akibatnya, ukuran `index.html` menyusut dari sekitar 5.732 baris menjadi sekitar 4.925 baris, dan data berian kini dapat dimuat sebagai aset terpisah yang dicakup *precache* oleh *service worker*.
- **Kuesioner Sastra Lisan:** tab baru di samping tab pemetaan bahasa yang menyediakan formulir akordion (Bagian A sampai E) untuk pendokumentasian informan sastra lisan beserta media pendukung berupa foto, audio, dan video.
- **Tombol hapus entri sastra:** setiap baris pada daftar informan sastra lisan kini memiliki tombol hapus dengan dialog konfirmasi.
- **Perbaikan karakter fonetis:** pemetaan simbol IPA pada modul pintasan kibor fisik telah dipulihkan setelah sebelumnya rusak akibat kesalahan *encoding*.
- **Perbaikan ikon emoji:** ikon `👍` pada modal tinjau ragu-ragu kini tampil benar.
- **Perbaikan jalur aset:** seluruh referensi gambar dan font kini menggunakan jalur baru `./aset/...` (sebelumnya tersebar di akar proyek).
- **Penataan urutan lencana:** lencana di bilah kepala kini muncul dengan urutan yang disengaja, yaitu **Tersimpan → Daring/Luring → Mode Gelap → Tentang (i)**.

### 1.2 Prasyarat Sistem

#### Perangkat

| Perangkat | Spesifikasi minimum |
| :--- | :--- |
| Telepon pintar (Android) | Android 8.0 (Oreo) ke atas, RAM 2 GB, ruang kosong 200 MB |
| Telepon pintar (iOS) | iOS 15 ke atas, ruang kosong 200 MB |
| Komputer jinjing/meja | RAM 4 GB, ruang kosong 500 MB |

Apsara-Peta tidak memiliki batasan keras pada RAM dan penyimpanan, tetapi nilai di atas merupakan rekomendasi praktis agar perekaman audio dan visualisasi spektrogram berjalan lancar.

#### Peramban

| Peramban | Versi minimum |
| :--- | :--- |
| Google Chrome / Chromium | 90 ke atas |
| Microsoft Edge | 90 ke atas |
| Safari (iOS dan macOS) | 15 ke atas |
| Firefox | 90 ke atas (tanpa dukungan pemasangan PWA penuh di iOS) |

#### Protokol HTTPS

Akses kamera dan GPS (*Geolocation API*) hanya tersedia melalui koneksi **HTTPS**. Saat aplikasi diakses melalui `http://localhost` (untuk pengembangan lokal), peramban memberikan dispensasi keamanan sehingga seluruh fitur tetap berfungsi. Untuk distribusi ke pewawancara lapangan, pastikan aplikasi dilayankan melalui *hosting* yang menyediakan sertifikat HTTPS, seperti **GitHub Pages**, **Netlify**, atau **Cloudflare Pages**.

#### Penyimpanan Lokal

Aplikasi memerlukan ruang penyimpanan di dalam peramban (basis data *IndexedDB*) yang bergantung pada volume data lapangan. Sebagai gambaran:

| Item | Perkiraan ukuran |
| :--- | :--- |
| Cache aplikasi inti (HTML, JS, CSS, font) | ± 5 MB |
| Cache 1.191 gambar WebP berian (saat seluruhnya diunduh) | ± 65 MB |
| Rekaman audio Opus per konsep (5 sampai 10 detik) | ± 50 KB |
| Foto informan terkompresi (400 × 400 piksel) | ± 30 KB |
| Foto pertunjukan sastra (ukuran asli) | bervariasi |

### 1.3 Struktur Proyek

```
apsara-peta/
├── index.html                       # Antarmuka utama dan IIFE inti
├── sw.js                            # Service worker (cache-first)
├── manifest.json                    # Manifes PWA
├── Readme.md                        # Dokumen ini
├── .gitignore                       # Aturan abai Git
├── js/                              # 20 berkas modul JavaScript
│   ├── loader.js                    # Init-runner (sekitar 24 baris)
│   ├── core.js                      # Utilitas: $, escHTML, ApsaraBus, ApsaraState
│   ├── entri.js                     # Navigasi dan input kartu berian
│   ├── kibor.js                     # Kibor virtual IPA
│   ├── metadata.js                  # GPS dan data informan
│   ├── audio.js                     # Perekaman dan pemutaran audio
│   ├── ekspor.js                    # Ekspor ZIP data bahasa
│   ├── praat.js                     # Visualisasi spektrogram (PraatViz)
│   ├── sastra.js                    # Kuesioner sastra lisan
│   ├── ekspor_sastra.js             # Ekspor data sastra ke ZIP
│   ├── status_koneksi.js            # Lencana Daring/Luring
│   ├── tema_gelap.js                # Mode gelap dan terang
│   ├── install_pwa.js               # Tombol pasang aplikasi (PWA)
│   ├── auto_backup.js               # Pengingat pencadangan berkala
│   ├── riwayat_versi.js             # Memori ketikan (maksimum 5 versi)
│   ├── shortcut_ipa.js              # Pintasan kibor fisik (Alt + huruf)
│   ├── validasi_ekspor.js           # Pemeriksaan kelengkapan sebelum ekspor
│   ├── tinjau_ragu.js               # Modal daftar entri ragu-ragu
│   ├── gabung_data.js               # Penggabungan data antar tim
│   └── halaman_tentang.js           # Tombol "i", panduan, unduh gambar massal
└── aset/
    ├── DoulosSIL-Regular.ttf        # Font fonetis IPA (Doulos SIL)
    ├── apsara-peta.png              # Ikon PWA (192 dan 512 piksel)
    ├── berian_data.js               # Data 1.191 konsep berian
    ├── gambar_berian/               # 1.743 berkas WebP dan PNG ilustrasi
    └── gambar_panduan/              # 8 berkas PNG panduan penggunaan
```

#### Penjelasan Singkat

- **`index.html`** memuat antarmuka pengguna, seluruh gaya CSS *inline*, dan satu IIFE inti yang mendaftarkan `window.ApsaraInternals` dan `window.ApsaraAPI` agar dapat diakses oleh modul-modul terpisah di folder `js/`.
- **`sw.js`** merupakan *service worker* dengan dua *cache* terpisah, yaitu `apsara-app-<VERSION>` untuk berkas aplikasi inti dan `apsara-asset-<VERSION>` untuk gambar dan font, dengan strategi *cache-first* serta pembatasan jumlah berkas pada *cache* aset.
- **`js/loader.js`** menunggu `window.ApsaraAPI` dan `window.BERIAN_DATA` tersedia, kemudian memanggil `init()` seluruh modul yang terdaftar di `window.ApsaraModules`.
- **`js/core.js`** mendefinisikan utilitas global `window.$`, `window.escHTML`, `window.ApsaraBus`, dan `window.ApsaraState` yang dipakai oleh modul-modul Fase-1.
- **`aset/berian_data.js`** berisi `window.BERIAN_DATA` yang merupakan larik berisi 1.191 objek berian. Berkas ini dimuat sebelum IIFE inti pada `index.html`.

### 1.4 Tim Pengembang

- **Balai Bahasa Provinsi Jawa Tengah**
- **Badan Pengembangan dan Pembinaan Bahasa**
- **Kementerian Pendidikan Dasar dan Menengah, Republik Indonesia**

---

## 2. Panduan Pewawancara (Enumerator)

Bagian ini ditujukan kepada pewawancara lapangan yang akan menggunakan Apsara-Peta untuk mengumpulkan data bahasa dan sastra lisan dari para informan.

### 2.1 Pemasangan Aplikasi (PWA)

Sebelum berangkat ke lokasi survei yang kemungkinan tidak terjangkau sinyal internet, Anda perlu memasang aplikasi Apsara-Peta pada perangkat yang akan digunakan.

#### A. Pemasangan pada Perangkat Android (Google Chrome)

1. Aktifkan koneksi internet, lalu buka tautan URL aplikasi Apsara-Peta menggunakan peramban **Google Chrome**.
2. Tunggu hingga halaman terbuka sepenuhnya sampai muncul lencana hijau bertuliskan **"Daring"** pada bilah kepala.
3. Akan muncul jendela sembulan otomatis di bagian bawah layar bertuliskan **"Tambahkan ke Layar Utama"** (*Add to Home Screen*). Ketuk tombol tersebut.
4. Jika jendela tersebut tidak muncul, ketuk tombol **titik tiga** di pojok kanan atas Chrome, lalu pilih **"Instal Aplikasi"** atau **"Tambahkan ke Layar Utama"**.
5. Konfirmasi pemasangan dengan menekan tombol **"Instal"**.
6. Apsara-Peta akan terpasang di menu aplikasi ponsel Anda seperti aplikasi Android asli, lengkap dengan ikon khusus.

#### B. Pemasangan pada iPhone/iPad (Safari)

1. Buka tautan URL aplikasi Apsara-Peta melalui peramban bawaan iOS, yaitu **Safari**. Pemasangan PWA di iOS hanya didukung secara penuh melalui Safari.
2. Tekan ikon **"Bagikan"** (*Share*) yang berbentuk kotak dengan panah ke atas pada bilah navigasi bagian bawah Safari.
3. Gulir opsi yang muncul ke bawah, lalu pilih menu **"Tambah ke Layar Utama"** (*Add to Home Screen*).
4. Ubah nama aplikasi jika diperlukan, lalu ketuk tombol **"Tambah"** (*Add*) di pojok kanan atas.
5. Ikon Apsara-Peta kini tampil di layar utama iPhone/iPad Anda.

#### C. Pemasangan pada Komputer (Chrome/Edge)

1. Buka URL aplikasi Apsara-Peta melalui Google Chrome atau Microsoft Edge pada komputer Anda.
2. Tunggu hingga halaman selesai dimuat.
3. Pada bilah alamat URL, akan muncul ikon **"Pasang"** (☐ dengan tanda panah ke bawah) di sisi kanan. Klik ikon tersebut.
4. Sebagai alternatif, ketuk tombol **titik tiga** di pojok kanan atas peramban, lalu pilih **"Pasang Apsara-Peta"**.
5. Konfirmasi pemasangan. Aplikasi akan muncul sebagai jendela mandiri di luar peramban, seperti aplikasi *desktop* lainnya.

#### D. Tombol "Pasang Aplikasi" di Dalam Aplikasi

Apabila peramban telah menyimpan riwayat pengabaian pasangan PWA, aplikasi Apsara-Peta akan menampilkan tombol khusus berwarna **merah bertuliskan "⬇ Pasang Aplikasi"** di pojok kanan bawah layar. Tombol ini akan tampil secara otomatis pada peramban yang masih mendukung pasangan dan akan hilang dengan sendirinya setelah pemasangan selesai.

#### E. Prapenyimpanan Cache (*Pre-caching*)

> Setelah berhasil terpasang di perangkat, **buka aplikasi satu kali saat perangkat masih terhubung ke internet**. Langkah ini penting agar *service worker* aplikasi mengunduh seluruh berkas aset inti, termasuk `index.html`, berkas JavaScript modul, `berian_data.js`, font Doulos SIL, dan delapan halaman panduan, ke dalam *cache* lokal perangkat. Untuk mengunduh 1.191 gambar berian dalam satu tahap, lihat bagian [Fitur Kuesioner Bahasa](#23-fitur-kuesioner-bahasa) bagian unduh gambar massal.

### 2.2 Struktur Antarmuka

Antarmuka Apsara-Peta didesain simetris, modern, dan responsif terhadap ukuran layar dengan tampilan satu kolom yang proporsional untuk perangkat genggam.

#### A. Bilah Kepala (*Masthead*)

Bilah kepala terletak di bagian paling atas aplikasi dan berfungsi sebagai pusat informasi umum serta penyesuaian estetika.

- **Logo Instansi:** menampilkan logo resmi Balai Bahasa Provinsi Jawa Tengah, Badan Pengembangan dan Pembinaan Bahasa, Kementerian Pendidikan Dasar dan Menengah.
- **Lencana di Bilah Kepala** (urutan dari kiri ke kanan):
  1. **Lencana "Tersimpan"** — konfirmasi visual setiap kali data otomatis tersimpan ke basis data lokal.
  2. **Lencana Status Koneksi:**
     - **DARING (hijau)** — perangkat terhubung dengan koneksi internet aktif.
     - **LURING (merah)** — perangkat tanpa internet. Aplikasi tetap berfungsi normal.
  3. **Tombol Alih Mode Gelap (☀/🌙)** — mengubah tema warna aplikasi antara mode terang dan mode gelap. Status pilihan disimpan di penyimpanan peramban dan otomatis dipulihkan ketika aplikasi dibuka kembali.
  4. **Tombol Informasi (ℹ)** — membuka modal informasi pengembang aplikasi, menyediakan tombol khusus untuk membuka **Buku Panduan** (delapan halaman dalam bentuk gambar), serta tombol **"Unduh Gambar Offline"** untuk mengunduh seluruh 1.191 gambar berian.

#### B. Pemilih Tab

Tepat di bawah bilah kepala terdapat dua tab utama.

- **Pemetaan Bahasa** (tab bawaan) — kuesioner 1.191 berian dan seluruh fitur perekaman audio, visualisasi spektrogram, dan ekspor data bahasa.
- **Kuesioner Sastra Lisan** — modul pendokumentasian sastra lisan berbasis genre. Daftar entri ditampilkan dalam bentuk kartu (card layout) responsif. Setiap kartu menampilkan badge genre (ikon + warna), nama narasumber, judul karya, konteks penyampaian (Pertunjukan/Teks), tanggal, status, serta progress bar kemajuan pengisian (X/7 seksi). Tersedia tiga filter: kelengkapan (Semua / Belum Lengkap / Sudah Lengkap), **Genre**, dan **Konteks**. Setiap kartu memiliki tombol Edit, Hapus, dan Duplikat. Formulir entri bersifat dinamis: Seksi A–B selalu tampil, sedangkan Seksi C (Data Karya) dan D (Konteks) menyesuaikan genre dan konteks yang dipilih, diikuti Seksi E–G dan Z.

#### C. Panel Data Lokasi dan Informan (Administrasi)

Panel ini digunakan untuk melengkapi data latar belakang administratif informan sebelum proses pengumpulan data kuesioner dimulai. Panel ini memiliki perilaku **tutup otomatis** (*auto-collapse*) yang akan menutup laci secara otomatis jika area kuesioner di bawahnya disentuh, sehingga ruang pandang layar tetap luas.

- **Laci Lokasi Pengambilan Data:** berisi input nama desa, kecamatan, kabupaten, serta kolom lintang dan bujur koordinat GPS. Dilengkapi tombol **"Deteksi Lokasi GPS"** untuk menarik titik koordinat secara akurat langsung dari sensor satelit perangkat.
- **Laci Data Diri Informan:** berisi input nama lengkap informan, jenis kelamin, usia, tingkat pendidikan terakhir, serta keterangan sosial-bahasa lainnya.
- **Kamera Langsung Berbasis WebRTC:** tombol berwarna oranye untuk mengaktifkan kamera depan atau belakang perangkat secara langsung di dalam aplikasi. Sistem akan otomatis beralih menampilkan tombol **"Pilih dari Galeri"** jika kamera bermasalah atau izin akses kamera ditolak.

#### D. Panel Kontrol Kuesioner

Panel ini terletak di bawah panel administratif dan digunakan untuk mengatur navigasi butir berian secara efisien.

- **Penyaring Kategori (*Dropdown Selector*):** memungkinkan Anda melompat langsung ke kelompok kosakata tertentu, misalnya *Swadesh*, *Rumah dan Bagiannya*, atau *Flora dan Fauna*. Total terdapat 24 kategori berian.
- **Pencarian Cepat:** kolom pencarian teks instan untuk mencari kata berian atau konsep tertentu di seluruh daftar kuesioner.
- **Kotak Centang Ragu-Ragu:** kotak centang khusus untuk menyaring dan menampilkan hanya butir pertanyaan yang ditandai ragu-ragu oleh pewawancara.
- **Tombol Navigasi Cepat:** tombol untuk beralih ke konsep sebelumnya, berikutnya, kartu pertama, kartu terakhir, atau kartu kosong berikutnya.

#### E. Kartu Berian Interaktif (*3D Flip Card*)

Kartu utama di tengah layar berfungsi sebagai media interaksi utama. Kartu ini menggunakan teknologi balik 3D untuk menampilkan informasi dalam dua sisi.

##### Sisi Depan (Media Stimulus)

- **Kategori dan Nomor ID Berian:** menampilkan nomor urut konsep kosakata dari total 1.191 berian beserta klasifikasi kategorinya.
- **Gambar Ilustrasi Berian:** menampilkan visualisasi WebP dari konsep yang ditanyakan agar informan lebih mudah mengenali objek yang dimaksud.
- **Tombol Layar Penuh Gambar (⛶):** memperbesar gambar hingga memenuhi seluruh layar perangkat untuk membantu informan yang memiliki gangguan penglihatan.
- **Pertanyaan atau Keterangan Stimulus:** berisi panduan pertanyaan verbal yang dibacakan oleh pewawancara.

##### Sisi Belakang (Lembar Input Pewawancara)

- **Nama Konsep Utama:** kata dasar bahasa Indonesia yang sedang dicari padanannya.
- **Kotak Input Transkripsi Fonetis:** tempat mengetik respons padanan kata dari informan. Bagian ini mendukung transkripsi simbol fonetis IPA secara penuh.
- **Tombol Riwayat Versi (Memori Ketikan):** menampilkan riwayat hingga lima teks ketikan sebelumnya untuk konsep yang sama, sehingga pewawancara dapat memulihkan teks lama jika terjadi kesalahan ketik.
- **Kotak Centang Ragu-Ragu (⚐):** memberi tanda jika pewawancara meragukan kebenaran pengucapan atau transkripsi.
- **Kotak Catatan Lapangan:** menuliskan catatan sosiolinguistik tambahan, seperti dialek, varian fonetis minor, atau konteks.

### 2.3 Fitur Kuesioner Bahasa

#### A. Perekaman Suara Berkualitas Tinggi (Audio Opus)

Aplikasi dilengkapi modul perekam suara internal sehingga pewawancara tidak perlu membuka aplikasi perekam eksternal.

- **Bilah Volume Waktu Nyata:** menunjukkan tingkat sensitivitas tangkapan mikrofon. Pastikan bilah bergerak saat informan berbicara.
- **Kompresi Otomatis (Opus):** suara yang direkam dikompresi langsung menggunakan format audio Opus (kontainer WebM) yang sangat hemat ruang penyimpanan, tetapi tetap jernih.
- **Aksi Audio:** setelah rekaman dihentikan, akan muncul pemutar audio mini lengkap dengan bilah progres mulus, tombol **"Ulangi"** untuk menimpa rekaman, serta ikon **"Hapus"** untuk menghapus rekaman dari memori.

#### B. Visualisasi Akustik Mirip Praat (PraatViz)

Salah satu fitur paling mutakhir di Apsara-Peta adalah instrumen analisis fonetis akustik internal. Penjelasan terperinci tersedia pada [Panduan Visualisasi Praat](#42-panduan-visualisasi-praat).

#### C. Fasilitas Pengetikan IPA (Kibor Virtual dan Kibor Fisik)

Apsara-Peta mendukung penulisan karakter Fonetis Internasional (IPA) secara penuh dengan menggunakan jenis huruf khusus **Doulos SIL** yang terintegrasi serta dukungan font kustom yang dapat diunggah oleh pengguna pada antarmuka.

##### 1. Kibor Virtual (untuk Ponsel dan Tablet)

Bagi pewawancara yang menggunakan perangkat layar sentuh, aplikasi menyediakan kibor virtual fonetis khusus.

- **Cara Mengaktifkan:** ketuk tombol bertuliskan **"⌨ Kibor"** di sisi kanan kotak input berian. Kibor virtual akan muncul dari bagian bawah layar (*slide up*).
- **Tampilan Visual Tombol Ganda:** setiap tombol pada kibor virtual menampilkan dua karakter secara bertingkat sebagai pratinjau cepat.
  - **Karakter Dasar:** di posisi tengah bawah, berwarna gelap; karakter ini diketik saat tombol diketuk normal.
  - **Karakter Pratinjau IPA:** di posisi atas, dengan ukuran lebih kecil dan warna kontras; simbol IPA utama yang terasosiasi dengan tombol tersebut.

  ```text
  ┌───────────┐ ┌───────────┐
  │ æ         │ │ ŋ         │   ◄── Karakter Pratinjau IPA
  │           │ │           │
  │     a     │ │     n     │   ◄── Karakter Latin Dasar
  │           │ │           │
  └───────────┘ └───────────┘
  ```

- **Tombol Opsi (⧉):** beralih antarlapisan antarmuka kibor, antara baris karakter huruf Latin biasa (`abc`) dan karakter fonetis khusus (`IPA`).
- **Tombol Kunci Kapital (⇪):** mengaktifkan kunci huruf kapital (*Caps Lock*) secara permanen.
- **Tombol Shift (⇧):** ketuk satu kali untuk membuat huruf berikutnya menjadi kapital, lalu otomatis kembali ke huruf kecil.
- **Mekanisme Tahan dan Geser:** apabila Anda menahan tombol Latin dasar atau tombol tanda diakritik, menu sembulan horizontal akan muncul dan melayang di atas jari Anda. Geser jari ke kiri atau kanan untuk memilih variasi karakter IPA yang diinginkan, lalu lepaskan jari untuk memasukkannya.

  Contoh varian huruf nasal `[n]`:

  ```text
  Menu Sembulan Pilihan Simbol IPA (Doulos SIL)
        ┌─────┬─────┬─────┬─────┐
        │  ŋ  │  ɲ  │  ɳ  │  ɴ  │  ◄── Geser jari untuk memilih
        └─────┴──┬──┴─────┴─────┘     (nasal: eng, ny, retrofleks, uvular)
                 │
           ┌─────┴─────┐
           │ ŋ         │
           │    [n]    │  ◄── Jari menahan di sini
           └───────────┘
  ```

- **Cara Menutup:** ketuk tombol tanda silang **"✕"** di pojok kanan atas bilah pegangan kibor virtual.
- **Penyesuaian Posisi:** kibor virtual dapat **digeser** ke posisi mana saja di layar dengan menahan dan menyeret bilah pegangan kibor.

##### 2. Pintasan Kibor Fisik (untuk Laptop atau Kibor Bluetooth)

Jika Anda menggunakan laptop atau menyambungkan kibor fisik eksternal, Anda dapat mengetik simbol IPA secara instan menggunakan kombinasi `Alt + huruf` pada kotak input berian. Lihat [Daftar Pintasan IPA](#41-daftar-pintasan-ipa).

#### D. Kolaborasi Luring: Penggabungan Data Tim

Kuesioner pemetaan bahasa yang terdiri atas 1.191 konsep sering kali dibagi kepada dua atau tiga pewawancara untuk menghemat waktu wawancara dengan informan. Apsara-Peta memfasilitasi penggabungan data ini secara luring pada akhir survei.

1. Pewawancara B mengekspor berkas hasil kerjanya ke format ZIP yang berisi berkas Excel dan berkas audio rekaman.
2. Kirimkan berkas `.zip` tersebut ke perangkat Pewawancara A melalui Bluetooth, Wi-Fi Direct, kabel data USB, atau WhatsApp.
3. Pewawancara A membuka aplikasi, lalu mengetuk tombol **"⚯ Gabung Data Tim"** pada menu samping.
4. Pewawancara A memilih berkas `.zip` milik Pewawancara B.
5. Sistem akan secara otomatis mengimpor teks berian dan suara dari Pewawancara B **hanya pada kolom-kolom berian Pewawancara A yang masih kosong, tanpa menimpa data yang sudah diisi oleh Pewawancara A**.
6. Pewawancara A kini memiliki data gabungan yang lengkap dari kedua pewawancara.

#### E. Pengunduhan Gambar Luring Secara Massal

Secara bawaan, *service worker* hanya mengunduh gambar saat Anda membuka halaman berian yang bersangkutan. Agar 1.191 gambar berian tersedia sejak awal ketika perangkat luring, lakukan langkah berikut.

1. Ketuk tombol informasi **"i"** di pojok kanan atas bilah kepala.
2. Ketuk tombol hijau **"Unduh Gambar Offline"**.
3. Sistem akan mengunduh seluruh 1.191 gambar WebP kuesioner ke dalam *cache* aset khusus. Biarkan proses berjalan hingga **100% selesai**. Proses ini membutuhkan waktu satu sampai dua menit dengan koneksi internet 4G yang stabil. Pastikan layar perangkat tetap menyala selama proses berlangsung.

Apabila gambar belum diunduh, tombol "i" akan berkedip merah selama beberapa detik setelah aplikasi dibuka sebagai pengingat agar Anda mengunduh gambar sebelum berangkat ke lapangan.

### 2.4 Fitur Kuesioner Sastra Lisan

Kuesioner Sastra Lisan adalah modul baru yang ditambahkan pada Apsara-Peta. Tab ini berfungsi sebagai pendamping dari Kuesioner Pemetaan Bahasa dan dirancang khusus untuk mendokumentasikan informasi informan sastra lisan beserta teks sastra dan media pendukungnya. Modul ini menggunakan basis data IndexedDB yang sama (`BerianDB_v1`) dengan *object store* terpisah bernama `sastra_data`.

#### A. Daftar Informan

Saat tab "Kuesioner Sastra Lisan" dibuka, aplikasi menampilkan daftar seluruh entri sastra lisan dalam bentuk **kartu** (*card layout*) yang responsif di perangkat mobile. Setiap kartu menampilkan:

| Elemen          | Keterangan                                            |
| :-------------- | :---------------------------------------------------- |
| Badge genre     | Ikon SVG + warna sesuai genre (mis. Cerita Rakyat).   |
| Narasumber      | Nama lengkap narasumber.                              |
| Judul           | Judul/nama karya sastra lisan.                        |
| Konteks         | Pertunjukan atau Murni Teks / Tuturan.               |
| Tanggal & Status| Tanggal entri otomatis; DRAFT atau SELESAI.          |
| Progress bar    | X/7 seksi terisi.                                    |
| Aksi            | Tombol Edit, Hapus, Duplikat.                        |

**Tiga filter** di atas daftar:
- **Kelengkapan** — Semua / Belum Lengkap / Sudah Lengkap.
- **Genre** — Semua Genre atau salah satu dari enam genre.
- **Konteks** — Semua Konteks / Pertunjukan / Murni Teks.

**Tombol Duplikat:** menyalin **seluruh** data entri (termasuk genre, konteks, dan data karya) sebagai draf baru; hanya berkas media yang dikosongkan. Berguna ketika narasumber yang sama membawakan beberapa karya.

#### B. Formulir Dinamis (Seksi A, B, C, D, E, F, G, Z)

Formulir disusun dalam akordion. **Seksi A dan B selalu tampil**; **Seksi B mengunci** isi Seksi C dan D. Saat *Konteks* atau *Genre* diubah, Seksi C dan D dibangun ulang menyesuaikan pilihan, tanpa meninggalkan posisi seksi yang sedang dibuka.

- **Seksi A — Data Narasumber (tetap):** nama, foto narasumber (kamera/galeri), jenis kelamin, keberadaan & detail komunitas, tempat/tanggal lahir + usia otomatis, kategori narasumber, pekerjaan, keahlian, suku, daerah asal, bahasa dikuasai, kondisi fisik, alamat lengkap, dan titik koordinat GPS.
- **Seksi B — Identifikasi Sastra Lisan (kunci):**
  - **B1 Nama Sastra Lisan**, **B2 Lokasi** (Desa, Kecamatan, Kabupaten, Provinsi, Pulau, Koordinat GPS, Waktu otomatis dari GPS).
  - **B3 Konteks Penyampaian** — pilih **Pertunjukan** atau **Murni Teks / Tuturan**.
  - **B4 Genre Utama** — enam genre + "Lainnya" (input bebas). Memunculkan panel **Sifat** genre.
  - **B5 Sub-genre** — daftar menyesuaikan genre; memunculkan panel **Ciri + Contoh & asal daerah**, plus tombol **"ⓘ Lihat semua jenis"** (katalog lengkap, klik untuk memilih).
  - **B6 Unsur yang Terkandung** — centang (Naratif, Puisi, Nyanyian, Komedi/Dagelan, Musik, Tari, Ritual, Dialog) — *hanya muncul jika Konteks = Pertunjukan*.
  - **B7 Bahasa** dan **B8 Catatan/Keterangan**.
- **Seksi C — Data Karya (per genre):** field inti (Judul, Pengarang, Sumber/Tahun, Tema, Bahasa Karya) ditambah field khas genre — mis. Cerita Rakyat (tokoh, latar, alur, durasi), Puisi Rakyat (bait, larik, pola sajak, metrum), Nyanyian (laras, irama, pengiring), Ungkapan (teks, makna), Teka-teki (pertanyaan, jawaban), Drama (lakon, dalang, pemain, musik, properti).
- **Seksi D — Kondisi Penyampaian (per konteks):**
  - *Pertunjukan* → kuesioner pertunjukan lengkap (tempat, frekuensi, waktu, jumlah & siapa penonton, iringan musik, properti, bahasa, catatan) — **memakai ulang field `sastra_*`** yang lama sehingga kompatibel mundur.
  - *Murni Teks* → ringkas: kondisi penuturan (Dibacakan/Dihafal/Improvisasi/Campuran), siapa yang mengucapkan, kepada siapa, bahasa, frekuensi, durasi, jumlah baris/bait, catatan.
- **Seksi E — Analisis Bahasa:** register/tingkat tutur dan kosakata khusus.
- **Seksi F — Pewarisan:** dari siapa dipelajari, hubungan, sejak kapan, masih hidup/lazim, terakhir didengar, sistem pewarisan (Terbuka/Tertutup), varian lain.
- **Seksi G — Dokumentasi Media:**
  - **Audio sampel:** rekam langsung (MediaRecorder, indikator level, timer ≤ 60 detik dengan auto-stop, estimasi ukuran) **atau** unggah berkas.
  - **Video sampel:** rekam langsung (640×480, ≤ 60 detik, auto-stop) **atau** unggah berkas. Rekaman ini untuk **sampel**; dokumentasi utama tetap memakai alat perekam eksternal.
  - **Foto:** ambil foto (kamera) dan/atau unggah banyak foto; tampil sebagai galeri yang dapat dihapus per item.
- **Seksi Z — Status & Pencatat:** pewawancara, lembaga/satker, tanggal pengambilan otomatis, metadata dokumentasi (perekam, transkripsi, terjemahan beserta instansinya), dan catatan lapangan.

> **Setiap pilihan ber-opsi "Lainnya"** (genre, sub-genre, dan dropdown lain) memunculkan kolom isian manual sehingga bentuk hiper-lokal yang belum terdaftar tetap dapat dicatat.

#### C. Bidang Bersyarat (Conditional)

Beberapa bidang muncul/menghilang otomatis bergantung jawaban sebelumnya. Contoh: **"Nama Komunitas", "Tanggal Berdiri", "Pendiri", "Alamat Sekretariat"** hanya tampil jika **Komunitas = Ada**; **B6 Unsur yang Terkandung** hanya tampil jika **Konteks = Pertunjukan**; kolom **"… (Lainnya)"** hanya tampil jika opsi `Lainnya` dipilih; serta **Seksi C dan D berganti** mengikuti Genre dan Konteks.

#### D. Penyimpanan Otomatis (Auto-Save)

Setiap perubahan pada formulir akan dijadwalkan tersimpan secara otomatis dengan jeda **1,5 detik** setelah input terakhir berhenti. Indikator **"[Tersimpan]"** berwarna hijau akan berkedip singkat di pojok kanan atas formulir setiap kali penyimpanan berhasil.

#### E. Hapus Entri

Tombol **"Hapus"** pada setiap baris di daftar informan memunculkan dialog konfirmasi sebelum entri dihapus secara permanen dari `IndexedDB`. Tindakan ini **tidak dapat dibatalkan**, jadi pastikan Anda yakin sebelum mengeklik **"OK"**.

#### F. Ekspor Data Sastra ke ZIP

Tombol **"Ekspor Data Sastra (ZIP)"** di bagian bawah daftar menghasilkan berkas `Ekspor_Sastra_<YYYYMMDD>.zip` yang berisi:

- `Sastra_Lisan.csv` — seluruh data tekstual. Kolom tetap (ID, Konteks, Genre, Sub-genre, Nama Sastra, Judul, Narasumber, JK, Usia, Tanggal, Status) **digabung dengan seluruh field dari semua genre** sebagai kolom dinamis (kosong jika tidak relevan), termasuk kolom isian "Lainnya". Encoding UTF-8 dengan BOM agar Excel membacanya.
- Satu folder per entri bernama `<Nama>_<Judul>_<ID>/` berisi berkas audio, video, dan foto yang terlampir.

### 2.5 Fitur Pendukung

| Fitur | Penjelasan |
| :--- | :--- |
| **Mode Gelap** | Tombol mode gelap berada di bilah kepala. Pilihan disimpan di penyimpanan peramban dan dipulihkan saat aplikasi dibuka kembali. |
| **Lencana Daring/Luring** | Ditampilkan pada bilah kepala. Status berubah secara otomatis berdasarkan event jaringan peramban. |
| **Auto Backup (Pengingat Pencadangan)** | Setiap 15 detik, sistem mengecek jumlah berian yang telah terisi. Setiap kelipatan 50 berian baru, aplikasi menampilkan *toast* peringatan agar pewawancara segera melakukan ekspor ZIP. |
| **Riwayat Versi (Memori Ketikan)** | Setiap kali kotak input berian kehilangan fokus (*blur*), teksnya disimpan ke memori riwayat (maksimum lima versi terakhir per konsep). Tombol **"Versi"** menampilkan modal daftar lima versi terakhir agar dapat dipulihkan. |
| **Tinjau Ragu-Ragu** | Tombol **"⚐ Daftar Perlu Verifikasi"** menampilkan modal berisi seluruh berian yang ditandai ragu-ragu. Klik pada salah satu kartu akan melompat langsung ke berian tersebut. |
| **Validasi Ekspor** | Sebelum mengekspor ZIP, sistem memeriksa kelengkapan metadata. Jika nama isolek atau koordinat GPS belum diisi, akan muncul dialog konfirmasi. |
| **Pasangan PWA dalam Aplikasi** | Tombol **"⬇ Pasang Aplikasi"** muncul otomatis pada peramban yang mendukung pemasangan PWA. |
| **Pintasan IPA** | Lihat [Daftar Pintasan IPA](#41-daftar-pintasan-ipa). |

### 2.6 Panduan Langkah demi Langkah

Berikut adalah urutan kerja teratur yang disarankan saat pengambilan data lapangan.

#### Langkah 1: Persiapan Administratif

1. Buka Apsara-Peta dari layar utama perangkat Anda.
2. Ketuk **Panel Administratif** di bagian atas layar.
3. Isi nama informan, jenis kelamin, usia, dan data sosial lainnya.
4. Ketuk tombol oranye **"📸 Buka Kamera Live"**. Ambil foto potret wajah informan dengan tombol **"🔴 Jepret!"**.
5. Berdirilah di area terbuka, misalnya teras rumah informan, lalu ketuk **"Deteksi Lokasi GPS"** untuk mencatat koordinat.

#### Langkah 2: Proses Wawancara dan Perekaman

1. Buka kartu kuesioner pertama (ID 1: konsep "abu").
2. Tunjukkan gambar ilustrasi kepada informan sebagai stimulus.
3. Bacakan pertanyaan stimulus kepada informan.
4. Ketika informan siap menjawab, ketuk **"Mulai Rekam"**.
5. Pastikan bilah audio bergerak aktif saat informan berbicara.
6. Setelah informan selesai, ketuk **"Hentikan Rekaman"**.
7. Ketikkan transkripsi fonetis. Pada laptop dengan kibor fisik, gunakan pintasan `Alt + huruf` untuk simbol IPA.

#### Langkah 3: Penanganan Data Ragu-Ragu

1. Jika informan ragu-ragu, atau Anda merasa perlu verifikasi ulang, beri centang pada kotak **"Ragu-Ragu (⚐)"**.
2. Tuliskan alasan keraguan pada kolom **Catatan Lapangan**, misalnya *"konsonan akhir agak mendengung"*.
3. Lanjutkan ke konsep berikutnya dengan tombol navigasi **"Berikutnya"**.

#### Langkah 4: Peninjauan Kembali

1. Sebelum mengakhiri sesi, tinjau kembali data ragu-ragu.
2. Ketuk **"⚐ Daftar Perlu Verifikasi"**.
3. Akan muncul daftar kartu berisi seluruh ID dan konsep yang ditandai ragu-ragu.
4. Ketuk salah satu kartu. Aplikasi melompat ke berian tersebut sehingga Anda dapat memutar ulang audio melalui PraatViz dan memperbaiki transkripsinya.

#### Langkah 5: Ekspor dan Pengamanan Data Harian

> Data IndexedDB rentan terhapus oleh pembersih *cache* otomatis peramban. **Lakukan pencadangan setiap akhir hari wawancara.**

1. Buka bilah menu samping.
2. Ketuk **"Simpan Data Lokal (.zip)"**.
3. Jika nama isolek atau koordinat GPS belum lengkap, akan muncul dialog konfirmasi. Konfirmasikan untuk melanjutkan jika Anda yakin.
4. Tunggu hingga proses pembuatan ZIP selesai (satu sampai tiga menit, bergantung pada jumlah audio). **Jangan tutup aplikasi selama proses berlangsung.**
5. Peramban mengunduh berkas `apsara_data.zip` yang berisi seluruh transkripsi (Excel `.xls`) dan rekaman audio (`.webm`).
6. Setelah pulang ke area dengan koneksi internet, salin berkas ZIP ke penyimpanan awan (Google Drive, OneDrive, dan sebagainya) untuk redundansi.

#### Langkah 6: Pengumpulan Data Sastra Lisan

Jika sesi pengambilan data juga mencakup dokumentasi sastra lisan:

1. Ketuk tab **"Kuesioner Sastra Lisan"** di samping tab Pemetaan Bahasa.
2. Ketuk **"+ Tambah Baru"** untuk membuat entri informan sastra.
3. Isi formulir akordion Bagian A sampai E satu per satu. Auto-save aktif setiap 1,5 detik.
4. Pada Bagian B, gunakan **"Ambil GPS"** untuk mencatat koordinat lokasi pertunjukan.
5. Unggah foto-foto pertunjukan (multi-upload), satu rekaman audio, dan satu berkas video (opsional).
6. Setelah selesai, ubah status dari **"Draft"** menjadi **"Selesai"** di pojok kanan atas formulir.
7. Ketuk **"< Kembali"** untuk kembali ke daftar informan.
8. Di akhir sesi, ketuk **"Ekspor Data Sastra (ZIP)"** untuk mengunduh seluruh data sastra ke berkas `Ekspor_Sastra_<YYYYMMDD>.zip`.

### 2.7 Tip dan Penanganan Masalah

#### A. Rekaman Suara Tidak Berfungsi

- **Penyebab:** izin akses mikrofon ditolak.
- **Solusi:** buka pengaturan aplikasi peramban Anda, cari opsi **"Izin"**, lalu aktifkan izin mikrofon. Alternatif: ketuk ikon gembok kecil di sebelah kiri bilah alamat URL, lalu ubah status mikrofon menjadi **"Izinkan"**.

#### B. Gambar Ilustrasi Berian Tidak Muncul Saat Luring

- **Penyebab:** belum mengunduh basis data gambar secara massal.
- **Solusi:** hubungkan perangkat ke internet, klik ikon **"i"** di pojok kanan atas, lalu klik **"Unduh Gambar Offline"** dan tunggu hingga 100%.

#### C. Khawatir Kehilangan Data karena Sistem Ponsel

- **Penyebab:** aplikasi pembersih memori otomatis pada Android dapat menghapus berkas penyimpanan peramban secara berkala.
- **Pencegahan:** selalu lakukan pencadangan dengan **"Simpan Data Lokal (.zip)"** pada setiap akhir hari kerja dan amankan berkas ZIP ke penyimpanan eksternal (kartu SD, ponsel rekan setim, atau Google Drive).

#### D. Fitur GPS Kurang Akurat

- **Penyebab:** deteksi GPS dilakukan di dalam ruangan tertutup atau di bangunan berdinding beton tebal.
- **Solusi:** keluar ke halaman rumah informan yang langsung terpapar langit terbuka, lalu ketuk kembali **"Deteksi Lokasi GPS"**. Tunggu hingga angka koordinat stabil sebelum menekan tombol simpan.

#### E. Kibor Virtual Tidak Muncul

- **Penyebab:** Anda mungkin menyentuh kotak input dari peramban yang juga membuka kibor sistem perangkat secara bersamaan.
- **Solusi:** ketuk tombol **"⌨ Kibor"** secara eksplisit (bukan langsung menyentuh kotak input). Jika kibor virtual sudah terbuka, ketuk **"✕"** di pojok kanan atas kibor untuk menutup.

#### F. Audio Tidak Terdengar Saat Pemutaran

- **Penyebab umum:** volume perangkat mati, mikrofon hanya menangkap suara sangat lirih, atau peramban memblokir pemutaran otomatis.
- **Solusi:** tingkatkan volume, periksa indikator bilah audio saat merekam ulang, dan pastikan Anda telah berinteraksi dengan halaman (misalnya menekan tombol "Putar" sekali) sebelum memutar audio.

#### G. GPS Timeout

- **Penyebab:** sinyal satelit lemah atau perangkat berada di ruangan tertutup.
- **Solusi:** keluar ke ruang terbuka, tunggu sepuluh hingga tiga puluh detik, lalu coba ulangi tombol deteksi.

#### H. Data Hilang Setelah Pembaruan PWA

> **Tidak akan terjadi.** Data IndexedDB **tidak** dihapus saat *service worker* memperbarui *cache* aplikasi. *Cache* aplikasi hanya berisi berkas-berkas seperti HTML, JavaScript, dan gambar, sedangkan data lapangan tersimpan terpisah di *IndexedDB* yang persistensinya dijamin peramban selama tidak ada penghapusan eksplisit.

Namun apabila Anda menghapus data peramban secara manual melalui menu **"Pengaturan Situs"** atau menggunakan opsi **"Hapus Data Penjelajahan"**, data lapangan akan ikut terhapus. Lakukan pencadangan ZIP terlebih dahulu sebelum tindakan ini.

#### I. Gambar Tidak Tampil di Kartu (Kondisi Daring)

- **Penyebab:** koneksi internet lambat atau berkas gambar belum tercache.
- **Solusi:** tunggu beberapa detik agar gambar selesai diunduh, atau lakukan **"Unduh Gambar Offline"** dari modal informasi.

#### J. Font IPA Tampil Kotak-Kotak

- **Penyebab:** font Doulos SIL belum termuat dari *cache* atau koneksi internet bermasalah saat pemasangan awal.
- **Solusi:** sambungkan perangkat ke internet, muat ulang aplikasi (tutup penuh lalu buka kembali), dan tunggu hingga font selesai diunduh oleh *service worker*. Pada beberapa kasus, gunakan menu pengaturan untuk **unggah font fonetis** kustom Anda sendiri (fitur unggah font tersedia pada antarmuka).

#### K. Tab Sastra Kosong atau Blank

- **Penyebab umum:** *object store* `sastra_data` belum dibuat. Hal ini biasanya hanya terjadi pada perangkat yang sebelumnya memiliki basis data versi lama.
- **Solusi:** tutup aplikasi, hapus *cache* peramban untuk situs aplikasi, lalu buka kembali aplikasi. *Object store* akan terbentuk secara otomatis melalui mekanisme `onupgradeneeded` di sisi peramban.

#### L. Aplikasi Minta Pasangan Ulang Terus

- **Penyebab:** *service worker* dengan versi berbeda telah dideregistrasi, biasanya akibat pembersihan *cache* atau pemulihan pabrik.
- **Solusi:** pasang ulang dari tombol **"⬇ Pasang Aplikasi"** atau menu pasangan peramban. Data IndexedDB tetap aman.

#### M. Penyimpanan Penuh (Batas IndexedDB)

- **Penyebab:** perangkat memiliki sedikit ruang kosong sehingga peramban membatasi kuota IndexedDB.
- **Solusi:** ekspor data ke ZIP, lalu **hapus rekaman audio lama yang sudah diekspor** untuk membebaskan ruang. Pada Android, periksa juga **"Pengaturan → Penyimpanan"** untuk membebaskan ruang umum perangkat.

#### N. Kalender Tidak Muncul di Mobile

- **Penyebab:** peramban tertentu tidak menampilkan date picker native karena konflik CSS atau keterbatasan peramban.
- **Solusi:** muat ulang paksa dengan `Ctrl + Shift + R`. Jika tetap tidak muncul, bersihkan cache peramban (F12 → Application → Clear site data), lalu muat ulang. Pastikan aplikasi diakses melalui `http://localhost` atau URL HTTPS, **bukan** melalui `file:///`.

#### O. Reverse Geocoding Gagal (Luring)

- **Penyebab:** perangkat tidak terhubung internet saat tombol "Ambil GPS" ditekan. Reverse geocoding memerlukan koneksi ke layanan Nominatim (OpenStreetMap).
- **Solusi:** koordinat GPS tetap tersimpan. Field alamat (Provinsi, Kabupaten, dan seterusnya) dapat diisi secara manual oleh pewawancara.

#### P. Error CORS Saat Membuka Aplikasi

- **Penyebab:** membuka `index.html` langsung dari folder lokal (`file:///C:/...`) tanpa server.
- **Solusi:** gunakan *local server* untuk pengembangan (`python -m http.server 3000` atau VS Code *Live Server*). **Jangan** buka aplikasi langsung dari *file explorer*.

#### Q. Data Kosong Setelah Pembersihan Cache

- **Penyebab:** menekan **"Clear site data"** di Developer Tools menghapus seluruh IndexedDB termasuk data lapangan.
- **Solusi:** jangan tekan "Clear site data" kecuali benar-benar diperlukan. Cukup **"Unregister Service Worker"** lalu `Ctrl + Shift + R` untuk memperbarui berkas aplikasi tanpa menghapus data. Selalu **ekspor ZIP terlebih dahulu** sebelum pembersihan cache.

---

## 3. Panduan Administrator

Bagian ini diperuntukkan bagi administrator atau pengelola TI yang bertugas menyiapkan, memperbarui, dan mendistribusikan Apsara-Peta sebelum digunakan oleh pewawancara di lapangan.

### 3.1 Ringkasan Pembaruan

Apsara-Peta telah melalui beberapa iterasi versi. Berikut riwayat singkatnya.

| Versi | Catatan singkat |
| :--- | :--- |
| v1 dan v2 (lama) | Versi monolit dengan seluruh logika di `index.html` dan berkas tambahan `apsara_modul_tambahan.js` di akar proyek. |
| v3 sampai v5 (lama) | Penambahan *service worker* agresif, dukungan PWA, perekaman audio Opus, dan visualisasi PraatViz. |
| v6 sampai v7 | Penambahan kuesioner sastra lisan (tab baru), perombakan struktur folder dari akar ke `aset/` dan `js/`. |
| v8 (modularisasi Fase-1) | 11 modul lama yang sebelumnya yatim disambungkan menjadi modul aktif. Berkas `loader.js` menjadi *init-runner* tunggal. |
| v9 | Data 1.191 berian dipindahkan dari `index.html` ke `aset/berian_data.js`. Tombol hapus entri sastra ditambahkan. Sejumlah *cruft* dibersihkan. |
| **v10 (versi saat ini)** | Kuesioner Sastra Lisan dirombak menjadi formulir dinamis berbasis genre (dua sumbu Konteks × Genre, taksonomi se-Indonesia, panduan kontekstual, ikon SVG, rekam audio/video sampel). Hanya `js/sastra.js` dan `js/ekspor_sastra.js` yang berubah; kompatibel mundur dengan entri lama. |

Arsitektur modular saat ini berisi 20 berkas JavaScript di folder `js/`, terdiri atas:

- 1 berkas utilitas (`core.js`),
- 1 berkas *init-runner* (`loader.js`),
- 18 modul fitur (lima modul "Fase-2" untuk fitur inti seperti navigasi, kibor, metadata, audio, dan ekspor; sepuluh modul "Fase-1" untuk fitur tambahan; dan tiga modul independen: `praat.js`, `sastra.js`, serta `ekspor_sastra.js`).

### 3.2 Struktur Teknis Aplikasi

#### Arsitektur Modul

```
┌─────────────────────────────────────────────────────────────┐
│                       index.html                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  IIFE inti (sekitar baris 3000–4900)                │   │
│  │  - State global: userData, metaData, db, filtered…  │   │
│  │  - Fungsi inti: render, applyFilter, init...        │   │
│  │  - Ekspos: window.ApsaraInternals (dipakai modul)   │   │
│  │  - Ekspos: window.ApsaraAPI (antarmuka publik)      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │
         ├─ aset/berian_data.js  → window.BERIAN_DATA
         │
         ├─ js/core.js          → window.$, escHTML, ApsaraBus, ApsaraState
         │
         ├─ js/entri.js, kibor.js, metadata.js, audio.js, ekspor.js,
         │  praat.js, sastra.js, ekspor_sastra.js,
         │  status_koneksi.js, tema_gelap.js, install_pwa.js,
         │  auto_backup.js, riwayat_versi.js, shortcut_ipa.js,
         │  validasi_ekspor.js, tinjau_ragu.js, gabung_data.js,
         │  halaman_tentang.js
         │     │
         │     └─ Pola: (function(){ window.ApsaraModules.push({name, init}) })()
         │
         └─ js/loader.js  → setInterval menunggu ApsaraAPI + BERIAN_DATA,
                            lalu memanggil init() seluruh modul terdaftar
```

#### IndexedDB

| Atribut | Nilai |
| :--- | :--- |
| Nama basis data | `BerianDB_v1` |
| Versi | 3 |
| Object store 1 | `kuesioner_data` (data Pemetaan Bahasa, kunci primer `id`) |
| Object store 2 | `sastra_data` (data Sastra Lisan, kunci primer `id` = `Date.now()`) |

Kedua *object store* dibuat secara *idempotent* pada `onupgradeneeded` di `index.html` dan `js/sastra.js`. Versi DB harus dinaikkan apabila skema (misalnya nama kolom) berubah agar perangkat lama ikut bermigrasi.

#### `window.ApsaraInternals` dan `window.ApsaraAPI`

- **`window.ApsaraInternals`** — antarmuka tertutup yang dipakai oleh modul Fase-2 internal (seperti `entri.js`, `kibor.js`, `audio.js`) untuk memanggil fungsi inti `render`, `applyFilter`, `goTo`, `toggleKeyboard`, `toggleRecord`, `deleteAudio`, dan sebagainya.
- **`window.ApsaraAPI`** — antarmuka publik yang dipakai oleh modul Fase-1 untuk operasi tingkat tinggi seperti `getCurrentId()`, `refreshUI()`, `toast()`, dan `goToId(id)`.

#### `window.ApsaraModules` dan `window.ApsaraBus`

- **`window.ApsaraModules`** — *registry* berbentuk larik tempat setiap modul mendaftarkan dirinya dengan objek `{ name, init }`. *Init-runner* `loader.js` akan memanggil setiap `init` setelah `ApsaraAPI` dan `BERIAN_DATA` tersedia.
- **`window.ApsaraBus`** — *event bus* sederhana untuk komunikasi antar modul: `ApsaraBus.on(event, fn)`, `ApsaraBus.emit(event, data)`, dan `ApsaraBus.off(event, fn)`.

### 3.3 Integrasi dan Pemasangan

#### 1. Pencadangan

Sebelum melakukan perubahan, amankan versi yang sedang berjalan.

```bash
git checkout -b backup/sebelum-perubahan
git push origin backup/sebelum-perubahan
```

Atau, jika belum menggunakan Git:

```bash
cp index.html index.html.backup
cp sw.js sw.js.backup
cp -r js js.backup
```

#### 2. Struktur Folder Saat Ini

Pastikan struktur folder mengikuti standar berikut.

```text
apsara-peta/
├── index.html
├── manifest.json
├── sw.js
├── Readme.md
├── .gitignore
├── js/
│   ├── core.js
│   ├── loader.js
│   ├── entri.js
│   ├── kibor.js
│   ├── metadata.js
│   ├── audio.js
│   ├── ekspor.js
│   ├── praat.js
│   ├── sastra.js
│   ├── ekspor_sastra.js
│   ├── status_koneksi.js
│   ├── tema_gelap.js
│   ├── install_pwa.js
│   ├── auto_backup.js
│   ├── riwayat_versi.js
│   ├── shortcut_ipa.js
│   ├── validasi_ekspor.js
│   ├── tinjau_ragu.js
│   ├── gabung_data.js
│   └── halaman_tentang.js
└── aset/
    ├── DoulosSIL-Regular.ttf
    ├── apsara-peta.png
    ├── berian_data.js
    ├── gambar_berian/
    └── gambar_panduan/
```

> Tidak ada lagi berkas `apsara_modul_tambahan.js`, `apsara_patch_inti.js`, atau `fonetis.TTF` di akar proyek. Berkas-berkas tersebut telah digantikan oleh struktur modular di `js/` dan konsolidasi font ke `aset/DoulosSIL-Regular.ttf`.

#### 3. Pemuatan Modul di `index.html`

Pastikan urutan `<script>` pada `index.html` mengikuti pola berikut.

```html
<!-- 1. CDN library (jszip, FileSaver) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>

<!-- ...struktur antarmuka HTML... -->

<!-- 2. Data berian dimuat SEBELUM IIFE utama -->
<script src="./aset/berian_data.js"></script>

<!-- 3. IIFE utama: mendefinisikan ApsaraInternals dan ApsaraAPI -->
<script>
  (() => {
    'use strict';
    // ...
  })();
</script>

<!-- 4. Inti utilitas (window.$, escHTML, ApsaraBus, ApsaraState) -->
<script src="./js/core.js"></script>

<!-- 5. Modul Fase-2 dan Sastra -->
<script src="./js/entri.js"></script>
<script src="./js/kibor.js"></script>
<script src="./js/metadata.js"></script>
<script src="./js/audio.js"></script>
<script src="./js/ekspor.js"></script>
<script src="./js/praat.js"></script>
<script src="./js/sastra.js"></script>
<script src="./js/ekspor_sastra.js"></script>

<!-- 6. Modul Fase-1 (urutan menentukan posisi badge di #mastheadBadges) -->
<script src="./js/status_koneksi.js"></script>
<script src="./js/tema_gelap.js"></script>
<script src="./js/shortcut_ipa.js"></script>
<script src="./js/install_pwa.js"></script>
<script src="./js/riwayat_versi.js"></script>
<script src="./js/auto_backup.js"></script>
<script src="./js/validasi_ekspor.js"></script>
<script src="./js/gabung_data.js"></script>
<script src="./js/tinjau_ragu.js"></script>
<script src="./js/halaman_tentang.js"></script>

<!-- 7. Registrasi service worker -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
  }
</script>

<!-- 8. Init-runner DI AKHIR -->
<script src="./js/loader.js"></script>
```

> **Urutan kritis:** `core.js` harus dimuat **sebelum** modul Fase-1 yang memakai `window.$`/`window.escHTML`. `loader.js` harus dimuat **paling akhir** agar seluruh modul telah terdaftar di `window.ApsaraModules` saat `init()` dipanggil.

#### 4. Konfigurasi Font Doulos SIL

Pastikan deklarasi `@font-face` pada `index.html` mengikuti pola berikut.

```css
@font-face {
  font-family: 'DoulosSIL';
  src: url('./aset/DoulosSIL-Regular.ttf') format('truetype');
}

@font-face {
  font-family: 'DoulosSILIPA';
  src: url('./aset/DoulosSIL-Regular.ttf') format('truetype');
}

:root {
  --fonetis: 'DoulosSILIPA', 'FonetisUser', serif;
}
```

> Catatan: `FonetisUser` adalah identitas font kustom yang **didaftarkan secara dinamis** melalui `FontFace` API ketika pewawancara mengunggah berkas font fonetis miliknya sendiri melalui antarmuka. Tidak ada berkas statis `fonetis.TTF` di proyek.

#### 5. Pembersihan Cache Lama

Setiap kali `sw.js` atau berkas modul diperbarui, *cache* peramban lama wajib dibersihkan agar aplikasi tidak memuat versi usang.

1. Buka aplikasi di peramban (sebaiknya Google Chrome).
2. Tekan `F12` untuk membuka **Developer Tools**.
3. Buka tab **Application**.
4. Pilih **Service Workers** di bilah kiri, lalu klik **Unregister**.
5. Pilih **Storage** di bilah kiri, lalu klik **Clear site data**.
6. Muat ulang halaman secara paksa dengan menekan `Ctrl + Shift + R`.

> **Penting:** sertakan instruksi ini saat memandu pewawancara di lapangan apabila mereka mengalami isu pemutakhiran. Pada perangkat seluler, langkah serupa dilakukan dengan menghapus data aplikasi peramban dari pengaturan sistem.

#### 6. Pengujian Server Lokal

Untuk pengembangan, jalankan server statis sederhana.

```bash
# Python 3
python -m http.server 8765

# Node.js
npx serve -l 8765
```

Buka `http://localhost:8765` di peramban, lalu pastikan:

- Lencana hijau **"Daring"** muncul di bilah kepala.
- Tab **"Pemetaan Bahasa"** dan **"Kuesioner Sastra Lisan"** dapat dialihkan.
- Konsol peramban (`F12 → Console`) tidak menampilkan *error*.
- `window.ApsaraModules.length` menghasilkan **15** (atau lebih jika ada modul tambahan).

### 3.4 Distribusi dan Penerbitan

Apsara-Peta dapat didistribusikan melalui beberapa kanal.

#### A. GitHub Pages (gratis, paling sederhana)

1. Buat akun di [github.com](https://github.com) jika belum memiliki.
2. Klik **"New"** untuk membuat *repository* baru, misalnya `apsara-peta`.
3. Pilih **Public** agar dapat diakses tim, lalu klik **Create repository**.
4. Pada halaman *repository*, unggah seluruh berkas aplikasi (drag-and-drop seluruh isi folder `apsara-peta/`).
5. Setelah unggahan selesai, masuk ke **Settings → Pages**.
6. Pada bagian **Build and deployment → Branch**, pilih `main` (atau `master`) dengan folder `/root`, lalu klik **Save**.
7. Tunggu satu hingga tiga menit. URL aplikasi akan tampil pada bagian atas halaman dengan format `https://<nama-akun>.github.io/apsara-peta/`.
8. Salin URL tersebut dan bagikan kepada tim pewawancara.

#### B. Cara Membuat APK Android

Apsara-Peta merupakan PWA yang dapat berfungsi sepenuhnya tanpa berkas APK. Namun, jika institusi Anda memerlukan distribusi berbasis APK (misalnya untuk pengelolaan MDM), berikut tiga opsi.

> Panduan ini bersifat umum. Lakukan pengujian menyeluruh sebelum distribusi.

##### Opsi 1: PWABuilder.com (paling mudah)

1. Buka [pwabuilder.com](https://www.pwabuilder.com).
2. Masukkan URL GitHub Pages aplikasi Anda.
3. Klik **"Package for stores"**, lalu pilih **Android**.
4. Unduh APK atau AAB yang dihasilkan.
5. Distribusikan via Google Play Store atau *direct download*.

##### Opsi 2: Bubblewrap (Google)

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://<URL>/manifest.json
bubblewrap build
```

Hasilnya adalah berkas APK yang siap distribusi.

##### Opsi 3: Trusted Web Activity (TWA) via Android Studio

1. Buka Android Studio.
2. **New Project → Empty Activity** (sesuaikan dengan template TWA).
3. Masukkan URL GitHub Pages aplikasi pada konfigurasi TWA.
4. Tambahkan *digital asset link* sesuai panduan TWA.
5. **Build → Generate APK/AAB**.
6. Tanda tangani dengan *keystore* yang Anda miliki untuk distribusi.

#### C. Distribusi iOS

- **PWA sudah cukup** untuk pewawancara iOS yang memasang melalui Safari.
- iOS **tidak mengizinkan *sideload*** APK atau berkas pasangan dari sumber non-App Store secara umum.
- **Opsi native** memerlukan akun Apple Developer (sekitar 99 dolar Amerika per tahun) dan proses build menggunakan Xcode.
- **TestFlight** dapat digunakan untuk distribusi internal terbatas (sampai 100 penguji) tanpa publikasi App Store.

#### D. Distribusi Alternatif

- **Direct download:** kirim berkas APK via WhatsApp, Bluetooth, atau Wi-Fi Direct.
- **Firebase App Distribution:** distribusi APK ke daftar penguji terdaftar.
- **Mobile Device Management (MDM):** kelola pemasangan massal pada perangkat institusi.
- **QR code:** cetak QR berisi URL aplikasi untuk akses cepat di lapangan.

### 3.5 Pembaruan Aplikasi

#### Mendorong Pembaruan ke GitHub Pages

```bash
git add .
git commit -m "Update: versi v10 (deskripsi singkat)"
git push origin main
```

GitHub Pages secara otomatis menyajikan versi baru dalam satu hingga tiga menit.

#### Apakah Data IndexedDB Hilang Saat Pembaruan?

> **TIDAK.** *Cache service worker* dan *IndexedDB* adalah dua mekanisme penyimpanan yang **terpisah**. Pembaruan *cache* tidak menyentuh basis data lapangan. Data pewawancara aman.

#### Menangani *Cache* Lama di Perangkat Pewawancara

1. Saat menyiapkan versi baru, **naikkan nilai `VERSION`** di `sw.js` (misalnya dari `v9-...` menjadi `v10-...`).
2. Setelah `push` ke GitHub Pages, *service worker* baru akan terdeteksi peramban pewawancara yang membuka aplikasi saat daring.
3. *Service worker* baru otomatis menghapus *cache* `apsara-app-<VERSI-LAMA>` dan `apsara-asset-<VERSI-LAMA>`, kemudian menyiapkan *cache* baru.
4. Bagi pewawancara: cukup buka aplikasi saat daring satu kali, lalu tutup penuh dan buka kembali. Versi baru akan aktif.

#### Memaksa Pembaruan

Apabila ada pewawancara yang masih melihat versi lama walaupun telah daring beberapa kali:

1. Buka aplikasi di Chrome pada perangkat tersebut.
2. **Pengaturan situs (gembok di bilah URL) → Reset izin dan hapus data.**
3. Tutup peramban penuh, lalu buka aplikasi kembali dari layar utama.

Pada PWA *desktop*: `Ctrl + Shift + R` setelah membuka tab **Application → Service Workers** dan menekan **Unregister**.

### 3.6 Keamanan dan Pencadangan Data

- Seluruh data tersimpan **lokal di perangkat masing-masing pewawancara** melalui IndexedDB.
- **Tidak ada data yang dikirim ke server.** Aplikasi 100% berbasis klien.
- **Risiko:** perangkat hilang atau rusak = data lapangan hilang.

**Mitigasi yang dianjurkan:**

1. Ekspor ZIP pada setiap akhir hari kerja lapangan.
2. Salin ZIP ke Google Drive, OneDrive, atau berbagi via WhatsApp/email setelah perangkat terhubung internet.
3. Gunakan fitur **"Gabung Data Tim"** secara berkala antar anggota tim sebagai bentuk redundansi.

**Tidak diperlukan:**

- Enkripsi tambahan, karena data hanya tersimpan lokal di perangkat masing-masing pengguna.
- Kepatuhan GDPR/PDP khusus, karena data merupakan riset internal kementerian, tidak diunggah ke server pihak ketiga, dan informan diberi informasi sebelum perekaman.

### 3.7 Monitoring Tim

Apsara-Peta tidak memiliki *dashboard* admin terpusat secara bawaan, sehingga monitoring tim dilakukan secara manual.

1. Minta pewawancara mengirim berkas ZIP berkala (mingguan atau dua mingguan) melalui Google Drive, email, atau WhatsApp.
2. Periksa kelengkapan data dari berkas Excel di dalam ZIP (jumlah berian terisi, jumlah berian ragu-ragu).
3. Hitung jumlah berkas audio yang diterima sebagai indikator kuantitas rekaman.
4. Lakukan rapat koordinasi berkala untuk membahas berian-berian yang ditandai ragu-ragu.

> **Opsi pengembangan masa depan:** integrasi unggah otomatis ke Google Drive di akhir hari menggunakan Google Drive API, atau penambahan *dashboard* admin sederhana berbasis Firebase. Fitur-fitur ini belum tersedia pada versi v9.

### 3.8 Pemasangan Massal (*Bulk Deployment*)

#### Untuk 10–20 Perangkat (Tim Kecil)

1. Buat **QR code** dari URL GitHub Pages aplikasi melalui [qr-code-generator.com](https://www.qr-code-generator.com) atau aplikasi serupa.
2. Cetak QR code dan distribusikan ke setiap pewawancara.
3. Pewawancara memindai QR pada peramban (Chrome atau Safari) untuk membuka aplikasi.
4. Setiap pewawancara melakukan pemasangan PWA (lihat [Bagian 2.1](#21-pemasangan-aplikasi-pwa)).
5. Pewawancara membuka aplikasi sekali saat daring agar *service worker* mengunduh seluruh aset inti.
6. Tambahkan langkah **"Unduh Gambar Offline"** untuk mengunduh 1.191 gambar.

#### Untuk Institusi Besar (Lebih dari 50 Perangkat)

Pertimbangkan menggunakan **Mobile Device Management (MDM)** seperti **Google Workspace MDM**, **Microsoft Intune**, **Hexnode**, atau solusi MDM internal institusi. Dengan MDM, aplikasi dapat dipasang secara *push* ke seluruh perangkat institusi sekaligus.

---

## 4. Panduan Khusus

### 4.1 Daftar Pintasan IPA

Pintasan kibor fisik untuk simbol IPA yang paling sering digunakan dalam transkripsi bahasa daerah di Indonesia. Pintasan ini hanya aktif saat kursor berada pada kotak input berian (`#berianInput`) atau kotak catatan (`#catatanInput`), dan modus kibor aktif **bukan** modus Latin biasa.

| Kombinasi | Simbol IPA | Keterangan Pengucapan |
| :--- | :---: | :--- |
| `Alt + E` | **ə** | Schwa, seperti pada *pəpəs* (pepes). |
| `Alt + A` | **ɛ** | Vokal e terbuka, seperti pada *bɛbɛk* (bebek). |
| `Alt + O` | **ɔ** | Vokal o terbuka, seperti pada *tɔkɔ* (toko). |
| `Alt + N` | **ŋ** | Eng, seperti pada *siaŋ* (siang). |
| `Alt + Y` | **ɲ** | Eny/ny, seperti pada *ɲaɲi* (nyanyi). |
| `Alt + G` | **ʔ** | Hambat glotal/hamzah, seperti pada *raʔyat* (rakyat). |

Untuk simbol IPA lainnya seperti `ʃ` (sh, esh), `ʤ` (j, jed), `ʒ` (zh), `θ` (theta), atau modifikasi diakritik, gunakan **kibor virtual IPA** dengan menahan-tahan tombol Latin dasar untuk membuka menu varian sembulan.

### 4.2 Panduan Visualisasi Praat

Apsara-Peta menyediakan instrumen analisis akustik internal yang disebut **PraatViz**, terinspirasi dari perangkat lunak [Praat](https://www.fon.hum.uva.nl/praat/) (Boersma & Weenink).

#### Apa itu Spektrogram?

Spektrogram adalah representasi visual dari **frekuensi suara** terhadap waktu. Pada PraatViz, spektrogram tampil sebagai gambar dua dimensi berikut.

- **Sumbu horizontal (X):** waktu, dalam detik.
- **Sumbu vertikal (Y):** frekuensi, dalam hertz (Hz), biasanya 0 sampai 5.000 Hz.
- **Intensitas warna:** menunjukkan kekuatan amplitudo pada frekuensi tertentu. Warna **kuning-merah** menunjukkan intensitas tinggi, sedangkan **biru-hitam** menunjukkan intensitas rendah atau kesunyian.

#### Pelacakan Nada Dasar (F0)

Garis hijau yang melintang di atas spektrogram menggambarkan **F0** (*fundamental frequency*), yaitu nada dasar suara informan, biasanya antara 80–200 Hz untuk suara dewasa.

- F0 yang **tinggi** = nada suara tinggi (suara perempuan, anak-anak, atau ucapan dengan intonasi naik).
- F0 yang **rendah** = nada suara rendah (suara laki-laki dewasa atau ucapan dengan intonasi turun).

#### Pelacakan Forman (F1, F2, F3)

Forman adalah pita frekuensi resonansi yang khas untuk setiap vokal. Tiga forman pertama yang dapat dibaca pada PraatViz adalah berikut.

- **F1:** menentukan tinggi vokal (vokal terbuka seperti /a/ memiliki F1 tinggi, sekitar 700–900 Hz; vokal tertutup seperti /i/ memiliki F1 rendah, sekitar 250–350 Hz).
- **F2:** menentukan posisi maju–mundur lidah (vokal depan seperti /i/ memiliki F2 sangat tinggi, sekitar 2.200–2.500 Hz; vokal belakang seperti /u/ memiliki F2 rendah, sekitar 700–900 Hz).
- **F3:** memberi indikasi pembulatan bibir dan retrofleksi.

#### Membedakan Vokal /a/ dan /ɔ/

Sebagai contoh praktis:

| Vokal | F1 (perkiraan) | F2 (perkiraan) | Kesimpulan |
| :--- | :---: | :---: | :--- |
| /a/ | 750 Hz | 1.200 Hz | Vokal terbuka, F2 menengah. |
| /ɔ/ | 550 Hz | 900 Hz | Vokal setengah terbuka, F2 lebih rendah. |

Jika F1 informan tampak lebih rendah dan F2 lebih rendah, kemungkinan besar bunyi yang diucapkan adalah /ɔ/, bukan /a/.

#### Seleksi Segmen

1. Setelah audio terekam, spektrogram tampil otomatis di bawah pemutar audio.
2. **Ketuk dan geser** kursor di atas spektrogram untuk menyeleksi rentang waktu tertentu.
3. Lepaskan kursor. Akan muncul tombol **"▶ Putar Seleksi"** untuk memutar hanya segmen tersebut.
4. Pemutaran segmen dapat diulang berkali-kali untuk menganalisis bunyi tertentu secara teliti.

#### Mode Layar Penuh

Ketuk tombol **⛶** di pojok kanan atas PraatViz untuk memperbesar spektrogram ke layar penuh perangkat. Mode ini sangat membantu untuk analisis forman yang membutuhkan presisi tinggi.

### 4.3 Panduan Kuesioner Sastra Lisan

Modul Kuesioner Sastra Lisan dirancang untuk pendokumentasian sastra lisan secara menyeluruh, dari latar belakang informan hingga konteks pertunjukan dan media audio-visual pendukungnya.

#### Dasar Teori dan Dua Sumbu Klasifikasi

Klasifikasi mengikuti teori sastra lisan/folklor Indonesia: **Suripan Sadi Hutomo** (naratif – non-naratif – drama), **James Danandjaja** (*Folklor Indonesia*), dan **William Bascom** (mite/legenda/dongeng). Objek kajian selalu **sastra lisan itu sendiri**; *pertunjukan* hanyalah konteks penyampaian. Karena itu entri ditentukan oleh dua sumbu yang terpisah:

1. **Konteks Penyampaian** — *Pertunjukan* (hidup di hadapan khalayak) atau *Murni Teks / Tuturan*.
2. **Genre** — enam genre utama, masing-masing dengan sub-genre lengkap se-Indonesia + opsi "Lainnya":

| Genre | Sifat | Contoh sub-genre |
| :--- | :--- | :--- |
| **Cerita Rakyat** | Naratif (alur, tokoh) | Mite, Legenda, Sage, Hikayat, Epos, Babad, Kaba, Dongeng, Fabel |
| **Puisi Rakyat** | Berirama/berbait | Pantun, Syair, Gurindam, Talibun, Tembang Macapat, Pupuh, Mantra |
| **Nyanyian Rakyat** | Dilagukan | Lagu daerah, Tembang dolanan, Dendang, Lagu ritual, Salawat |
| **Ungkapan Tradisional** | Pendek/formula | Peribahasa, Umpasa, Bidalan, Pamali, Sapaan, Ungkapan kiasan |
| **Teka-teki Tradisional** | Tanya-jawab | Cangkriman, Wangsalan, teka-teki binatang/alam/benda |
| **Teater / Drama Rakyat** | Pertunjukan hidup | Wayang, Ketoprak, Ludruk, Lenong, Randai, Sinrilik, Mak Yong |

Untuk pertunjukan multi-unsur (mis. **wayang** = naratif + tembang + dagelan + musik + tari), pilih Konteks *Pertunjukan* + Genre *Teater/Drama Rakyat*, lalu centang **"Unsur yang Terkandung"**.

#### Alur Kerja Pendokumentasian

1. **Buka tab "Kuesioner Sastra Lisan"**, lalu ketuk **"+ Entri Baru"**.
2. **Isi Seksi A — Data Narasumber** (nama, foto, demografi, komunitas, alamat, GPS).
3. **Isi Seksi B — Identifikasi Sastra Lisan:** nama sastra & lokasi, lalu pilih **Konteks Penyampaian** dan **Genre Utama**. Pilih **Sub-genre** (manfaatkan panel panduan dan tombol "ⓘ Lihat semua jenis"). Jika pertunjukan multi-unsur, centang **Unsur yang Terkandung**.
4. **Isi Seksi C — Data Karya** (field menyesuaikan genre).
5. **Isi Seksi D — Kondisi Penyampaian** (lengkap untuk Pertunjukan, ringkas untuk Teks).
6. **Isi Seksi E — Analisis Bahasa** dan **Seksi F — Pewarisan**.
7. **Lengkapi Seksi G — Dokumentasi Media:** rekam/unggah audio & video sampel, dan tambahkan foto.
8. **Isi Seksi Z — Status & Pencatat.** Auto-save berjalan otomatis (jeda 1,5 detik); indikator **"[Tersimpan]"** berkedip hijau.
9. **Ubah status** `Draft` → `Selesai`, lalu ketuk **"< Kembali"**.
10. **Pada akhir sesi**, ketuk **"Ekspor Data Sastra (ZIP)"**.

#### Contoh Pengisian (cerita rakyat, konteks pertunjukan)

```
A. Narasumber   : Mbah Surahman, L, Banyumas 12 Mei 1948 (78 th), Juru cerita aktif
B. Identifikasi : Nama "Babad Lutung Kasarung"; Desa Pernasidi, Kec. Cilongok,
                  Kab. Banyumas, Jawa Tengah, Pulau Jawa
                  Konteks  = Pertunjukan
                  Genre    = Cerita Rakyat
                  Sub-genre= Legenda
                  Unsur    = Naratif, Nyanyian, Dialog
                  Bahasa   = Jawa Banyumasan
C. Data Karya   : Judul "Lutung Kasarung"; Tokoh: Lutung sakti; Latar: zaman kerajaan;
                  Tema: kesetiaan; Durasi tuturan: ± 30 menit
D. Pertunjukan  : Tempat pendopo balai desa; Frekuensi jarang; Waktu malam;
                  Penonton ± 40 (campur); Iringan: gamelan; Bahasa: Jawa Banyumasan
F. Pewarisan    : Dari mbah buyut; Sistem: Terbuka
Z. Pencatat     : Dr. Sri Sumarti — Balai Bahasa Provinsi Jawa Tengah
```

---

## 5. Teknologi yang Digunakan

Apsara-Peta dibangun di atas tumpukan teknologi web standar tanpa kerangka kerja pihak ketiga seperti React, Vue, atau Angular. Pemilihan ini disengaja agar aplikasi tetap **ringan, cepat, dan dapat berjalan di perangkat dengan spesifikasi rendah**.

| Lapis      | Teknologi                        | Fungsi                                        |
| :--------- | :------------------------------- | :-------------------------------------------- |
| Markup     | HTML5                            | Struktur antarmuka.                           |
| Gaya       | CSS3 (inline di index.html)      | Tema oklch(), dark mode, flexbox, grid.       |
| Logika     | JavaScript Vanilla (ES2020+)     | Tanpa pustaka kerangka kerja.                 |
| Penyimpanan| IndexedDB                        | Basis data transkripsi, audio, foto, sastra.  |
| Penyimpanan| localStorage                     | Preferensi, metadata, memori ketikan.         |
| Offline    | Service Worker                   | Cache-first, dua cache terpisah.              |
| PWA        | Web App Manifest                 | Pemasangan ke layar utama perangkat.          |
| Lokasi     | Geolocation API                  | Deteksi koordinat GPS (lintang dan bujur).    |
| Kamera     | WebRTC (getUserMedia)            | Pengambilan foto informan langsung.           |
| Audio      | Web Audio API + MediaRecorder    | Perekaman Opus dan analisis spektrum.         |
| Visualisasi| Canvas API                       | Spektrogram PraatViz, pelacakan F0 & forman. |
| Font       | FontFace API                     | Pendaftaran font kustom dari unggahan.        |
| Ekspor     | JSZip (CDN)                      | Pembuatan berkas ZIP (Excel + media).         |
| Unduh      | FileSaver.js (CDN)               | Pengunduhan berkas ekspor ke perangkat.       |
| Font IPA   | Doulos SIL (SIL OFL)             | Penyaji simbol IPA standar internasional.     |
| Geocoding  | Nominatim (OpenStreetMap)        | Reverse geocoding (koordinat ke alamat) untuk data lokasi sastra lisan. |

---

## 6. Kredit dan Penghargaan

Tim Kerja Pelindungan Bahasa dan Sastra
Balai Bahasa Provinsi Jawa Tengah
Badan Pengembangan dan Pembinaan Bahasa
Kementerian Pendidikan Dasar dan Menengah

Daftar berian kosakata dan kuesioner sastra lisan
disusun oleh Badan Pengembangan dan Pembinaan Bahasa.

Penulisan kode dan pembuatan gambar berian dengan bantuan:
- Claude (Anthropic)
- MiMo (Xiaomi)
- Google Antigravity
- ChatGPT (OpenAI)

Teknologi dan pustaka:
- JSZip (Stuart Knightley) — kompresi ZIP
- FileSaver.js (Eli Grey) — unduh berkas
- Doulos SIL (SIL International) — font fonetis IPA
- Praat (Paul Boersma, Universitas Amsterdam) — inspirasi modul visualisasi akustik PraatViz

---

## 7. Lisensi dan Kontak

### Lisensi

Aplikasi Apsara-Peta merupakan instrumen internal Balai Bahasa Provinsi Jawa Tengah. Lisensi penggunaan dan distribusi tunduk pada ketentuan internal kementerian. Penggunaan di luar lingkup tersebut dapat dilakukan setelah memperoleh izin tertulis dari Balai Bahasa Provinsi Jawa Tengah.

Font **Doulos SIL** yang disertakan dalam aplikasi merupakan font dengan lisensi terbuka **SIL Open Font License (OFL) 1.1**. Pustaka pihak ketiga **JSZip** dan **FileSaver.js** dirilis dengan lisensi **MIT**.

### Kontak Pengembang

- **Balai Bahasa Provinsi Jawa Tengah**
  Jalan Diponegoro 250, Ungaran, Kabupaten Semarang, Jawa Tengah

### Tautan Terkait

- Pusat informasi: [balaibahasajateng.kemendikdasmen.go.id/](https://balaibahasajateng.kemendikdasmen.go.id/)
- Font Doulos SIL: [software.sil.org/doulos](https://software.sil.org/doulos)
- Praat (referensi fonetis): [praat.org](https://www.fon.hum.uva.nl/praat/)
- JSZip: [stuk.github.io/jszip](https://stuk.github.io/jszip/)
- FileSaver.js: [github.com/eligrey/FileSaver.js](https://github.com/eligrey/FileSaver.js)

---

*Apsara-Peta dirancang untuk mendukung Tim Kerja Pelindungan Bahasa dan Sastra di lapangan, khususnya dalam tahap pengambilan data. Semoga instrumen ini membantu kelancaran pemetaan bahasa dan pendokumentasian sastra lisan di seluruh Indonesia.*
