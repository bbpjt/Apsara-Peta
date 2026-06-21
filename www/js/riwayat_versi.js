(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'riwayatVersi',
    init: function() {
      const $ = window.$;
  // ==========================================
  // MODUL 09 - RIWAYAT VERSI (MEMORI KETIKAN)
  // ==========================================
    const tombol = $('btnRiwayatVersi');
    const input = $('berianInput');
    if (!tombol || !input) return;

    input.addEventListener('blur', () => {
      const id = window.ApsaraAPI.getCurrentId();
      if (!id) return;
      const teks = input.value.trim();
      if (!teks) return;

      let memori = {};
      try { memori = JSON.parse(localStorage.getItem('apsara_riwayat_v1') || '{}'); } catch (e) { }
      if (!memori[id]) memori[id] = [];

      if (memori[id][0] !== teks) {
        memori[id].unshift(teks);
        if (memori[id].length > 5) memori[id].pop();
        localStorage.setItem('apsara_riwayat_v1', JSON.stringify(memori));
      }
    });

    tombol.addEventListener('click', () => {
      const id = window.ApsaraAPI.getCurrentId();
      if (!id) return;

      let memori = {};
      try { memori = JSON.parse(localStorage.getItem('apsara_riwayat_v1') || '{}'); } catch (e) { }
      const list = memori[id] || [];

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay visible'; overlay.style.zIndex = '3500';

      
      const kontenList = list.length === 0
        ? '<div style="padding: 10px; color:#94a3b8; font-style:italic; font-size:11px;">Belum ada riwayat terekam untuk kata ini.</div>'
        : list.map((teks, i) => `
            <div class="riwayat-item" data-teks="${window.escHTML(teks)}" style="padding:12px; background:#f0f6fc; border:1px solid #cbd5e1; border-radius:6px; margin-bottom:8px; cursor:pointer;" onmouseover="this.style.background='#e3edf9'" onmouseout="this.style.background='#f0f6fc'">
               <div style="font-size:9px; color:#64748b; font-weight:700; text-transform:uppercase; margin-bottom:4px;">Versi -${i + 1}</div>
               <div style="font-family:var(--fonetis); font-size:16px;">${window.escHTML(teks)}</div>
            </div>
          `).join('');

      overlay.innerHTML = `
        <div class="modal" style="max-width:400px; padding:20px;">
          <h2 style="font-size:14px; color:#143562; margin-bottom:6px; font-weight:700;">Riwayat Teks Berian</h2>
          <p style="font-size:10px; color:#64748b; margin-bottom:14px;">Klik salah satu riwayat di bawah ini untuk memulihkan dan menimpanya ke kotak berian.</p>
          <div style="max-height:40vh; overflow-y:auto; padding-right:6px;">${kontenList}</div>
          <button style="margin-top:16px; padding:10px; width:100%; background:#f5f8fc; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer;" onclick="this.parentElement.parentElement.remove()">Tutup Batal</button>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelectorAll('.riwayat-item').forEach(el => {
        el.addEventListener('click', () => {
          const teksLama = el.getAttribute('data-teks');
          input.value = teksLama;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          window.ApsaraAPI.toast('Dipulihkan!');
          overlay.remove();
        });
      });
    });
    }
  });
})();
