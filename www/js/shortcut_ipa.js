(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'shortcutIPA',
    init: function() {
      const peta = { 'e': 'ə', 'n': 'ŋ', 'y': 'ɲ', 'g': 'ʔ', 'o': 'ɔ', 'a': 'ɛ' };
      document.addEventListener('keydown', (e) => {
        if (!e.altKey) return;
        if (window.BERIAN_KB_MODE === 'normal') return;
        const t = e.target;
        if (!t || (t.id !== 'berianInput' && t.id !== 'catatanInput')) return;
        const k = e.key.toLowerCase();
        if (peta[k]) {
          e.preventDefault();
          const start = t.selectionStart, end = t.selectionEnd;
          t.value = t.value.slice(0, start) + peta[k] + t.value.slice(end);
          t.selectionStart = t.selectionEnd = start + 1;
          t.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }
  });
})();
