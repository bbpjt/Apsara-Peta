/* =========================================================
   APSARA — LOADER MODUL (init-runner terpusat)
   Menunggu API inti siap, lalu menjalankan init() semua modul
   yang terdaftar di window.ApsaraModules (Fase-2 + Fase-1).
   ========================================================= */
(() => {
  'use strict';

  if (window.__APSARA_MODUL_TAMBAHAN__) return;
  window.__APSARA_MODUL_TAMBAHAN__ = true;

  const tungguAPI = setInterval(() => {
    if (window.ApsaraAPI && window.BERIAN_DATA) {
      clearInterval(tungguAPI);
      (window.ApsaraModules || []).forEach((mod) => {
        try {
          if (mod && typeof mod.init === 'function') mod.init();
        } catch (e) {
          console.error('[modul]', mod && mod.name, e);
        }
      });
    }
  }, 100);
})();
