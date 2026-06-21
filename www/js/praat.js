      // =====================================================================
      // ANALISIS AKUSTIK ALA PRAAT  (spektrogram + pitch F0 + formant F1..F3)
      // DSP murni JavaScript, tanpa dependensi eksternal, jalan offline.
      // =====================================================================
      (function () {
        'use strict';

        var FS = 11025;       // sample rate analisis (Nyquist 5512 Hz)
        var MAXF = 5000;      // batas frekuensi tampilan spektrogram
        var PITCH_MAX = 500;  // skala kanan untuk pitch
        var DYN = 55;         // rentang dinamis spektrogram (dB)
        var MAX_DUR = 12;     // batas durasi yang dianalisis (detik)

        // ---------- FFT ----------
        function fft(re, im) {
          var n = re.length, i, j, bit, len, half, k, a, b, tr, ti, nwr;
          for (i = 1, j = 0; i < n; i++) {
            for (bit = n >> 1; j & bit; bit >>= 1) j ^= bit;
            j ^= bit;
            if (i < j) { var t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
          }
          for (len = 2; len <= n; len <<= 1) {
            var ang = -2 * Math.PI / len, wpr = Math.cos(ang), wpi = Math.sin(ang);
            half = len >> 1;
            for (i = 0; i < n; i += len) {
              var wr = 1, wi = 0;
              for (k = 0; k < half; k++) {
                a = i + k; b = a + half;
                tr = wr * re[b] - wi * im[b]; ti = wr * im[b] + wi * re[b];
                re[b] = re[a] - tr; im[b] = im[a] - ti;
                re[a] += tr; im[a] += ti;
                nwr = wr * wpr - wi * wpi; wi = wr * wpi + wi * wpr; wr = nwr;
              }
            }
          }
        }
        function ifft(re, im) {
          var n = re.length, i;
          for (i = 0; i < n; i++) im[i] = -im[i];
          fft(re, im);
          for (i = 0; i < n; i++) { re[i] /= n; im[i] = -im[i] / n; }
        }
        function nextPow2(x) { var p = 1; while (p < x) p <<= 1; return p; }

        // ---------- resample (dengan anti-alias ringan) ----------
        function resample(input, fsIn, fsOut) {
          if (Math.abs(fsIn - fsOut) < 1) return Float32Array.from(input);
          var src = input, i;
          if (fsIn > fsOut) {
            var kk = Math.max(1, Math.round(fsIn / fsOut)), sm = new Float32Array(input.length), acc = 0;
            for (i = 0; i < input.length; i++) { acc += input[i]; if (i >= kk) acc -= input[i - kk]; sm[i] = acc / Math.min(i + 1, kk); }
            src = sm;
          }
          var ratio = fsIn / fsOut, n = Math.floor(input.length / ratio), out = new Float32Array(n);
          for (i = 0; i < n; i++) {
            var pos = i * ratio, i0 = Math.floor(pos), frac = pos - i0;
            out[i] = (i0 + 1 < src.length) ? src[i0] * (1 - frac) + src[i0 + 1] * frac : src[i0];
          }
          return out;
        }

        // ---------- spektrogram (broadband, jendela Gaussian) ----------
        function computeSpectrogram(signal, fs, maxFreq) {
          var winLen = Math.max(32, Math.round(0.005 * fs));
          var nfft = Math.max(512, nextPow2(winLen));
          var hop = Math.max(1, Math.round(0.0025 * fs));
          var win = new Float32Array(winLen), c = (winLen - 1) / 2, i, b;
          for (i = 0; i < winLen; i++) { var x = (i - c) / (c || 1); win[i] = Math.exp(-0.5 * (x / 0.45) * (x / 0.45)); }
          var df = fs / nfft, binMax = Math.min(nfft >> 1, Math.floor(maxFreq / df));
          var frames = [], re = new Float32Array(nfft), im = new Float32Array(nfft);
          for (var start = 0; start + winLen <= signal.length; start += hop) {
            re.fill(0); im.fill(0);
            for (i = 0; i < winLen; i++) re[i] = signal[start + i] * win[i];
            fft(re, im);
            var mag = new Float32Array(binMax + 1);
            for (b = 0; b <= binMax; b++) {
              var p = re[b] * re[b] + im[b] * im[b], dB = 10 * Math.log10(p + 1e-12), f = b * df;
              if (f > 100) dB += 6 * Math.log2(f / 100);
              mag[b] = dB;
            }
            frames.push(mag);
          }
          return { frames: frames, hop: hop, df: df, binCount: binMax + 1, fs: fs, maxFreq: maxFreq };
        }

        // ---------- pitch (autokorelasi ternormalisasi) ----------
        function autocorr(x) {
          var n = x.length, m = nextPow2(2 * n), re = new Float32Array(m), im = new Float32Array(m), i;
          for (i = 0; i < n; i++) re[i] = x[i];
          fft(re, im);
          for (i = 0; i < m; i++) { re[i] = re[i] * re[i] + im[i] * im[i]; im[i] = 0; }
          ifft(re, im);
          return re;
        }
        function computePitch(signal, fs, floor, ceil) {
          var winLen = Math.round(3 * fs / floor), hop = Math.round(0.01 * fs);
          var minLag = Math.floor(fs / ceil), maxLag = Math.ceil(fs / floor), i, lag;
          var w = new Float32Array(winLen);
          for (i = 0; i < winLen; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (winLen - 1));
          var rw = autocorr(w), m = nextPow2(2 * winLen), re = new Float32Array(m), im = new Float32Array(m);
          var out = [], VOICING = 0.45;
          for (var start = 0; start + winLen <= signal.length; start += hop) {
            var mean = 0;
            for (i = 0; i < winLen; i++) mean += signal[start + i];
            mean /= winLen;
            re.fill(0); im.fill(0);
            var energy = 0;
            for (i = 0; i < winLen; i++) { var v = (signal[start + i] - mean) * w[i]; re[i] = v; energy += v * v; }
            var t = (start + winLen / 2) / fs;
            if (energy < 1e-7) { out.push({ t: t, f0: null }); continue; }
            fft(re, im);
            for (i = 0; i < m; i++) { re[i] = re[i] * re[i] + im[i] * im[i]; im[i] = 0; }
            ifft(re, im);
            var r0 = re[0] || 1e-9, bestLag = -1, bestVal = 0;
            for (lag = minLag; lag <= maxLag && lag < winLen; lag++) {
              var wn = rw[lag] / rw[0];
              if (wn < 1e-3) continue;
              var vv = (re[lag] / r0) / wn;
              if (vv > bestVal) { bestVal = vv; bestLag = lag; }
            }
            if (bestLag > 0 && bestVal > VOICING) {
              var y0 = re[bestLag - 1], y1 = re[bestLag], y2 = re[bestLag + 1], dn = (y0 - 2 * y1 + y2);
              var shift = dn !== 0 ? 0.5 * (y0 - y2) / dn : 0, f0 = fs / (bestLag + shift);
              out.push({ t: t, f0: (f0 >= floor && f0 <= ceil) ? f0 : null });
            } else out.push({ t: t, f0: null });
          }
          return out;
        }

        // ---------- formant (Burg LPC + akar polinom) ----------
        function preEmphasis(x, fs) {
          var a = Math.exp(-2 * Math.PI * 50 / fs), y = new Float64Array(x.length), i;
          y[0] = x[0];
          for (i = 1; i < x.length; i++) y[i] = x[i] - a * x[i - 1];
          return y;
        }
        function burg(x, order) {
          var N = x.length, f = Float64Array.from(x), b = Float64Array.from(x), a = new Float64Array(order + 1);
          a[0] = 1;
          var Dk = 0, n, k;
          for (n = 0; n < N; n++) Dk += 2 * x[n] * x[n];
          Dk -= x[0] * x[0] + x[N - 1] * x[N - 1];
          for (k = 0; k < order; k++) {
            var num = 0;
            for (n = 0; n < N - 1 - k; n++) num += f[n + k + 1] * b[n];
            var mu = Dk > 1e-12 ? -2 * num / Dk : 0;
            var aOld = a.slice(0, k + 2);
            for (n = 1; n <= k + 1; n++) a[n] = aOld[n] + mu * (aOld[k + 1 - n] || 0);
            for (n = 0; n < N - 1 - k; n++) { var fn = f[n + k + 1], bn = b[n]; f[n + k + 1] = fn + mu * bn; b[n] = bn + mu * fn; }
            Dk = (1 - mu * mu) * Dk - f[k + 1] * f[k + 1] - b[N - 2 - k] * b[N - 2 - k];
          }
          return a;
        }
        function polyRoots(c) {
          var deg = c.length - 1;
          if (deg < 1) return [];
          var re = new Array(deg), im = new Array(deg), i, j, iter;
          for (i = 0; i < deg; i++) { var ang = (2 * Math.PI * i / deg) + 0.7; re[i] = 0.6 * Math.cos(ang); im[i] = 0.6 * Math.sin(ang); }
          for (iter = 0; iter < 120; iter++) {
            var maxd = 0;
            for (i = 0; i < deg; i++) {
              var pr = c[0], pi = 0, k;
              for (k = 1; k <= deg; k++) { var nr = pr * re[i] - pi * im[i] + c[k], ni = pr * im[i] + pi * re[i]; pr = nr; pi = ni; }
              var dr = 1, di = 0;
              for (j = 0; j < deg; j++) {
                if (j === i) continue;
                var sr = re[i] - re[j], si = im[i] - im[j], nr2 = dr * sr - di * si, ni2 = dr * si + di * sr; dr = nr2; di = ni2;
              }
              var dd = dr * dr + di * di || 1e-30, qr = (pr * dr + pi * di) / dd, qi = (pi * dr - pr * di) / dd;
              re[i] -= qr; im[i] -= qi;
              var mg = Math.sqrt(qr * qr + qi * qi);
              if (mg > maxd) maxd = mg;
            }
            if (maxd < 1e-10) break;
          }
          var roots = [];
          for (i = 0; i < deg; i++) roots.push({ re: re[i], im: im[i] });
          return roots;
        }
        function formantsFromLPC(a, fs, ceiling) {
          var roots = polyRoots(Array.prototype.slice.call(a)), out = [], i;
          for (i = 0; i < roots.length; i++) {
            var r = roots[i];
            if (r.im <= 0) continue;
            var mag = Math.sqrt(r.re * r.re + r.im * r.im);
            if (mag >= 1.0 || mag < 1e-6) continue;
            var freq = Math.atan2(r.im, r.re) * fs / (2 * Math.PI), bw = -Math.log(mag) * fs / Math.PI;
            if (freq > 90 && freq < ceiling && bw < 600) out.push({ freq: freq, bw: bw });
          }
          out.sort(function (x, y) { return x.freq - y.freq; });
          return out;
        }
        function computeFormants(signal, fs) {
          var ceiling = Math.min(5500, fs / 2 - 50), pre = preEmphasis(signal, fs);
          var winLen = Math.round(0.025 * fs), hop = Math.round(0.01 * fs);
          var order = Math.min(20, Math.round(fs / 1000) + 2), i;
          var w = new Float64Array(winLen);
          for (i = 0; i < winLen; i++) w[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (winLen - 1));
          var out = [], x = new Float64Array(winLen);
          for (var start = 0; start + winLen <= pre.length; start += hop) {
            var e = 0;
            for (i = 0; i < winLen; i++) { var v = pre[start + i] * w[i]; x[i] = v; e += v * v; }
            var t = (start + winLen / 2) / fs;
            if (e < 1e-6) { out.push({ t: t, f: [] }); continue; }
            var a = burg(x, order), fmts = formantsFromLPC(a, fs, ceiling), arr = [];
            for (i = 0; i < fmts.length && i < 4; i++) arr.push(Math.round(fmts[i].freq));
            out.push({ t: t, f: arr });
          }
          return { frames: out, ceiling: ceiling };
        }

        // =================================================================
        // RENDER + INTEGRASI
        // =================================================================
        var $ = function (id) { return document.getElementById(id); };
        var audioCtx = null, runToken = 0, lastData = null;
        var audioEl = null, playhead = null, selRect = null, selInfo = null;
        var rafId = 0, selStart = null, selEnd = null, selPlay = false;

        function ensureCtx() {
          if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } }
          return audioCtx;
        }

        function showLoading(on) {
          var l = $('praatLoading'), v = $('praatViews');
          if (!l || !v) return;
          l.style.display = on ? 'block' : 'none';
          v.style.display = on ? 'none' : 'block';
        }

        function clear() {
          runToken++;
          lastData = null;
          resetPlaybackUI();
          var panel = $('praatPanel');
          if (panel) { panel.style.display = 'none'; panel.classList.remove('praat-fs'); document.body.classList.remove('praat-fs-open'); }
        }

        function analyze(blob) {
          var panel = $('praatPanel');
          if (!panel) return;
          panel.style.display = 'block';
          showLoading(true);
          resetPlaybackUI();
          var token = ++runToken;
          var ctx = ensureCtx();
          if (!ctx) { showError('Browser tidak mendukung Web Audio.'); return; }

          blob.arrayBuffer().then(function (buf) {
            return new Promise(function (res, rej) {
              ctx.decodeAudioData(buf.slice(0), res, rej);
            });
          }).then(function (audioBuf) {
            if (token !== runToken) return;
            // beri waktu UI menampilkan "Menganalisis…" sebelum komputasi berat
            setTimeout(function () {
              if (token !== runToken) return;
              try {
                var ch = audioBuf.getChannelData(0);
                var sig = resample(ch, audioBuf.sampleRate, FS);
                if (sig.length > FS * MAX_DUR) sig = sig.subarray(0, FS * MAX_DUR);
                // normalisasi amplitudo
                var mx = 1e-9, i;
                for (i = 0; i < sig.length; i++) { var av = Math.abs(sig[i]); if (av > mx) mx = av; }
                var norm = new Float32Array(sig.length);
                for (i = 0; i < sig.length; i++) norm[i] = sig[i] / mx;

                var spec = computeSpectrogram(norm, FS, MAXF);
                var pitch = computePitch(norm, FS, 75, PITCH_MAX);
                var form = computeFormants(norm, FS);
                if (token !== runToken) return;
                lastData = { sig: norm, fs: FS, dur: norm.length / FS, spec: spec, pitch: pitch, form: form };
                showLoading(false);
                renderAll();
              } catch (err) { console.warn('Praat analyze error', err); showError('Gagal menganalisis audio ini.'); }
            }, 30);
          }).catch(function (err) {
            console.warn('Praat decode error', err);
            showError('Format audio tidak bisa didekode di browser ini.');
          });
        }

        function showError(msg) {
          var l = $('praatLoading'), v = $('praatViews');
          if (l) { l.style.display = 'block'; l.textContent = msg; l.style.fontStyle = 'normal'; l.style.color = 'var(--merah)'; }
          if (v) v.style.display = 'none';
          var ro = $('praatReadout'); if (ro) ro.innerHTML = '';
        }

        function median(arr) {
          if (!arr.length) return null;
          var s = arr.slice().sort(function (a, b) { return a - b; });
          return s[Math.floor(s.length / 2)];
        }

        function renderAll() {
          if (!lastData) return;
          renderWave();
          renderSpec();
          renderOverlay();
          renderAxes();
          renderReadout();
        }

        function renderWave() {
          var cv = $('praatWave'); if (!cv) return;
          var sig = lastData.sig, W = Math.min(1600, Math.max(400, sig.length >> 3)), H = 80;
          cv.width = W; cv.height = H;
          var g = cv.getContext('2d');
          g.clearRect(0, 0, W, H);
          g.strokeStyle = 'rgba(203,213,225,.9)'; g.lineWidth = 1;
          g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
          g.strokeStyle = '#1d4ed8'; g.lineWidth = 1;
          g.beginPath();
          var step = sig.length / W, x;
          for (x = 0; x < W; x++) {
            var s0 = Math.floor(x * step), s1 = Math.min(sig.length, Math.floor((x + 1) * step)), mn = 1, mx = -1;
            for (var k = s0; k < s1; k++) { if (sig[k] < mn) mn = sig[k]; if (sig[k] > mx) mx = sig[k]; }
            g.moveTo(x + .5, H / 2 - mx * (H / 2) * 0.92);
            g.lineTo(x + .5, H / 2 - mn * (H / 2) * 0.92);
          }
          g.stroke();
        }

        function renderSpec() {
          var cv = $('praatSpec'); if (!cv) return;
          var spec = lastData.spec, frames = spec.frames, W = frames.length, H = spec.binCount;
          if (W < 1) return;
          cv.width = W; cv.height = H;
          var g = cv.getContext('2d'), img = g.createImageData(W, H);
          // cari maksimum dB global
          var maxdB = -Infinity, i, b;
          for (i = 0; i < W; i++) { var fr = frames[i]; for (b = 0; b < H; b++) if (fr[b] > maxdB) maxdB = fr[b]; }
          var floor = maxdB - DYN, range = DYN;
          for (i = 0; i < W; i++) {
            var fr2 = frames[i];
            for (b = 0; b < H; b++) {
              var nrm = (fr2[b] - floor) / range;
              if (nrm < 0) nrm = 0; else if (nrm > 1) nrm = 1;
              nrm = Math.pow(nrm, 0.85);
              var g8 = Math.round(255 * (1 - nrm));
              var row = H - 1 - b, idx = (row * W + i) * 4;
              img.data[idx] = g8; img.data[idx + 1] = g8; img.data[idx + 2] = g8; img.data[idx + 3] = 255;
            }
          }
          g.putImageData(img, 0, 0);
        }

        function specTimeMax() {
          var spec = lastData.spec;
          return Math.max(1e-6, spec.frames.length * spec.hop / spec.fs);
        }

        function renderOverlay() {
          var cv = $('praatOverlay'); if (!cv) return;
          var W = 1000, H = 360;
          cv.width = W; cv.height = H;
          var g = cv.getContext('2d');
          g.clearRect(0, 0, W, H);
          var tMax = specTimeMax();
          var showPitch = $('praatChipPitch').classList.contains('on');
          var showFormant = $('praatChipFormant').classList.contains('on');

          // FORMANT (skala kiri, 0..MAXF) — titik merah
          if (showFormant) {
            var ff = lastData.form.frames, i, fi;
            g.fillStyle = 'rgba(239,68,68,.9)';
            for (i = 0; i < ff.length; i++) {
              var fr = ff[i], xx = (fr.t / tMax) * W;
              if (xx < 0 || xx > W) continue;
              for (fi = 0; fi < fr.f.length && fi < 3; fi++) {
                var freq = fr.f[fi];
                if (freq > MAXF) continue;
                var yy = (1 - freq / MAXF) * H;
                g.beginPath(); g.arc(xx, yy, 2.0, 0, 6.2832); g.fill();
              }
            }
          }

          // PITCH (skala kanan, 0..PITCH_MAX) — garis biru
          if (showPitch) {
            var pp = lastData.pitch;
            g.strokeStyle = '#1d4ed8'; g.lineWidth = 2.4; g.lineJoin = 'round';
            g.beginPath();
            var pen = false, k;
            for (k = 0; k < pp.length; k++) {
              if (pp[k].f0) {
                var px = (pp[k].t / tMax) * W, py = (1 - pp[k].f0 / PITCH_MAX) * H;
                if (!pen) { g.moveTo(px, py); pen = true; } else g.lineTo(px, py);
              } else { pen = false; }
            }
            g.stroke();
          }
        }

        function renderAxes() {
          var L = $('praatYAxisL'), R = $('praatYAxisR'), X = $('praatXAxis');
          if (L) { L.innerHTML = ''; [5, 4, 3, 2, 1, 0].forEach(function (v) { var s = document.createElement('span'); s.textContent = v + (v === 5 ? ' kHz' : ''); L.appendChild(s); }); }
          if (R) { R.innerHTML = ''; [500, 400, 300, 200, 100, 0].forEach(function (v) { var s = document.createElement('span'); s.textContent = v + (v === 500 ? ' Hz' : ''); R.appendChild(s); }); }
          if (X) {
            X.innerHTML = '';
            var dur = lastData.dur, ticks = 5, i;
            for (i = 0; i <= ticks; i++) { var s = document.createElement('span'); s.textContent = (dur * i / ticks).toFixed(2) + 's'; X.appendChild(s); }
          }
        }

        function renderReadout() {
          var ro = $('praatReadout'); if (!ro) return;
          var voiced = lastData.pitch.filter(function (p) { return p.f0; }).map(function (p) { return p.f0; });
          var mF0 = median(voiced);
          var c1 = [], c2 = [], c3 = [];
          lastData.form.frames.forEach(function (fr) { if (fr.f[0]) c1.push(fr.f[0]); if (fr.f[1]) c2.push(fr.f[1]); if (fr.f[2]) c3.push(fr.f[2]); });
          var f1 = median(c1), f2 = median(c2), f3 = median(c3);
          ro.innerHTML =
            'Durasi <b>' + lastData.dur.toFixed(2) + ' s</b>' +
            '<span>F0 median <span class="pv-pitch">' + (mF0 ? mF0.toFixed(0) + ' Hz' : '—') + '</span></span>' +
            '<span>F1 <span class="pv-formant">' + (f1 != null ? f1 + ' Hz' : '—') + '</span></span>' +
            '<span>F2 <span class="pv-formant">' + (f2 != null ? f2 + ' Hz' : '—') + '</span></span>' +
            '<span>F3 <span class="pv-formant">' + (f3 != null ? f3 + ' Hz' : '—') + '</span></span>' +
            '<span id="praatHover" style="margin-left:auto;color:var(--ink-faint);">klik = loncat · seret = seleksi</span>';
        }

        // ---------- pemutaran tersinkron + seleksi ----------
        function resetPlaybackUI() {
          stopLoop(); selPlay = false; selStart = null; selEnd = null;
          if (playhead) { playhead.style.display = 'none'; playhead.style.left = '0%'; }
          if (selRect) selRect.style.display = 'none';
          if (selInfo) { selInfo.style.display = 'none'; selInfo.innerHTML = ''; }
        }
        function updatePlayheadPos() {
          if (!playhead || !audioEl || !lastData) return;
          var tMax = specTimeMax(), f = tMax ? (audioEl.currentTime / tMax) : 0;
          f = Math.max(0, Math.min(1, f));
          playhead.style.left = (f * 100) + '%';
        }
        function startLoop() {
          stopLoop();
          if (playhead) playhead.style.display = 'block';
          var step = function () {
            updatePlayheadPos();
            if (selPlay && audioEl && selEnd != null && audioEl.currentTime >= selEnd) { audioEl.pause(); selPlay = false; }
            rafId = requestAnimationFrame(step);
          };
          rafId = requestAnimationFrame(step);
        }
        function stopLoop() { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } }
        function seekToFrac(fx) {
          if (!audioEl || !lastData) return;
          var t = fx * specTimeMax();
          try { audioEl.currentTime = Math.min(t, (audioEl.duration || t)); } catch (e) { }
          if (playhead) playhead.style.display = 'block';
          updatePlayheadPos();
        }
        function statsInRange(t0, t1) {
          var vo = [], c1 = [], c2 = [], c3 = [], i;
          for (i = 0; i < lastData.pitch.length; i++) { var p = lastData.pitch[i]; if (p.f0 && p.t >= t0 && p.t <= t1) vo.push(p.f0); }
          var ff = lastData.form.frames;
          for (i = 0; i < ff.length; i++) { var fr = ff[i]; if (fr.t >= t0 && fr.t <= t1) { if (fr.f[0]) c1.push(fr.f[0]); if (fr.f[1]) c2.push(fr.f[1]); if (fr.f[2]) c3.push(fr.f[2]); } }
          return { f0: median(vo), f1: median(c1), f2: median(c2), f3: median(c3) };
        }
        function applySelection(t0, t1) {
          if (!selRect || !selInfo) return;
          if (t1 - t0 < 0.005) { clearSelection(); return; }
          selStart = t0; selEnd = t1;
          var tMax = specTimeMax();
          selRect.style.left = (t0 / tMax * 100) + '%';
          selRect.style.width = ((t1 - t0) / tMax * 100) + '%';
          selRect.style.display = 'block';
          var s = statsInRange(t0, t1);
          selInfo.innerHTML = '';
          var lab = document.createElement('span');
          lab.innerHTML = '<b style="color:var(--cokelat)">Seleksi</b> ' + t0.toFixed(3) + '–' + t1.toFixed(3) + 's'
            + ' · <span class="pv-pitch">F0 ' + (s.f0 ? s.f0.toFixed(0) : '—') + '</span>'
            + ' · <span class="pv-formant">F1 ' + (s.f1 != null ? s.f1 : '—') + '</span>'
            + ' · <span class="pv-formant">F2 ' + (s.f2 != null ? s.f2 : '—') + '</span>'
            + ' · <span class="pv-formant">F3 ' + (s.f3 != null ? s.f3 : '—') + '</span> Hz';
          selInfo.appendChild(lab);
          var play = document.createElement('button');
          play.type = 'button'; play.textContent = '▶ Putar seleksi';
          play.style.cssText = 'margin-left:auto;border:1px solid var(--emas-terang);background:var(--paper);color:var(--cokelat);border-radius:100px;padding:3px 10px;font-family:var(--mono);font-size:10px;font-weight:700;cursor:pointer;';
          play.addEventListener('click', playSelection);
          selInfo.appendChild(play);
          var clr = document.createElement('button');
          clr.type = 'button'; clr.textContent = '✕';
          clr.title = 'Hapus seleksi';
          clr.style.cssText = 'border:1px solid var(--line-strong);background:var(--paper);color:var(--ink-muted);border-radius:var(--r-sm);padding:3px 8px;font-size:11px;cursor:pointer;';
          clr.addEventListener('click', clearSelection);
          selInfo.appendChild(clr);
          selInfo.style.display = 'flex';
          if (audioEl) { try { audioEl.currentTime = t0; } catch (e) { } if (playhead) playhead.style.display = 'block'; updatePlayheadPos(); }
        }
        function clearSelection() {
          selStart = null; selEnd = null; selPlay = false;
          if (selRect) selRect.style.display = 'none';
          if (selInfo) { selInfo.style.display = 'none'; selInfo.innerHTML = ''; }
        }
        function playSelection() {
          if (!audioEl || selStart == null) return;
          selPlay = true;
          try { audioEl.currentTime = selStart; } catch (e) { }
          var pr = audioEl.play(); if (pr && pr.catch) pr.catch(function () { });
        }

        // ---------- interaksi ----------
        function bindUI() {
          var chipP = $('praatChipPitch'), chipF = $('praatChipFormant');
          function toggleChip(el) {
            el.classList.toggle('on');
            var cb = el.querySelector('input'); if (cb) cb.checked = el.classList.contains('on');
            if (lastData) renderOverlay();
          }
          if (chipP) chipP.addEventListener('click', function (e) { e.preventDefault(); toggleChip(chipP); });
          if (chipF) chipF.addEventListener('click', function (e) { e.preventDefault(); toggleChip(chipF); });

          var fsBtn = $('praatFullscreenBtn'), panel = $('praatPanel');
          if (fsBtn && panel) {
            fsBtn.addEventListener('click', function () {
              var on = panel.classList.toggle('praat-fs');
              document.body.classList.toggle('praat-fs-open', on);
              fsBtn.textContent = on ? '✕' : '⛶';
            });
          }
          document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && panel && panel.classList.contains('praat-fs')) {
              panel.classList.remove('praat-fs'); document.body.classList.remove('praat-fs-open');
              if (fsBtn) fsBtn.textContent = '⛶';
            }
          });

          var stage = $('praatStage'), cursor = $('praatCursor');
          audioEl = $('audioPlayback');

          if (stage) {
            playhead = document.createElement('div');
            playhead.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:var(--emas);z-index:5;pointer-events:none;display:none;';
            stage.appendChild(playhead);
            selRect = document.createElement('div');
            selRect.style.cssText = 'position:absolute;top:0;bottom:0;background:rgba(29,78,216,.16);border-left:1.5px solid var(--emas-terang);border-right:1.5px solid var(--emas-terang);z-index:4;pointer-events:none;display:none;';
            stage.appendChild(selRect);
          }
          var ro = $('praatReadout');
          if (ro && ro.parentNode) {
            selInfo = document.createElement('div');
            selInfo.id = 'praatSelInfo';
            selInfo.style.cssText = 'display:none;align-items:center;flex-wrap:wrap;gap:6px 12px;padding:6px 11px;border-top:1px dashed var(--line-strong);background:var(--gading);font-family:var(--mono);font-size:10px;color:var(--cokelat);';
            ro.parentNode.insertBefore(selInfo, ro);
          }

          if (audioEl) {
            audioEl.addEventListener('play', startLoop);
            audioEl.addEventListener('pause', function () { stopLoop(); updatePlayheadPos(); });
            audioEl.addEventListener('ended', function () { stopLoop(); selPlay = false; });
            audioEl.addEventListener('seeked', updatePlayheadPos);
          }

          if (stage) {
            var down = false, downFrac = 0, downX = 0, moved = false;
            var fracFromEvent = function (e) { var r = stage.getBoundingClientRect(); return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); };
            stage.addEventListener('pointerdown', function (e) {
              if (!lastData) return;
              down = true; moved = false; downX = e.clientX; downFrac = fracFromEvent(e);
              try { stage.setPointerCapture(e.pointerId); } catch (_) { }
            });
            stage.addEventListener('pointermove', function (e) {
              if (!lastData) return;
              var r = stage.getBoundingClientRect();
              var fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
              if (down) {
                if (Math.abs(e.clientX - downX) > 4) moved = true;
                var a = Math.max(0, Math.min(1, Math.min(downFrac, fx))), b = Math.max(0, Math.min(1, Math.max(downFrac, fx)));
                if (selRect) { selRect.style.left = (a * 100) + '%'; selRect.style.width = ((b - a) * 100) + '%'; selRect.style.display = 'block'; }
              }
              if (fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1) {
                if (cursor) { cursor.style.display = 'block'; cursor.style.left = (fx * 100) + '%'; }
                var time = fx * specTimeMax(), freq = (1 - fy) * MAXF, pitchHz = (1 - fy) * PITCH_MAX;
                var h = $('praatHover');
                if (h) h.textContent = time.toFixed(3) + 's · ' + Math.round(freq) + ' Hz (pitch ' + Math.round(pitchHz) + ')';
              }
            });
            stage.addEventListener('pointerup', function (e) {
              if (!lastData || !down) return;
              down = false;
              var fx = fracFromEvent(e);
              if (!moved) { if (selRect) selRect.style.display = 'none'; clearSelection(); seekToFrac(fx); }
              else { var tMax = specTimeMax(); applySelection(Math.min(downFrac, fx) * tMax, Math.max(downFrac, fx) * tMax); }
            });
            stage.addEventListener('pointercancel', function () { down = false; });
            stage.addEventListener('mouseleave', function () { if (cursor) cursor.style.display = 'none'; var h = $('praatHover'); if (h) h.textContent = ''; });
          }
        }

        window.PraatViz = { analyze: analyze, clear: clear };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindUI);
        else bindUI();
      })();