(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'halamanTentang',
    init: function() {
      const $ = window.$;
    const slot = $('mastheadBadges'); // Ikut menempel di bilah lencana bersama Tersimpan dan Online
    if (!slot) return;
    const tombol = document.createElement('button');
    tombol.title = 'Tentang aplikasi';
    tombol.id = 'btnTentangAplikasi';
    tombol.style.cssText = 'width: 22px; height: 22px; border-radius: 50%; background: var(--paper-deep); color: var(--ink); border: 1px solid var(--line-strong); font-family: "Fraunces", serif; font-style: italic; font-size: 13px; font-weight:bold; cursor: pointer; display: flex; align-items:center; justify-content:center; padding:0; line-height:1; margin-left:2px;';
    tombol.textContent = 'i';
    slot.appendChild(tombol);

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes kedipMerah {
        0% { box-shadow: 0 0 0px #ef4444; border-color: var(--line-strong); color: var(--ink); }
        50% { box-shadow: 0 0 8px #ef4444; border-color: #ef4444; color: #ef4444; }
        100% { box-shadow: 0 0 0px #ef4444; border-color: var(--line-strong); color: var(--ink); }
      }
      .perlu-unduh-kedip {
        animation: kedipMerah 1.5s infinite !important;
      }
    `;
    document.head.appendChild(style);

    async function checkSudahUnduh() {
      try {
        const cacheKeys = await caches.keys();
        const assetCacheName = cacheKeys.find(k => k.startsWith('apsara-asset-'));
        if (!assetCacheName) return false;
        const cache = await caches.open(assetCacheName);
        if (window.BERIAN_DATA && window.BERIAN_DATA.length > 0) {
          const entry = window.BERIAN_DATA[0];
          const imgPath = `./aset/gambar_berian/${entry.id}_${entry.konsep.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '')}.webp`;
          const response = await cache.match(imgPath);
          return !!response;
        }
      } catch (e) {}
      return false;
    }

    if (!window.Capacitor && window.location.protocol !== 'file:') {
      setTimeout(async () => {
        const sudahUnduh = await checkSudahUnduh();
        if (!sudahUnduh) tombol.classList.add('perlu-unduh-kedip');
      }, 2000);
    }

    tombol.addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay visible'; overlay.style.zIndex = '3500';
      overlay.innerHTML = `<div class="modal" style="position:relative; max-width:500px; padding:24px;">
        <button type="button" style="position:absolute; top:12px; right:12px; background:transparent; border:none; font-size:18px; cursor:pointer; color:#64748b;" onclick="this.parentElement.parentElement.remove()">✕</button>
        <h2 style="font-family:'Fraunces',serif; color:#1e4d8c; font-size:20px; margin-bottom:8px; margin-right:24px;">Apsara <em style="color:#f6921e;">— Peta</em></h2>
        <p style="font-size:12px; color:#64748b; line-height:1.6; margin-bottom:16px;">Aplikasi kuesioner luring berbasis bahasa penanda hiperteks (HTML) yang dikembangkan sebagai instrumen digital dalam pengumpulan data pemetaan bahasa dan sastra.</p>
        <div style="font-size:11px; color:#334155;"><strong>Balai Bahasa Provinsi Jawa Tengah</strong><br>Badan Pengembangan dan Pembinaan Bahasa<br>Kementerian Pendidikan Dasar dan Menengah</div>
        <button id="btnReadGuide" style="margin-top:16px; padding:10px; width:100%; background:var(--biru); border:1px solid var(--biru); border-radius:6px; cursor:pointer; color:#ffffff; font-size:13px; font-weight:500;">📖 Baca Panduan</button>
        <button id="btnCacheImages" style="${window.Capacitor || window.location.protocol === 'file:' ? 'display:none;' : ''}margin-top:8px; padding:10px; width:100%; background:var(--hijau); border:1px solid var(--hijau); border-radius:6px; cursor:pointer; color:#ffffff; font-size:13px; font-weight:500;">Unduh Gambar Offline</button>
      </div>`;
      document.body.appendChild(overlay);

      const btnCacheImages = overlay.querySelector('#btnCacheImages');
      if (btnCacheImages) {
        btnCacheImages.addEventListener('click', async () => {
          if (!window.BERIAN_DATA) return;
          
          const sudahUnduh = await checkSudahUnduh();
          if (sudahUnduh) {
            alert("Gambar Terunduh");
            return;
          }

          if (!confirm(`Akan mengunduh ${window.BERIAN_DATA.length} gambar ke penyimpanan offline. Proses ini memakan waktu dan kuota internet. Lanjutkan?`)) return;
          btnCacheImages.disabled = true;
          btnCacheImages.textContent = 'Mengunduh... 0%';
          try {
            const cacheKeys = await caches.keys();
            let assetCacheName = cacheKeys.find(k => k.startsWith('apsara-asset-'));
            if (!assetCacheName) {
              const appCacheName = cacheKeys.find(k => k.startsWith('apsara-app-'));
              if (appCacheName) {
                const version = appCacheName.replace('apsara-app-', '');
                assetCacheName = 'apsara-asset-' + version;
              } else {
                assetCacheName = 'apsara-asset-v5-2026-05-29-patch14';
              }
            }
            const cache = await caches.open(assetCacheName);
            let success = 0, fail = 0;
            const total = window.BERIAN_DATA.length;
            const batchSize = 10;
            for (let i = 0; i < total; i += batchSize) {
              const batch = window.BERIAN_DATA.slice(i, i + batchSize);
              await Promise.all(batch.map(async (entry) => {
                const imgPath = `./aset/gambar_berian/${entry.id}_${entry.konsep.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/_$/, '')}.webp`;
                try {
                  const response = await fetch(imgPath, { cache: 'no-cache' });
                  if (response.ok) { await cache.put(imgPath, response); success++; } else fail++;
                } catch (e) { fail++; }
              }));
              btnCacheImages.textContent = `Mengunduh... ${Math.round(((i + batch.length) / total) * 100)}%`;
            }
            alert("Gambar Terunduh");
            if (success > 0) tombol.classList.remove('perlu-unduh-kedip');
          } catch (e) {
            alert("Gagal mengunduh gambar: " + e.message);
          } finally {
            btnCacheImages.disabled = false;
            btnCacheImages.textContent = 'Unduh Gambar Offline';
          }
        });
      }

      const btnGuide = overlay.querySelector('#btnReadGuide');
      btnGuide.addEventListener('click', () => {
        let guideStyle = document.getElementById('apsara-guide-style');
        if (!guideStyle) {
          guideStyle = document.createElement('style');
          guideStyle.id = 'apsara-guide-style';
          guideStyle.innerHTML = `
            .modal-fullscreen.guide-mode {
              padding: 0 !important;
              overflow: hidden !important;
              display: flex;
              flex-direction: column;
              background: #0d1117 !important;
              z-index: 4500 !important;
            }
            .guide-container {
              display: flex;
              flex-direction: column;
              height: 100%;
              width: 100%;
              max-width: 1000px;
              margin: 0 auto;
              position: relative;
              color: #f0f6fc;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .guide-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 14px 20px;
              background: #161b22;
              border-bottom: 1px solid #30363d;
              z-index: 10;
            }
            .guide-title {
              font-size: 16px;
              font-weight: 700;
              color: #58a6ff;
              margin: 0;
            }
            .guide-page-indicator {
              font-size: 13px;
              font-weight: 600;
              background: #21262d;
              padding: 4px 12px;
              border-radius: 100px;
              border: 1px solid #30363d;
              color: #c9d1d9;
            }
            .guide-viewer {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              overflow: hidden;
              background: #0d1117;
              min-height: 0;
              touch-action: pan-y;
            }
            .guide-slide {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transform: translateX(50px);
              transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
              pointer-events: none;
              padding: 16px;
              box-sizing: border-box;
            }
            .guide-slide.active {
              opacity: 1;
              transform: translateX(0);
              pointer-events: auto;
            }
            .guide-slide.prev-slide {
              transform: translateX(-50px);
            }
            .guide-image-wrapper {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .guide-image {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
              border-radius: 8px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.5);
              user-select: none;
              -webkit-user-drag: none;
              background: #1f242c;
              border: 1px solid #30363d;
            }
            .guide-nav-btn {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: rgba(33, 38, 45, 0.7);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              border: 1px solid #30363d;
              color: #f0f6fc;
              font-size: 18px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
              z-index: 20;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            .guide-nav-btn:hover {
              background: #30363d;
              color: #58a6ff;
              transform: translateY(-50%) scale(1.05);
            }
            .guide-nav-btn.prev {
              left: 20px;
            }
            .guide-nav-btn.next {
              right: 20px;
            }
            .guide-nav-btn:disabled {
              opacity: 0.2;
              cursor: not-allowed;
              pointer-events: none;
            }
            .guide-footer {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 12px;
              padding: 16px 20px;
              background: #161b22;
              border-top: 1px solid #30363d;
              z-index: 10;
            }
            .guide-dots {
              display: flex;
              gap: 8px;
            }
            .guide-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #30363d;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .guide-dot.active {
              background: #58a6ff;
              transform: scale(1.2);
              box-shadow: 0 0 8px #58a6ff;
            }
            .guide-controls {
              display: flex;
              gap: 12px;
              width: 100%;
              justify-content: center;
            }
            .guide-ctrl-btn {
              padding: 8px 18px;
              border-radius: 6px;
              border: 1px solid #30363d;
              background: #21262d;
              color: #c9d1d9;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 6px;
              transition: all 0.2s ease;
            }
            .guide-ctrl-btn:hover {
              background: #30363d;
              border-color: #8b949e;
              color: #f0f6fc;
            }
            .modal-fullscreen-close.guide-close-btn {
              position: relative !important;
              top: auto !important;
              right: auto !important;
              margin: 0 !important;
              width: 34px !important;
              height: 34px !important;
              font-size: 16px !important;
              background: #21262d !important;
              border: 1px solid #30363d !important;
              color: #c9d1d9 !important;
              box-shadow: none !important;
            }
            .modal-fullscreen-close.guide-close-btn:hover {
              background: #f85149 !important;
              border-color: #f85149 !important;
              color: #ffffff !important;
            }

            @media (max-width: 768px) {
              .guide-nav-btn {
                display: none;
              }
              .guide-title {
                font-size: 14px;
              }
              .guide-header {
                padding: 10px 16px;
              }
              .guide-footer {
                padding: 12px 16px;
              }
              .guide-slide {
                padding: 8px;
              }
            }
          `;
          document.head.appendChild(guideStyle);
        }

        const modalGuide = document.createElement('div');
        modalGuide.className = 'modal-fullscreen guide-mode';

        const images = [
          './aset/gambar_panduan/panduan_01.png',
          './aset/gambar_panduan/panduan_02.png',
          './aset/gambar_panduan/panduan_03.png',
          './aset/gambar_panduan/panduan_04.png',
          './aset/gambar_panduan/panduan_05.png',
          './aset/gambar_panduan/panduan_06.png',
          './aset/gambar_panduan/panduan_07.png',
          './aset/gambar_panduan/panduan_08.png'
        ];

        let currentIndex = 0;

        const slidesHTML = images.map((src, i) => `
          <div class="guide-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
            <div class="guide-image-wrapper">
              <img src="${src}" class="guide-image" alt="Halaman Panduan ${i + 1}">
            </div>
          </div>
        `).join('');

        const dotsHTML = images.map((_, i) => `
          <div class="guide-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
        `).join('');

        modalGuide.innerHTML = `
          <div class="guide-container">
            <header class="guide-header">
              <h2 class="guide-title">Petunjuk Penggunaan</h2>
              <div class="guide-page-indicator">Halaman <span id="guideCurPage">1</span> / 8</div>
              <button class="modal-fullscreen-close guide-close-btn" type="button" id="btnExitGuide">✕</button>
            </header>
            <div class="guide-viewer" id="guideViewer">
              <button class="guide-nav-btn prev" id="guideNavPrev" disabled>◀◀</button>
              ${slidesHTML}
              <button class="guide-nav-btn next" id="guideNavNext">▶▶</button>
            </div>
            <footer class="guide-footer">
              <div class="guide-dots">${dotsHTML}</div>
              <div class="guide-controls">
                <button class="guide-ctrl-btn" id="guideCtrlPrev" disabled>◀◀</button>
                <button class="guide-ctrl-btn" id="guideCtrlNext">▶▶</button>
              </div>
            </footer>
          </div>
        `;
        document.body.appendChild(modalGuide);

        const viewer = modalGuide.querySelector('#guideViewer');
        const curIndicator = modalGuide.querySelector('#guideCurPage');
        const btnPrev = modalGuide.querySelector('#guideNavPrev');
        const btnNext = modalGuide.querySelector('#guideNavNext');
        const btnCtrlPrev = modalGuide.querySelector('#guideCtrlPrev');
        const btnCtrlNext = modalGuide.querySelector('#guideCtrlNext');
        const dots = modalGuide.querySelectorAll('.guide-dot');
        const slides = modalGuide.querySelectorAll('.guide-slide');
        const btnExit = modalGuide.querySelector('#btnExitGuide');

        function goToPage(index) {
          if (index < 0 || index >= images.length) return;

          slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev-slide');
            if (i === index) {
              slide.classList.add('active');
            } else if (i < index) {
              slide.classList.add('prev-slide');
            }
          });

          dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
          });

          currentIndex = index;
          curIndicator.textContent = String(index + 1);

          btnPrev.disabled = index === 0;
          btnCtrlPrev.disabled = index === 0;
          btnNext.disabled = index === images.length - 1;
          btnCtrlNext.disabled = index === images.length - 1;
        }

        function nextPage() {
          if (currentIndex < images.length - 1) goToPage(currentIndex + 1);
        }

        function prevPage() {
          if (currentIndex > 0) goToPage(currentIndex - 1);
        }

        btnPrev.onclick = prevPage;
        btnCtrlPrev.onclick = prevPage;
        btnNext.onclick = nextPage;
        btnCtrlNext.onclick = nextPage;

        dots.forEach((dot, i) => {
          dot.onclick = () => goToPage(i);
        });

        let touchStartX = 0;
        let touchEndX = 0;

        viewer.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        viewer.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          const diff = touchEndX - touchStartX;
          if (Math.abs(diff) > 50) {
            if (diff < 0) nextPage();
            else prevPage();
          }
        }, { passive: true });

        const handleKeyDown = (e) => {
          if (e.key === 'ArrowRight') nextPage();
          else if (e.key === 'ArrowLeft') prevPage();
          else if (e.key === 'Escape') closeGuide();
        };

        function closeGuide() {
          modalGuide.remove();
          document.removeEventListener('keydown', handleKeyDown);
        }

        btnExit.onclick = closeGuide;
        document.addEventListener('keydown', handleKeyDown);
      });
    });
    }
  });
})();
