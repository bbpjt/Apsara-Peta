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
