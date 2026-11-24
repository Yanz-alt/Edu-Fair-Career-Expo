/**
 * ==============================================================================
 * KONTROL MUSIK LATAR & FLOATING MUSIC TOGGLE - EDU FAIR & CAREER EXPO 2026
 * SMK Negeri 6 Kota Tangerang Selatan (NEMTAS)
 * ==============================================================================
 */

/* === BLOK LOGIKA 3: KONTROL AUDIO LATAR & FLOATING MUSIC TOGGLE === */

(function () {
  'use strict';

  // Kunci penyimpanan status di localStorage
  const STORAGE_KEY = 'nemtas_music_playing';
  const STORAGE_AUTOPLAY_KEY = 'nemtas_music_autoplay';

  // Variabel internal audio
  let audioElement = null;
  let floatingBtn = null;
  let isPlaying = false;
  let useSynthFallback = false;
  let synthContext = null;
  let synthInterval = null;
  let synthGainNode = null;

  /**
   * Menginisialisasi tombol melayang jika belum ada di DOM
   */
  function ensureFloatingButton() {
    floatingBtn = document.getElementById('floating-music-btn');
    if (!floatingBtn) {
      floatingBtn = document.createElement('button');
      floatingBtn.id = 'floating-music-btn';
      floatingBtn.className = 'floating-music-btn';
      floatingBtn.setAttribute('type', 'button');
      floatingBtn.setAttribute('aria-label', 'Putar atau Hentikan Musik Latar');
      floatingBtn.setAttribute('title', 'Putar / Jeda Musik');
      floatingBtn.innerHTML = `
        <span class="music-icon music-icon-disc">
          <svg class="icon-svg icon-note" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          <svg class="icon-svg icon-mute" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        </span>
        <span class="music-ripple"></span>
      `;
      document.body.appendChild(floatingBtn);
    }

    floatingBtn.removeEventListener('click', handleToggleClick);
    floatingBtn.addEventListener('click', handleToggleClick);
    updateButtonUI(isPlaying);
  }

  /**
   * Menginisialisasi elemen HTML5 Audio
   */
  function initAudioElement() {
    audioElement = document.getElementById('bg-music');
    if (!audioElement) {
      audioElement = document.createElement('audio');
      audioElement.id = 'bg-music';
      audioElement.preload = 'auto';
      audioElement.loop = true;
      audioElement.volume = 0.65;

      // Coba load sumber file lokal
      const source = document.createElement('source');
      source.src = 'assets/audio/backsound.mp3';
      source.type = 'audio/mpeg';
      audioElement.appendChild(source);

      document.body.appendChild(audioElement);
    }

    // Deteksi jika file audio tidak ditemukan (404)
    audioElement.addEventListener('error', function (e) {
      console.warn('⚠️ [NemtasAudio] File assets/audio/backsound.mp3 belum ada/gagal dimuat. Mengaktifkan fallback Web Audio API ambient chord.');
      useSynthFallback = true;
      if (isPlaying) {
        startAmbientSynth();
      }
    });

    audioElement.addEventListener('play', function () {
      isPlaying = true;
      localStorage.setItem(STORAGE_KEY, 'true');
      updateButtonUI(true);
    });

    audioElement.addEventListener('pause', function () {
      if (!useSynthFallback) {
        isPlaying = false;
        localStorage.setItem(STORAGE_KEY, 'false');
        updateButtonUI(false);
      }
    });
  }

  /**
   * Fallback Sintesis Web Audio API (Soft Ambient Chord Generator)
   * Menjamin musik tetap berbunyi syahdu secara offline murni tanpa file eksternal!
   */
  function startAmbientSynth() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!synthContext) {
        synthContext = new AudioCtx();
      }
      if (synthContext.state === 'suspended') {
        synthContext.resume();
      }

      if (synthGainNode) return; // Sudah berjalan

      synthGainNode = synthContext.createGain();
      synthGainNode.gain.setValueAtTime(0.01, synthContext.currentTime);
      synthGainNode.gain.linearRampToValueAtTime(0.12, synthContext.currentTime + 3);
      synthGainNode.connect(synthContext.destination);

      // Kumpulan frekuensi chord ambient hangat (Fmaj7 - Am7 - Dm7 - Bbmaj7)
      const chordProgressions = [
        [174.61, 220.00, 261.63, 329.63], // F, A, C, E
        [220.00, 261.63, 329.63, 392.00], // A, C, E, G
        [146.83, 220.00, 261.63, 349.23], // D, A, C, F
        [116.54, 174.61, 233.08, 293.66]  // Bb, F, Bb, D
      ];
      let chordIndex = 0;

      function playNextChord() {
        if (!synthContext || !synthGainNode || !isPlaying) return;
        const freqs = chordProgressions[chordIndex % chordProgressions.length];
        chordIndex++;

        freqs.forEach(freq => {
          const osc = synthContext.createOscillator();
          const filter = synthContext.createBiquadFilter();
          const noteGain = synthContext.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, synthContext.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, synthContext.currentTime);

          noteGain.gain.setValueAtTime(0.001, synthContext.currentTime);
          noteGain.gain.linearRampToValueAtTime(0.08, synthContext.currentTime + 1.5);
          noteGain.gain.linearRampToValueAtTime(0.001, synthContext.currentTime + 6.0);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(synthGainNode);

          osc.start();
          osc.stop(synthContext.currentTime + 6.5);
        });
      }

      playNextChord();
      synthInterval = setInterval(playNextChord, 5500);
      isPlaying = true;
      localStorage.setItem(STORAGE_KEY, 'true');
      updateButtonUI(true);
    } catch (err) {
      console.warn('Web Audio Fallback not supported:', err);
    }
  }

  function stopAmbientSynth() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
    if (synthGainNode && synthContext) {
      try {
        synthGainNode.gain.linearRampToValueAtTime(0.001, synthContext.currentTime + 1);
        setTimeout(() => {
          synthGainNode = null;
        }, 1100);
      } catch (e) {
        synthGainNode = null;
      }
    }
  }

  /**
   * Mengubah status pemutaran musik
   */
  function playMusic() {
    initAudioElement();
    isPlaying = true;
    localStorage.setItem(STORAGE_KEY, 'true');

    if (!useSynthFallback && audioElement) {
      const playPromise = audioElement.play();
      if (playPromise !== undefined && typeof playPromise.then === 'function') {
        return playPromise
          .then(() => {
            updateButtonUI(true);
          })
          .catch((err) => {
            console.info('Autoplay dibatasi browser atau audio 404, mencoba Web Audio fallback:', err.message);
            // Coba Web Audio fallback
            useSynthFallback = true;
            startAmbientSynth();
          });
      }
    } else {
      startAmbientSynth();
    }
    updateButtonUI(true);
    return Promise.resolve();
  }

  function pauseMusic() {
    isPlaying = false;
    localStorage.setItem(STORAGE_KEY, 'false');

    if (audioElement && !useSynthFallback) {
      try {
        audioElement.pause();
      } catch (e) {}
    }
    stopAmbientSynth();
    updateButtonUI(false);
  }

  function toggleMusic() {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  }

  function handleToggleClick(e) {
    if (e) e.preventDefault();
    toggleMusic();
  }

  /**
   * Memperbarui tampilan tombol melayang (ikon & animasi putar)
   */
  function updateButtonUI(playing) {
    if (!floatingBtn) return;
    const noteIcon = floatingBtn.querySelector('.icon-note');
    const muteIcon = floatingBtn.querySelector('.icon-mute');

    if (playing) {
      floatingBtn.classList.add('is-playing');
      floatingBtn.classList.remove('is-paused');
      if (noteIcon) noteIcon.style.display = 'block';
      if (muteIcon) muteIcon.style.display = 'none';
    } else {
      floatingBtn.classList.remove('is-playing');
      floatingBtn.classList.add('is-paused');
      if (noteIcon) noteIcon.style.display = 'none';
      if (muteIcon) muteIcon.style.display = 'block';
    }
  }

  /**
   * Inisialisasi awal saat halaman dimuat
   */
  function init() {
    ensureFloatingButton();
    initAudioElement();

    // Cek apakah ada flag pemutaran aktif dari halaman sebelumnya
    const savedState = localStorage.getItem(STORAGE_KEY);
    const autoplayFlag = localStorage.getItem(STORAGE_AUTOPLAY_KEY);

    if (savedState === 'true' || autoplayFlag === 'true') {
      // Hapus one-time autoplay flag
      localStorage.removeItem(STORAGE_AUTOPLAY_KEY);
      // Coba autoplay saat user pertama kali berinteraksi jika diblokir
      const attemptPlay = () => {
        playMusic();
        document.removeEventListener('click', attemptPlay);
        document.removeEventListener('touchstart', attemptPlay);
      };

      // Coba langsung
      playMusic();

      // Fallback listener user gesture jika browser memblokir unmuted autoplay
      document.addEventListener('click', attemptPlay, { once: true });
      document.addEventListener('touchstart', attemptPlay, { once: true });
    } else {
      updateButtonUI(false);
    }
  }

  // Jalankan saat DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Publikasikan API ke window
  window.NemtasAudio = {
    play: playMusic,
    pause: pauseMusic,
    toggle: toggleMusic,
    isPlaying: function () {
      return isPlaying;
    },
    init: init
  };
})();
