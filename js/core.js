/**
 * core.js
 * Berisi state global, event bus, dan utilitas yang dipakai lintas-modul.
 */

window.ApsaraState = {}; // State global (saat ini kosong, disiapkan jika ada state lintas-modul ke depannya)

window.ApsaraBus = {
  _h: {},
  on(e, f) { (this._h[e] ||= []).push(f); },
  emit(e, d) {
    (this._h[e] || []).forEach(f => {
      try {
        f(d);
      } catch(err) {
        console.error('[Bus]', e, err);
      }
    });
  },
  off(e, f) { this._h[e] = (this._h[e] || []).filter(x => x !== f); }
};

window.escHTML = (s) => String(s).replace(/[&<>"']/g,
  c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
);

window.$ = (id) => document.getElementById(id);

// Global error handler: jangan biarkan error tak tertangani hilang diam-diam.
// Surfacekan ke pengguna (toast) bila API inti sudah siap, dan tetap catat di konsol.
(function () {
  let lastToast = 0;
  function lapor(label, err) {
    console.error('[' + label + ']', err);
    const now = Date.now();
    // throttle agar tidak membanjiri pengguna saat error beruntun
    if (window.ApsaraAPI && typeof window.ApsaraAPI.toast === 'function' && now - lastToast > 4000) {
      lastToast = now;
      window.ApsaraAPI.toast('Terjadi kesalahan tak terduga. Data Anda aman; coba ulangi tindakan terakhir.');
    }
  }
  window.addEventListener('error', (e) => lapor('error', e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => lapor('promise', e.reason));
})();
