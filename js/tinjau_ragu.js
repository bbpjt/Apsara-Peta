(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'modalTinjauRagu',
    init: function() {
      const $ = window.$;
  // ==========================================
  // MODUL 07 - MODAL TINJAU RAGU
  // ==========================================
    const tombol = $('btnReviewRagu');
    if (!tombol) return;
    tombol.addEventListener('click', () => {
      const api = window.ApsaraAPI;
      const ud = api.userData || {}, data = window.BERIAN_DATA || [];
      const ragu = data.filter(d => ud[d.id] && ud[d.id].ragu);

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay visible'; overlay.style.zIndex = '3500';

      
      const isi = ragu.length === 0
        ? '<div style="text-align:center;padding:30px;font-style:italic;color:#64748b;">Hebat! Tidak ada data yang ditandai ragu-ragu. 👍</div>'
        : ragu.map(d => {
          const u = ud[d.id];
          return `<div style="border:1px solid #cbd5e1; padding:12px; margin-bottom:10px; border-radius:8px; cursor:pointer; background:#fef0dc; transition:0.2s;" class="ragu-item" data-id="${d.id}" onmouseover="this.style.background='#fde0bc'" onmouseout="this.style.background='#fef0dc'"><strong style="color:#d97d15; font-size:12px;">ID ${d.id}: ${window.escHTML(d.konsep)}</strong><div style="font-family:var(--fonetis); font-size:15px; margin-top:6px; font-weight:600;">Berian: ${window.escHTML(u.berian || '-kosong-')}</div><div style="font-size:11px; color:#334155; margin-top:6px;">Catatan: ${window.escHTML(u.catatan || '-')}</div></div>`;
        }).join('');

      overlay.innerHTML = `<div class="modal" style="max-width: 500px;"><div class="modal-header"><h2 style="font-size:16px; color:#d97d15;">⚐ Daftar Perlu Verifikasi</h2><button class="modal-close" id="btnCloseReview" style="background:transparent; border:none; font-size:16px; cursor:pointer;">✕</button></div><div class="modal-body" style="max-height: 60vh; overflow-y: auto; background:#fff;"><p style="font-size:11px; color:#64748b; margin-top:-6px;">Ketuk salah satu kartu di bawah ini untuk melompat langsung ke halaman konsepnya dan memperbaiki teksnya.</p>${isi}</div></div>`;
      document.body.appendChild(overlay);

      $('btnCloseReview').onclick = () => overlay.remove();
      overlay.querySelectorAll('.ragu-item').forEach(el => {
        el.onclick = () => { const id = el.getAttribute('data-id'); overlay.remove(); api.goToId(id); };
      });
    });
    }
  });
})();
