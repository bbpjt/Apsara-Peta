(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'kibor',
    init: function() {
      const Internals = window.ApsaraInternals;
      const $ = (id) => document.getElementById(id);

      // Tombol Buka/Tutup Kibor
      if ($('btnToggleKb')) {
        $('btnToggleKb').addEventListener('click', () => Internals.toggleKeyboard());
      }
      if ($('vkbClose')) {
        $('vkbClose').addEventListener('click', () => Internals.toggleKeyboard(false));
      }

      // Drag & Drop Jendela Kibor
      const vkb = $('vkb');
      if (vkb) {
        const vkbHeader = vkb.querySelector('.vkb-header');
        let isDragging = false, dragStartX = 0, dragStartY = 0, vkbStartX = 0, vkbStartY = 0;
        
        if (vkbHeader) {
          vkbHeader.addEventListener('mousedown', e => {
            isDragging = true; 
            dragStartX = e.clientX; 
            dragStartY = e.clientY;
            const rect = vkb.getBoundingClientRect(); 
            vkbStartX = rect.left; 
            vkbStartY = rect.top;
            vkb.style.width = rect.width + 'px'; 
            vkb.style.bottom = 'auto'; 
            vkb.style.right = 'auto';
            vkb.style.left = vkbStartX + 'px'; 
            vkb.style.top = vkbStartY + 'px';
          });
          document.addEventListener('mousemove', e => { 
            if (!isDragging) return; 
            e.preventDefault(); 
            vkb.style.left = (vkbStartX + e.clientX - dragStartX) + 'px'; 
            vkb.style.top = (vkbStartY + e.clientY - dragStartY) + 'px'; 
          });
          document.addEventListener('mouseup', () => { isDragging = false; });
        }
      }
    }
  });
})();
