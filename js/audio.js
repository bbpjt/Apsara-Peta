(function() {
  window.ApsaraModules = window.ApsaraModules || [];
  window.ApsaraModules.push({
    name: 'audio',
    init: function() {
      const Internals = window.ApsaraInternals;
      const $ = (id) => document.getElementById(id);
      
      const btnRecord = $('btnRecord');
      if (btnRecord) btnRecord.addEventListener('click', () => Internals.toggleRecord());
      
      const btnRerecord = $('btnRerecord');
      if (btnRerecord) {
        btnRerecord.addEventListener('click', () => { 
          if (confirm('Lanjutkan merekam ulang?')) { 
            Internals.deleteAudio(); 
            setTimeout(() => Internals.toggleRecord(), 500); 
          } 
        });
      }
      
      const btnDeleteAudio = $('btnDeleteAudio');
      if (btnDeleteAudio) btnDeleteAudio.addEventListener('click', () => Internals.deleteAudio());
      
      // Custom Audio Player Logic
      const audioEl = $('audioPlayback');
      const btnPP = $('btnPlayPause');
      const iconPlay = $('iconPlay');
      const iconPause = $('iconPause');
      const progressFill = $('audioProgressFill');
      const progressTrack = $('audioProgressTrack');
      const curTimeEl = $('audioCurTime');
      const durEl = $('audioDuration');

      let animFrameId = null;

      function fmtTime(s) {
        if (!isFinite(s)) return '0:00';
        const m = Math.floor(s / 60), sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
      }

      function updateProgress() {
        if (!audioEl.paused && audioEl.duration) {
          const pct = (audioEl.currentTime / audioEl.duration) * 100;
          if (progressFill) progressFill.style.width = pct + '%';
          animFrameId = requestAnimationFrame(updateProgress);
        }
      }

      function syncUI() {
        if (audioEl.paused) {
          const pct = audioEl.duration ? (audioEl.currentTime / audioEl.duration * 100) : 0;
          if (progressFill) progressFill.style.width = pct + '%';
        }
        if (curTimeEl) curTimeEl.textContent = fmtTime(audioEl.currentTime);
      }
      function setPlayState(playing) {
        if (iconPlay) iconPlay.style.display = playing ? 'none' : '';
        if (iconPause) iconPause.style.display = playing ? '' : 'none';
      }
      
      if (btnPP) {
        btnPP.addEventListener('click', () => {
          if (audioEl.paused) { audioEl.play(); setPlayState(true); }
          else { audioEl.pause(); setPlayState(false); }
        });
      }
      if (audioEl) {
        audioEl.addEventListener('timeupdate', syncUI);
        audioEl.addEventListener('ended', () => {
          setPlayState(false);
          if (animFrameId) cancelAnimationFrame(animFrameId);
          if (progressFill) progressFill.style.width = '100%';
        });
        audioEl.addEventListener('loadedmetadata', () => { if (durEl) durEl.textContent = fmtTime(audioEl.duration); });
        audioEl.addEventListener('pause', () => {
          setPlayState(false);
          if (animFrameId) cancelAnimationFrame(animFrameId);
        });
        audioEl.addEventListener('play', () => {
          setPlayState(true);
          animFrameId = requestAnimationFrame(updateProgress);
        });
      }
      if (progressTrack) {
        progressTrack.addEventListener('click', (e) => {
          if (!audioEl.duration) return;
          const rect = progressTrack.getBoundingClientRect();
          audioEl.currentTime = ((e.clientX - rect.left) / rect.width) * audioEl.duration;
        });
      }
    }
  });
})();
