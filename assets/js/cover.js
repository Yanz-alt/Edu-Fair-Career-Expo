/**
 * ==============================================================================
 * LOGIKA HALAMAN HERO COVER (index.html) — v2.0 Blue Theme
 * Edu Fair dan Career Expo 2026 — SMKN 6 Kota Tangerang Selatan
 * ==============================================================================
 * Arsitektur: 100% Vanilla JS ES6+, Zero Build Tools, CDN Supabase @2
 * Subpath-safe: Semua navigasi menggunakan path relatif (GitHub Pages compat)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  'use strict';

  // ── Referensi elemen DOM cover ──
  // Sesuai dengan ID di index.html v2.0 (Blue Theme)
  const coverGuestNameEl   = document.getElementById('cover-guest-name');
  const coverGuestInstEl   = document.getElementById('cover-guest-instansi');
  const coverGuestBadgeEl  = document.getElementById('cover-guest-badge-wrap'); // div pembungkus badge
  const btnOpenInvitation  = document.getElementById('btn-open-invitation');
  const coverCard          = document.getElementById('cover-card');

  // State penyimpanan data tamu yang ditemukan di database
  let currentGuest = null;

  /* === BLOK LOGIKA 1: PEMBACAAN PARAMETER URL & QUERY DATABASE TAMU === */
  // ── 1. Membaca query string dari URL browser ──
  // Mendukung dua format token:
  //   ?invite=<unique_token>  → format resmi dari sistem
  //   ?token=<unique_token>   → format alternatif (backward compat)
  //   ?to=Nama+Tamu           → fallback demo tanpa database
  const urlParams      = new URLSearchParams(window.location.search);
  const inviteToken    = urlParams.get('invite') || urlParams.get('token');
  const fallbackToName = urlParams.get('to');

  console.info('🔍 [NEMTAS Cover] Parameter URL terdeteksi:', {
    token : inviteToken,
    to    : fallbackToName
  });

  /**
   * Menentukan kelas CSS badge berdasarkan kategori tamu
   */
  function getCategoryBadgeClass(category) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('universitas') || cat.includes('kampus') || cat.includes('politeknik')) return 'badge-universitas';
    if (cat.includes('industri')   || cat.includes('perusahaan'))  return 'badge-industri';
    if (cat.includes('sponsor'))   return 'badge-sponsorship';
    if (cat.includes('alumni'))    return 'badge-alumni';
    return 'badge-tamu';
  }

  /**
   * Merender data tamu ke elemen Hero Cover:
   *   - Nama tamu ke #cover-guest-name
   *   - Instansi ke #cover-guest-instansi
   *   - Badge kategori ke #cover-guest-badge-wrap
   */
  function renderGuestCover(displayName, instansi, kategori) {
    if (coverGuestNameEl) {
      coverGuestNameEl.textContent = displayName || 'Tamu Terhormat';
    }
    if (coverGuestInstEl) {
      coverGuestInstEl.textContent = instansi || 'Sahabat SMKN 6 Kota Tangerang Selatan';
    }
    if (coverGuestBadgeEl) {
      const badgeClass = getCategoryBadgeClass(kategori);
      coverGuestBadgeEl.innerHTML = `<span class="badge ${badgeClass}">${kategori || 'Tamu Undangan'}</span>`;
    }
  }

  /**
   * Fallback jika token ada tapi tidak ditemukan di database:
   * Dekode nama dari format token "12345-nama-tamu-xxxx"
   */
  function renderFallbackToken(token) {
    const cleaned   = token.replace(/^[0-9]+-/, '').replace(/-[a-f0-9]{4,8}$/, '').replace(/-/g, ' ');
    const titleCase = cleaned.replace(/\b\w/g, l => l.toUpperCase());
    renderGuestCover(
      titleCase || 'Tamu Undangan Khusus',
      'Mitra SMKN 6 Kota Tangerang Selatan',
      'Tamu Undangan'
    );
  }

  // ── 2. Alur pengambilan data tamu ──
  if (inviteToken) {
    // ── A. Ada token: tampilkan loading sementara, lalu query Supabase ──
    renderGuestCover('Memverifikasi Undangan…', 'Mohon tunggu sejenak…', 'Memuat');

    if (window.supabaseClient && !window.SUPABASE_CONFIG?.isPlaceholder) {
      try {
        const { data: guest, error } = await window.supabaseClient
          .from('guests')
          .select('*')
          .eq('unique_token', inviteToken)
          .single();

        if (error) {
          console.warn('⚠️ [NEMTAS Cover] Tamu tidak ditemukan di DB:', error.message);
          renderFallbackToken(inviteToken);
        } else if (guest) {
          currentGuest = guest;
          renderGuestCover(guest.display_name, guest.instansi, guest.kategori);

          // Catat waktu undangan pertama kali dibuka (opened_at)
          if (!guest.opened_at) {
            try {
              await window.supabaseClient
                .from('guests')
                .update({ opened_at: new Date().toISOString() })
                .eq('id', guest.id);
              console.info('🕒 [NEMTAS Cover] opened_at dicatat untuk tamu ID:', guest.id);
            } catch (errUpd) {
              console.warn('⚠️ [NEMTAS Cover] Gagal mencatat opened_at:', errUpd);
            }
          }
        }
      } catch (err) {
        console.error('❌ [NEMTAS Cover] Error query Supabase:', err);
        renderFallbackToken(inviteToken);
      }
    } else {
      // Supabase belum dikonfigurasi (mode demo / offline)
      console.info('ℹ️ [NEMTAS Cover] Supabase belum dikonfigurasi → mode demo.');
      renderFallbackToken(inviteToken);
    }
  } else if (fallbackToName) {
    // ── B. Parameter ?to=Nama+Tamu: mode demo / preview tanpa token ──
    const cleanName = decodeURIComponent(fallbackToName.replace(/\+/g, ' '));
    renderGuestCover(cleanName, 'Tamu Undangan Istimewa', 'Tamu Undangan');
  } else {
    // ── C. Tidak ada parameter: tampilkan nama generik ──
    renderGuestCover(
      'Bapak / Ibu / Rekan Terhormat',
      'Keluarga Besar & Mitra SMKN 6 Kota Tangerang Selatan',
      'Tamu Undangan'
    );
  }

  /* === BLOK LOGIKA 2: MANIPULASI DOM FORM RSVP & REALTIME ATTENDANCE WALL === */
  // Catatan Arsitektur Multi-Page:
  // Form RSVP lengkap dan Live Attendance Wall terletak di halaman kedua (detail.html).
  // Halaman pertama (index.html) hanya bertugas:
  //   - Menampilkan identitas tamu (dari Supabase / URL param)
  //   - Mencatat opened_at ke Supabase
  //   - Meneruskan parameter URL (?invite= atau ?to=) ke detail.html
  //     menggunakan path relatif subpath-safe agar berjalan di GitHub Pages.
  //
  // Contoh navigasi subpath-safe:
  //   window.location.href = 'detail.html' + window.location.search;
  //   → bekerja di: localhost, Vercel, github.io/repo-name/

  /* === BLOK LOGIKA 3: KONTROL AUDIO LATAR & FLOATING MUSIC TOGGLE === */
  // Musik latar dikelola sepenuhnya oleh modul global window.NemtasAudio
  // yang diinisialisasi di audio-player.js.
  // Di sini hanya menghubungkan klik tombol CTA "Buka Undangan" dengan:
  //   1. Menyimpan flag autoplay ke localStorage
  //   2. Memanggil NemtasAudio.play() untuk request izin audio
  //   3. Menjalankan animasi transisi keluar (.cover-exit)
  //   4. Navigasi subpath-safe ke detail.html
  if (btnOpenInvitation) {
    btnOpenInvitation.addEventListener('click', function (e) {
      e.preventDefault();

      // 1. Simpan flag agar halaman detail tahu untuk autoplay musik
      localStorage.setItem('nemtas_music_playing',  'true');
      localStorage.setItem('nemtas_music_autoplay', 'true');

      // 2. Jalankan musik latar (memerlukan gesture pengguna → aman di sini)
      try {
        if (window.NemtasAudio && typeof window.NemtasAudio.play === 'function') {
          const p = window.NemtasAudio.play();
          if (p && typeof p.catch === 'function') {
            p.catch(() => {});
          }
        }
      } catch (_) {}

      // 3. Animasi transisi kartu sampul keluar
      if (coverCard) {
        coverCard.classList.add('cover-exit');
      }

      // 4. Navigasi ke detail.html dengan mempertahankan seluruh query string
      //    Menggunakan path relatif agar subpath-safe di GitHub Pages:
      //    index.html?invite=xyz → detail.html?invite=xyz
      setTimeout(() => {
        const qs = window.location.search || '';
        window.location.href = 'detail.html' + qs;
      }, 550); // Jeda 550ms = durasi animasi cover-exit
    });
  }
});
