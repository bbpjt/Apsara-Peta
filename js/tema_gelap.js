(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'temaGelap',
    init: function() {
      const $ = window.$;
  // ==========================================
  // MODUL 11 - DARK MODE
  // ==========================================
    const slot = $('mastheadBadges');
    if (!slot) return;
    const btnDark = document.createElement('button');
    btnDark.title = 'Ganti Tema Terang/Gelap';
    btnDark.style.cssText = 'width: 22px; height: 22px; border-radius: 50%; background: var(--paper-deep); color: var(--ink); border: 1px solid var(--line-strong); font-size: 12px; cursor: pointer; display: flex; align-items:center; justify-content:center; padding:0; line-height:1; margin-left:6px; transition: 0.3s;';
    slot.appendChild(btnDark);

    const style = document.createElement('style');
    style.innerHTML = `
      :root.force-dark {
        --paper: oklch(15% 0.008 48);
        --paper-deep: oklch(12% 0.008 48);
        --paper-tint: oklch(19% 0.01 48);
        --ink: oklch(90% 0.008 48);
        --ink-soft: oklch(80% 0.008 48);
        --ink-muted: oklch(65% 0.006 48);
        --ink-faint: oklch(48% 0.006 48);
        --line: oklch(22% 0.008 48);
        --line-strong: oklch(30% 0.01 48);
        --biru: #047ac0;
        --cokelat: oklch(90% 0.08 75);
        --emas-terang: oklch(68% 0.15 75);
        --emas-cerah: oklch(80% 0.14 75);
        --krem: oklch(22% 0.05 75);
        --gading: oklch(16% 0.04 75);
        --emas: oklch(78% 0.16 75);
        --krem-pudar: oklch(22% 0.05 75);
        --emas-tua: oklch(68% 0.15 75);
        --hijau: oklch(74% 0.12 150);
        --hijau-soft: oklch(22% 0.04 150);
        --merah: oklch(70% 0.14 25);
        --merah-soft: oklch(22% 0.04 25);
        --warna-teks-kategori: #e3dcde;
        --warna-panel-summary-icon: oklch(22% 0.05 75);
        --warna-icon-panel-summary: oklch(78% 0.16 75);
        --warna-meta-tab-btn-active:oklch(78% 0.16 75);
        --warna-kertas: oklch(99.5% 0.004 48);
        --warna-teks: #ffc421;
        --sh-1: 0 1px 2px rgba(0, 0, 0, .4), 0 1px 3px rgba(0, 0, 0, .6);
        --sh-2: 0 4px 6px -2px rgba(0, 0, 0, .5), 0 10px 20px -5px rgba(0, 0, 0, .8);
        --sh-3: 0 10px 25px -5px rgba(0, 0, 0, .7), 0 25px 50px -12px rgba(0, 0, 0, .9);
      }
      :root.force-light {
        --paper: oklch(99.5% 0.004 48);
        --paper-deep: oklch(98% 0.006 48);
        --paper-tint: oklch(95.5% 0.008 48);
        --ink: oklch(16% 0.01 48);
        --ink-soft: oklch(32% 0.012 48);
        --ink-muted: oklch(52% 0.01 48);
        --ink-faint: oklch(74% 0.008 48);
        --line: oklch(92% 0.006 48);
        --line-strong: oklch(84% 0.008 48);
        --biru: #047ac0;
        --cokelat: oklch(40% 0.10 75);
        --emas-terang: oklch(66% 0.14 75);
        --emas-cerah: oklch(72% 0.15 75);
        --krem: oklch(94% 0.03 75);
        --gading: oklch(97% 0.015 75);
        --emas: oklch(78% 0.16 75);
        --krem-pudar: oklch(95% 0.03 75);
        --emas-tua: oklch(68% 0.15 75);
        --hijau: oklch(62% 0.14 150);
        --hijau-soft: oklch(94% 0.02 150);
        --merah: oklch(58% 0.18 25);
        --merah-soft: oklch(94% 0.02 25);
        --warna-teks-kategori: oklch(16% 0.01 48);
        --warna-panel-summary-icon: #bee2f6;
        --warna-icon-panel-summary: #047ac0;
        --warna-meta-tab-btn-active:#047ac0;
        --warna-kertas: oklch(99.5% 0.004 48);
        --warna-teks: #0026b1;
        --sh-1: 0 1px 2px rgba(0, 0, 0, .04), 0 1px 3px rgba(0, 0, 0, .06);
        --sh-2: 0 4px 6px -2px rgba(0, 0, 0, .05), 0 10px 20px -5px rgba(0, 0, 0, .08);
        --sh-3: 0 10px 25px -5px rgba(0, 0, 0, .15), 0 25px 50px -12px rgba(0, 0, 0, .2);
      }
    `;
    document.head.appendChild(style);

    const logoKemdik = document.querySelector('.logo-kemdik');
    const defaultLogoSrc = logoKemdik ? logoKemdik.src : './aset/gambar_berian/0000.webp';
    const darkLogoSrc = './aset/gambar_berian/kemdik_skndr3.webp';

    function setMode(mode) {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      let isDark = false;
      
      if (mode === 'dark') {
        isDark = true;
        document.documentElement.classList.add('force-dark');
        document.documentElement.classList.remove('force-light');
      } else if (mode === 'light') {
        isDark = false;
        document.documentElement.classList.add('force-light');
        document.documentElement.classList.remove('force-dark');
      } else {
        isDark = isSystemDark;
        document.documentElement.classList.remove('force-dark', 'force-light');
      }

      btnDark.innerHTML = isDark 
        ? `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` 
        : `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      if (logoKemdik) logoKemdik.src = isDark ? darkLogoSrc : defaultLogoSrc;
      localStorage.setItem('apsara_theme', mode);
    }

    btnDark.addEventListener('click', () => {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isCurrentlyDark = document.documentElement.classList.contains('force-dark') || 
                              (!document.documentElement.classList.contains('force-light') && isSystemDark);
      setMode(isCurrentlyDark ? 'light' : 'dark');
    });

    const saved = localStorage.getItem('apsara_theme');
    setMode(saved || 'auto');

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!localStorage.getItem('apsara_theme') || localStorage.getItem('apsara_theme') === 'auto') {
        setMode('auto');
      }
    });
    }
  });
})();
