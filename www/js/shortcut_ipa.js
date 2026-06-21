(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'shortcutIPA',
    init: function() {
      // =====================================================================
      // SHORTCUT IPA UNTUK KEYBOARD FISIK (LAPTOP)
      // Tahan Alt + huruf -> sisipkan simbol fonetis.
      // Tekan Alt+huruf yang SAMA berulang kali -> berputar (cycle) ke varian
      // berikutnya dari huruf itu (mirip menu tahan-tekan di kibor virtual).
      // Alt+Shift+huruf -> berputar mundur.
      // Posisi pertama tiap huruf dipertahankan dari versi lama (mis. e -> ə).
      // =====================================================================
      const CYCLE = {
        // Vokal
        'a': ['ɛ', 'æ', 'ɑ', 'ʌ', 'ɐ', 'ɒ'],
        'e': ['ə', 'ɛ', 'ɘ', 'œ', 'ɤ', 'ɜ'],
        'i': ['ɪ', 'ɨ', 'ɯ'],
        'o': ['ɔ', 'ø', 'ɵ', 'ɞ', 'ɒ'],
        'u': ['ʊ', 'ɯ', 'ʉ', 'ɥ'],
        // Nasal & approksiman
        'n': ['ŋ', 'ɲ', 'ɳ', 'ɴ', 'n̩'],
        'm': ['ɱ', 'm̩'],
        'y': ['ɲ', 'ʎ', 'ɥ', 'ʏ', 'j'],
        'w': ['ʍ', 'ɰ', 'ʋ'],
        'r': ['ɾ', 'ɽ', 'ʀ', 'ʁ', 'r̥', 'ɹ'],
        'l': ['ɭ', 'ʎ', 'ɫ', 'ɬ', 'ɮ', 'l̩'],
        // Plosif & glotal
        'g': ['ʔ', 'ɣ', 'ɡ', 'ɢ', 'ʕ'],
        'q': ['ʔ', 'q', 'ɢ', 'ʛ'],
        'k': ['kʼ', 'q', 'ƙ'],
        'b': ['β', 'ɓ', 'ʙ'],
        'p': ['ɸ', 'pʼ'],
        // Frikatif & afrikat
        't': ['ʈ', 'θ', 't͡ʃ', 't͡s', 'ts'],
        'd': ['ɖ', 'ð', 'd͡ʒ', 'd͡z', 'ɗ'],
        'c': ['t͡ʃ', 'ç', 'ɕ', 'c'],
        'j': ['d͡ʒ', 'ʝ', 'ɟ', 'ʄ'],
        's': ['ʃ', 'ʂ', 'ɕ', 'ɬ'],
        'z': ['ʒ', 'ʐ', 'ʑ', 'ɮ'],
        'f': ['ɸ', 'f'],
        'v': ['ʋ', 'ⱱ', 'v'],
        'h': ['ɦ', 'ħ', 'ʜ', 'ɥ', 'ʢ'],
        'x': ['χ', 'x', 'ɣ'],
        // Tanda panjang, tekanan, nada (di tombol titik-koma)
        ';': ['ː', 'ˑ', 'ˈ', 'ˌ', '̃'],
        // Diakritik superskrip (di tombol garis-miring)
        '/': ['ʰ', 'ʷ', 'ʲ', 'ˠ', 'ˤ', 'ⁿ']
      };

      // State untuk mendeteksi penekanan berulang (cycle).
      let st = { el: null, key: null, idx: -1, glyph: '', pos: -1 };

      document.addEventListener('keydown', (e) => {
        if (!e.altKey || e.key === 'Alt') return;
        if (window.BERIAN_KB_MODE === 'normal') return;
        const t = e.target;
        if (!t || (t.id !== 'berianInput' && t.id !== 'catatanInput')) return;
        const k = e.key.toLowerCase();
        const list = CYCLE[k];
        if (!list) return;

        e.preventDefault();
        const start = t.selectionStart, end = t.selectionEnd;

        // Lanjutan cycle bila: input sama, huruf sama, kursor mengatup tepat
        // setelah glyph yang barusan kita sisipkan.
        const isCont = st.el === t && st.key === k && start === end &&
                       st.pos === start &&
                       t.value.slice(start - st.glyph.length, start) === st.glyph;

        let idx, insertPos, removeEnd;
        if (isCont) {
          idx = (st.idx + (e.shiftKey ? -1 : 1) + list.length) % list.length;
          insertPos = start - st.glyph.length;   // ganti glyph sebelumnya
          removeEnd = start;
        } else {
          idx = e.shiftKey ? list.length - 1 : 0; // mulai siklus baru
          insertPos = start;
          removeEnd = end;                        // ganti seleksi bila ada
        }

        const glyph = list[idx];
        t.value = t.value.slice(0, insertPos) + glyph + t.value.slice(removeEnd);
        const newPos = insertPos + glyph.length;
        t.selectionStart = t.selectionEnd = newPos;

        st = { el: t, key: k, idx: idx, glyph: glyph, pos: newPos };
        t.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
  });
})();
