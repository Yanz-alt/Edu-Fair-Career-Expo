/**
 * ==============================================================================
 * LOGIKA HALAMAN DETAIL UNDANGAN (detail.html) — v2.0 Blue Theme
 * Edu Fair dan Career Expo 2026 — SMKN 6 Kota Tangerang Selatan
 * ==============================================================================
 * Arsitektur: 100% Vanilla JS ES6+, Zero Build Tools, CDN Supabase @2
 * Subpath-safe: Semua navigasi menggunakan path relatif (GitHub Pages compat)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // State internal tamu aktif yang sedang membuka undangan
  let currentGuest = null;

  /* ============================================================================
   * SISTEM TOAST NOTIFICATION GLOBAL
   * Menampilkan notifikasi popup di sudut layar
   * ============================================================================ */
  function showToast(message, type = 'info', duration = 3200) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#F59E0B" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38BDF8" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <span style="display:flex;align-items:center;flex-shrink:0;">${iconSvg}</span>
      <span style="flex:1;line-height:1.4;">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, duration);
  }

  // Ekspor ke window supaya tersedia global
  window.showToast = showToast;

  /* ============================================================================
   * HELPER: MENYETEL TEKS KE BEBERAPA ELEMEN SEKALIGUS (DUAL COUNTDOWN)
   * ============================================================================ */
  function setTextMulti(ids, value) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  /* ============================================================================
   * COUNTDOWN TIMER — MENUJU 25 NOVEMBER 2026 JAM 07.00 WIB
   * Memperbarui dua set elemen: left-pane (desktop) dan feed card (mobile)
   * ============================================================================ */
  function initCountdownTimer() {
    // Target: Rabu, 25 November 2026, 07.00 WIB (UTC+7)
    const targetDate = new Date('2026-11-25T07:00:00+07:00').getTime();

    function updateTimer() {
      const now = Date.now();
      const distance = targetDate - now;

      if (distance < 0) {
        // Acara sudah dimulai
        setTextMulti(['cd-days', 'cd-left-days'], '00');
        setTextMulti(['cd-hours', 'cd-left-hours'], '00');
        setTextMulti(['cd-minutes', 'cd-left-minutes'], '00');
        setTextMulti(['cd-seconds', 'cd-left-seconds'], '00');

        const headings = document.querySelectorAll('.countdown-heading-left, .countdown-feed-heading');
        headings.forEach(h => { h.textContent = '🎉 Acara Sedang Berlangsung!'; });
        return;
      }

      const days    = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Update countdown di FEED CARD MOBILE (id: cd-days, cd-hours, dll.)
      setTextMulti(['cd-days'],    String(days).padStart(2, '0'));
      setTextMulti(['cd-hours'],   String(hours).padStart(2, '0'));
      setTextMulti(['cd-minutes'], String(minutes).padStart(2, '0'));
      setTextMulti(['cd-seconds'], String(seconds).padStart(2, '0'));

      // Update countdown di LEFT PANE DESKTOP (id: cd-left-days, cd-left-hours, dll.)
      setTextMulti(['cd-left-days'],    String(days).padStart(2, '0'));
      setTextMulti(['cd-left-hours'],   String(hours).padStart(2, '0'));
      setTextMulti(['cd-left-minutes'], String(minutes).padStart(2, '0'));
      setTextMulti(['cd-left-seconds'], String(seconds).padStart(2, '0'));
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }
  initCountdownTimer();

  /* ============================================================================
   * SIMPAN KE KALENDER — GOOGLE CALENDAR & FILE .ICS BLOB DOWNLOAD
   * Memperbarui tombol di feed card mobile DAN di left-pane desktop
   * ============================================================================ */
  function initCalendarActions() {
    const title    = encodeURIComponent('Edu Fair dan Career Expo 2026 — SMKN 6 Kota Tangerang Selatan');
    const details  = encodeURIComponent('Tema: Connecting Competence to Future: Bekerja, Melanjutkan, Berwirausaha.\nLokasi: SMKN 6 Kota Tangerang Selatan, Jl. Magnolia VI No. 6, Jelupang, Serpong Utara.');
    const location = encodeURIComponent('SMKN 6 Kota Tangerang Selatan, Jl. Magnolia VI No. 6, Jelupang, Serpong Utara, Tangerang Selatan');
    // 25 Nov 2026 07.00–14.20 WIB = 25 Nov 2026 00.00–07.20 UTC
    const dates    = '20261125T000000Z/20261125T072000Z';
    const gcalHref = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;

    // Set href pada KEDUA tombol Google Calendar (mobile feed dan desktop left pane)
    ['btn-gcal', 'btn-gcal-left'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.href = gcalHref;
    });

    // Generator .ICS — terpasang ke KEDUA tombol ICS
    function downloadIcs(e) {
      e.preventDefault();
      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SMKN 6 Tangsel//EduFair 2026//ID',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:nemtas-edufair-2026-' + Date.now() + '@smkn6tangsel.sch.id',
        'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        'DTSTART:20261125T000000Z',
        'DTEND:20261125T072000Z',
        'SUMMARY:Edu Fair dan Career Expo 2026 - SMKN 6 Tangsel',
        'DESCRIPTION:Connecting Competence to Future: Bekerja\\, Melanjutkan\\, Berwirausaha',
        'LOCATION:SMKN 6 Kota Tangerang Selatan\\, Jl. Magnolia VI No. 6\\, Jelupang\\, Serpong Utara\\, Tangsel',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', 'EduFair-2026-SMKN6Tangsel.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('File kalender (.ics) berhasil diunduh!', 'success');
    }

    ['btn-ics', 'btn-ics-left'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', downloadIcs);
    });
  }
  initCalendarActions();

  /* ============================================================================
   * RUNDOWN ACARA INTERAKTIF — RENDER DARI window.RUNDOWN_DATA
   * Tab navigasi menggunakan atribut data-sid
   * ============================================================================ */
  function initRundownSection() {
    const tabsContainer     = document.getElementById('rundown-tabs');
    const timelineContainer = document.getElementById('timeline-container');
    const venueTextEl       = document.getElementById('venue-text');

    if (!window.RUNDOWN_DATA || !window.RUNDOWN_DATA.sessions || !timelineContainer) return;

    /**
     * Merender daftar item timeline untuk sesi tertentu (berdasarkan session_id)
     */
    function renderSessionTimeline(sessionId) {
      const session = window.RUNDOWN_DATA.sessions.find(s => s.session_id === sessionId);
      if (!session) {
        timelineContainer.innerHTML = `<p style="text-align:center;color:#94A3B8;padding:20px;">Sesi tidak ditemukan.</p>`;
        return;
      }

      // Perbarui badge lokasi / venue sesi
      if (venueTextEl) {
        venueTextEl.textContent = session.venue || 'Area SMKN 6 Kota Tangerang Selatan';
      }

      timelineContainer.innerHTML = '';

      (session.items || []).forEach((item, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'timeline-item';

        let tagsHtml = '';
        if (item.performer) tagsHtml += `<span class="timeline-tag timeline-tag-performer">🎤 ${item.performer}</span>`;
        if (item.pic)       tagsHtml += `<span class="timeline-tag">PIC: ${item.pic}</span>`;

        const notesHtml = item.notes
          ? `<div class="timeline-notes">📝 ${item.notes}</div>`
          : '';

        itemEl.innerHTML = `
          <div class="timeline-dot"></div>
          <div class="timeline-item-card">
            <div class="timeline-time-row">
              <span class="timeline-time">${item.start} – ${item.end} WIB</span>
              <span class="timeline-duration">${item.duration_min} Menit</span>
            </div>
            <div class="timeline-activity">${item.activity}</div>
            ${tagsHtml ? `<div class="timeline-tags">${tagsHtml}</div>` : ''}
            ${notesHtml}
          </div>
        `;
        timelineContainer.appendChild(itemEl);
      });
    }

    // Event listener tab klik (delegasi ke container)
    if (tabsContainer) {
      tabsContainer.addEventListener('click', function (e) {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;

        tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        // Atribut yang digunakan adalah data-sid (bukan data-session-id)
        const sid = btn.getAttribute('data-sid');
        renderSessionTimeline(sid);
      });
    }

    // Default: render sesi pertama saat halaman dimuat
    renderSessionTimeline('sesi-1');
  }
  initRundownSection();

  /* ============================================================================
   * LOKASI — SALIN ALAMAT & KONTAK KE CLIPBOARD DENGAN TOAST NOTIFIKASI
   * ============================================================================ */
  function initLocationClipboard() {
    const addressText = 'SMK Negeri 6 Kota Tangerang Selatan, Jl. Magnolia VI No. 6, Kel. Jelupang, Kec. Serpong Utara, Kota Tangerang Selatan, Banten 15323';
    const contactText = 'Panitia Edu Fair & Career Expo 2026 SMKN 6 Tangsel: Bu Lina (0812-8089-0067) | Pak Fajar (0818-791-755)';

    const btnAddr = document.getElementById('btn-copy-address');
    const btnCont = document.getElementById('btn-copy-contact');

    function copyToClip(text, label) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => showToast(`${label} berhasil disalin ke clipboard! 📋`, 'success'))
          .catch(() => showToast(text, 'info', 5000));
      } else {
        // Fallback: select + execCommand untuk browser lama
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast(`${label} berhasil disalin!`, 'success'); }
        catch (_) { showToast(text, 'info', 5000); }
        document.body.removeChild(ta);
      }
    }

    if (btnAddr) btnAddr.addEventListener('click', () => copyToClip(addressText, 'Alamat SMKN 6 Tangsel'));
    if (btnCont) btnCont.addEventListener('click', () => copyToClip(contactText, 'Kontak panitia'));
  }
  initLocationClipboard();

  /* ============================================================================
   * GALERI FOTO — LIGHTBOX MODAL & SCROLL REVEAL (IntersectionObserver)
   * Elemen galeri: .gallery-item dengan atribut data-src & data-cap
   * Lightbox: #lightbox-modal, #lb-img, #lb-caption, #lb-close
   * ============================================================================ */
  function initGalleryLightbox() {
    const galleryItems   = document.querySelectorAll('.gallery-item');
    const lightboxModal  = document.getElementById('lightbox-modal');
    const lbImg          = document.getElementById('lb-img');
    const lbCaption      = document.getElementById('lb-caption');
    const lbClose        = document.getElementById('lb-close');

    if (!lightboxModal || !lbImg) return;

    function openLightbox(src, caption) {
      lbImg.src = src;
      if (lbCaption) lbCaption.textContent = caption || '';
      lightboxModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightboxModal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    // Klik pada setiap kartu galeri → buka lightbox
    galleryItems.forEach(item => {
      item.addEventListener('click', function () {
        const src     = this.getAttribute('data-src') || this.querySelector('img')?.src || '';
        const caption = this.getAttribute('data-cap') || '';
        openLightbox(src, caption);
      });
    });

    if (lbClose) lbClose.addEventListener('click', closeLightbox);

    // Klik latar belakang modal → tutup
    lightboxModal.addEventListener('click', function (e) {
      if (e.target === lightboxModal) closeLightbox();
    });

    // Tombol Escape → tutup
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightboxModal.classList.contains('is-open')) closeLightbox();
    });
  }
  initGalleryLightbox();

  /* ============================================================================
   * SCROLL REVEAL ANIMATION — IntersectionObserver
   * Memicu class 'visible' pada elemen dengan class 'reveal'
   * saat elemen masuk ke viewport scroll pengguna
   * ============================================================================ */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Hanya sekali
        }
      });
    }, {
      threshold: 0.1,  // 10% elemen terlihat sudah cukup trigger
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => observer.observe(el));
  }
  initScrollReveal();

  /* ============================================================================
   * BLOK LOGIKA 1: PEMBACAAN PARAMETER URL & QUERY DATABASE TAMU
   * ============================================================================
   * Alur:
   *   1. Baca ?invite=<token> atau ?token=<token> dari query string URL
   *   2. Jika ada token → query Supabase tabel 'guests' → isi form RSVP otomatis
   *   3. Jika token tidak ada tapi ada ?to=Nama → isi nama manual (mode demo/test)
   *   4. Jika tidak ada keduanya → tampilkan form manual kosong
   * ============================================================================ */
  const urlParams     = new URLSearchParams(window.location.search);
  const inviteToken   = urlParams.get('invite') || urlParams.get('token');
  const fallbackToName = urlParams.get('to');

  console.info('🔍 [NEMTAS Detail] Parameter URL:', { token: inviteToken, to: fallbackToName });

  /**
   * Mengisi elemen form RSVP dan left-pane dengan data tamu
   */
  function populateGuestUI(displayName, instansi, kategori, guestId, token) {
    // Elemen form RSVP
    const inpName  = document.getElementById('inp-name');
    const inpInst  = document.getElementById('inp-inst');
    const hiddenId = document.getElementById('rsvp-guest-id');
    const hiddenTk = document.getElementById('rsvp-token');

    if (inpName)  { inpName.value = displayName || ''; inpName.readOnly = !!guestId; }
    if (inpInst)  { inpInst.value = instansi || '';   inpInst.readOnly = !!guestId; }
    if (hiddenId) hiddenId.value = guestId || '';
    if (hiddenTk) hiddenTk.value = token || '';

    // Header identitas tamu di kotak RSVP
    const hdrName = document.getElementById('rsvp-header-name');
    const hdrInst = document.getElementById('rsvp-header-instansi');
    if (hdrName) hdrName.textContent = displayName || 'Tamu Terhormat';
    if (hdrInst) hdrInst.textContent = instansi || 'Sahabat SMKN 6 Kota Tangerang Selatan';

    // Left-pane desktop: tampilkan kotak info tamu
    const leftBox   = document.getElementById('left-pane-guest-box');
    const leftName  = document.getElementById('left-pane-guest-name');
    const leftInst  = document.getElementById('left-pane-guest-instansi');
    if (leftBox)  leftBox.style.display  = 'block';
    if (leftName) leftName.textContent   = displayName || 'Tamu Terhormat';
    if (leftInst) leftInst.textContent   = instansi || 'Sahabat SMKN 6 Kota Tangerang Selatan';

    console.info('✅ [NEMTAS Detail] Data tamu berhasil diisi ke UI:', { displayName, instansi, kategori });
  }

  /**
   * Fallback jika token tidak ditemukan di database (mode offline/demo)
   */
  function populateFallbackFromToken(token) {
    // Dekode token yang diformat: "12345-nama-tamu-xxxx" → "Nama Tamu"
    const cleaned   = token.replace(/^[0-9]+-/, '').replace(/-[a-f0-9]{4,8}$/, '').replace(/-/g, ' ');
    const titleCase = cleaned.replace(/\b\w/g, l => l.toUpperCase());
    populateGuestUI(titleCase || 'Tamu Undangan Khusus', 'Mitra SMKN 6 Kota Tangerang Selatan', 'Tamu', null, token);
  }

  /**
   * Fungsi utama: query Supabase, lalu isi UI
   */
  async function loadGuestData() {
    if (inviteToken) {
      // --- Ada token: ambil data dari Supabase ---
      if (window.supabaseClient && !window.SUPABASE_CONFIG?.isPlaceholder) {
        try {
          const { data: guest, error } = await window.supabaseClient
            .from('guests')
            .select('*')
            .eq('unique_token', inviteToken)
            .single();

          if (error || !guest) {
            console.warn('⚠️ [NEMTAS Detail] Tamu tidak ditemukan, pakai fallback token.');
            populateFallbackFromToken(inviteToken);
          } else {
            currentGuest = guest;
            populateGuestUI(guest.display_name, guest.instansi, guest.kategori, guest.id, guest.unique_token);

            // Jika tamu sudah pernah konfirmasi, tampilkan tiket langsung
            if (guest.rsvp_status && guest.rsvp_status !== 'Belum Konfirmasi') {
              renderConfirmedTicket(guest);
            }
          }
        } catch (err) {
          console.error('❌ [NEMTAS Detail] Query Supabase error:', err);
          populateFallbackFromToken(inviteToken);
        }
      } else {
        // Supabase belum dikonfigurasi → mode demo
        populateFallbackFromToken(inviteToken);
      }
    } else if (fallbackToName) {
      // --- Ada ?to=Nama: mode demo/test tanpa database ---
      const cleanName = decodeURIComponent(fallbackToName.replace(/\+/g, ' '));
      populateGuestUI(cleanName, 'Tamu Undangan Istimewa', 'Tamu Undangan', null, null);

      // Buka readonly OFF saat mode ?to= (agar bisa diinput manual untuk demo)
      const inpName = document.getElementById('inp-name');
      const inpInst = document.getElementById('inp-inst');
      if (inpName) inpName.readOnly = false;
      if (inpInst) inpInst.readOnly = false;
    } else {
      // --- Tanpa parameter apapun: form kosong bisa diisi manual ---
      const hdrName = document.getElementById('rsvp-header-name');
      if (hdrName) hdrName.textContent = 'Tamu Undangan';
      const inpName = document.getElementById('inp-name');
      const inpInst = document.getElementById('inp-inst');
      if (inpName) inpName.readOnly = false;
      if (inpInst) inpInst.readOnly = false;
    }
  }

  loadGuestData();

  /* ============================================================================
   * BLOK LOGIKA 2: MANIPULASI DOM FORM RSVP & REALTIME ATTENDANCE WALL
   * ============================================================================
   * Sub-modul:
   *   A. Radio Card Status Kehadiran (toggle .is-selected)
   *   B. Input Perwakilan (muncul/hilang kondisional)
   *   C. Submit RSVP → update Supabase → render tiket konfirmasi hijau
   *   D. Tombol Ubah Status → kembali ke form
   *   E. Live Attendance Wall dengan Supabase Realtime postgres_changes
   * ============================================================================ */

  /* ---- A. Radio Card Segmented Pilihan Status Kehadiran ---- */
  const rsvpStatusCards = document.querySelectorAll('.rsvp-status-card');
  const groupPerwakilan = document.getElementById('group-perwakilan');
  const inpRep         = document.getElementById('inp-rep');

  rsvpStatusCards.forEach(card => {
    card.addEventListener('click', function () {
      // Hapus seleksi dari semua kartu lain
      rsvpStatusCards.forEach(c => c.classList.remove('is-selected'));
      // Tandai kartu yang diklik sebagai terpilih
      this.classList.add('is-selected');

      const radio = this.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      // Tampilkan / sembunyikan input perwakilan
      const isPerwakilan = radio && radio.value === 'Perwakilan Hadir';
      if (groupPerwakilan) {
        groupPerwakilan.style.display = isPerwakilan ? 'block' : 'none';
      }
      if (inpRep) {
        inpRep.required = isPerwakilan;
        if (!isPerwakilan) inpRep.value = '';
      }
    });
  });

  /* ---- B. Render Tiket Konfirmasi (muncul setelah submit berhasil) ---- */
  function renderConfirmedTicket(guestData) {
    const ticketEl    = document.getElementById('confirmed-ticket');
    const rsvpFormEl  = document.getElementById('rsvp-form');
    const rsvpBox     = document.querySelector('.rsvp-box');

    if (!ticketEl) return;

    // Isi field-field tiket
    const tName  = document.getElementById('ticket-name');
    const tStat  = document.getElementById('ticket-status');
    const tInst  = document.getElementById('ticket-inst');
    const tPax   = document.getElementById('ticket-pax');
    const tRepRow = document.getElementById('ticket-rep-row');
    const tRep   = document.getElementById('ticket-rep');
    const tTs    = document.getElementById('ticket-ts');
    const tUcap  = document.getElementById('ticket-ucapan');

    if (tName)  tName.textContent  = guestData.display_name  || guestData.name || '—';
    if (tStat)  {
      tStat.textContent  = guestData.rsvp_status || '—';
      tStat.style.background = guestData.rsvp_status === 'Hadir' ? '#203746' :
                               guestData.rsvp_status === 'Perwakilan Hadir' ? '#35586A' :
                               guestData.rsvp_status === 'Tidak Hadir' ? '#63899A' : '#A3BBC4';
    }
    if (tInst)  tInst.textContent  = guestData.instansi || '—';
    if (tPax)   tPax.textContent   = (guestData.jumlah_hadir || 1) + ' Orang';
    if (tRepRow) tRepRow.style.display = guestData.nama_perwakilan ? 'block' : 'none';
    if (tRep)   tRep.textContent   = guestData.nama_perwakilan || '';
    if (tTs)    tTs.textContent    = guestData.rsvp_at
                                       ? new Date(guestData.rsvp_at).toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' })
                                       : new Date().toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' });
    if (tUcap)  tUcap.textContent  = guestData.ucapan || '—';

    // Tampilkan tiket, sembunyikan form
    if (rsvpFormEl) rsvpFormEl.style.display = 'none';
    ticketEl.style.display = 'block';
  }

  /* ---- C. Submit Form RSVP → Update Supabase ---- */
  const rsvpForm       = document.getElementById('rsvp-form');
  const btnRsvpSubmit  = document.getElementById('btn-rsvp-submit');
  const rsvpBtnText    = document.getElementById('rsvp-btn-text');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const guestId  = document.getElementById('rsvp-guest-id')?.value;
      const token    = document.getElementById('rsvp-token')?.value;
      const name     = document.getElementById('inp-name')?.value?.trim();
      const inst     = document.getElementById('inp-inst')?.value?.trim();
      const selPax   = document.getElementById('sel-pax')?.value;
      const ucapan   = document.getElementById('inp-ucapan')?.value?.trim();
      const repName  = document.getElementById('inp-rep')?.value?.trim();

      // Ambil status dari radio yang dicek
      const checkedRadio = rsvpForm.querySelector('input[name="status"]:checked');
      const statusVal    = checkedRadio ? checkedRadio.value : 'Hadir';

      // Validasi: jika perwakilan, nama perwakilan wajib diisi
      if (statusVal === 'Perwakilan Hadir' && !repName) {
        showToast('Mohon isi nama perwakilan yang akan hadir.', 'warning');
        if (inpRep) inpRep.focus();
        return;
      }
      if (!name) {
        showToast('Nama tamu tidak boleh kosong.', 'warning');
        return;
      }

      // Nonaktifkan tombol selama proses
      if (btnRsvpSubmit) btnRsvpSubmit.disabled = true;
      if (rsvpBtnText)  rsvpBtnText.textContent  = 'Mengirim…';

      const updatePayload = {
        rsvp_status    : statusVal,
        jumlah_hadir   : parseInt(selPax, 10) || 1,
        ucapan         : ucapan || null,
        nama_perwakilan: statusVal === 'Perwakilan Hadir' ? (repName || null) : null,
        rsvp_at        : new Date().toISOString(),
        display_name   : name,
        instansi       : inst
      };

      let savedGuest = { ...updatePayload, display_name: name, instansi: inst };

      // Update ke Supabase jika tersedia dan ada guestId
      if (window.supabaseClient && !window.SUPABASE_CONFIG?.isPlaceholder && guestId) {
        try {
          const { data, error } = await window.supabaseClient
            .from('guests')
            .update(updatePayload)
            .eq('id', guestId)
            .select()
            .single();

          if (error) {
            console.error('❌ [NEMTAS RSVP] Gagal update Supabase:', error.message);
            showToast('Gagal menyimpan ke database. Coba lagi.', 'error');
            if (btnRsvpSubmit) btnRsvpSubmit.disabled = false;
            if (rsvpBtnText)  rsvpBtnText.textContent  = 'Kirim Konfirmasi Kehadiran';
            return;
          }

          if (data) savedGuest = data;
          console.info('✅ [NEMTAS RSVP] Update Supabase berhasil:', savedGuest);
        } catch (err) {
          console.error('❌ [NEMTAS RSVP] Exception Supabase:', err);
          showToast('Koneksi bermasalah. Data disimpan lokal.', 'warning');
        }
      } else {
        console.info('ℹ️ [NEMTAS RSVP] Mode demo/offline — data tidak dikirim ke Supabase.');
      }

      showToast('Konfirmasi kehadiran berhasil dikirim! 🎉', 'success');
      renderConfirmedTicket(savedGuest);

      if (btnRsvpSubmit) btnRsvpSubmit.disabled = false;
      if (rsvpBtnText)  rsvpBtnText.textContent  = 'Kirim Konfirmasi Kehadiran';
    });
  }

  /* ---- D. Tombol Ubah Status → tampilkan kembali form ---- */
  const btnEditRsvp    = document.getElementById('btn-edit-rsvp');
  const confirmedTicket = document.getElementById('confirmed-ticket');

  if (btnEditRsvp) {
    btnEditRsvp.addEventListener('click', function () {
      if (confirmedTicket) confirmedTicket.style.display = 'none';
      if (rsvpForm)        rsvpForm.style.display        = 'block';
      showToast('Silakan ubah pilihan kehadiran Anda.', 'info');
    });
  }

  /* ---- E. Live Attendance Wall — Supabase Realtime + Initial Load ---- */
  const wallContainer = document.getElementById('wall-container');

  /**
   * Mendapatkan inisial dari nama tamu untuk avatar bulat
   */
  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Mendapatkan warna gradient avatar berdasarkan nama (deterministik)
   */
  const AVATAR_COLORS = [
    '#203746',
    '#35586A',
    '#63899A',
    '#41677D',
    '#2E4A5C',
    '#1B2E3B'
  ];
  function getAvatarGradient(name) {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = (hash + name.charCodeAt(i)) % AVATAR_COLORS.length;
    return AVATAR_COLORS[hash];
  }

  /**
   * Mendapatkan label badge status RSVP
   */
  function getStatusBadgeHtml(status) {
    const map = {
      'Hadir'            : '<span style="background:var(--slate-800);color:var(--slate-100);padding:2px 10px;border-radius:9999px;font-size:0.72rem;font-weight:700;">Hadir</span>',
      'Perwakilan Hadir' : '<span style="background:var(--slate-700);color:var(--slate-100);padding:2px 10px;border-radius:9999px;font-size:0.72rem;font-weight:700;">Perwakilan</span>',
      'Tidak Hadir'      : '<span style="background:var(--slate-100);color:var(--slate-700);border:1px solid var(--slate-300);padding:2px 10px;border-radius:9999px;font-size:0.72rem;font-weight:700;">Tidak Hadir</span>'
    };
    return map[status] || `<span style="background:var(--slate-100);color:var(--slate-700);padding:2px 10px;border-radius:9999px;font-size:0.72rem;">${status}</span>`;
  }

  /**
   * Merender satu kartu di Attendance Wall dari data tamu
   */
  function createWallCard(guest) {
    const card = document.createElement('div');
    card.className = 'wall-card';
    card.dataset.guestId = guest.id;

    const initials   = getInitials(guest.display_name);
    const gradient   = getAvatarGradient(guest.display_name);
    const statusBadge = getStatusBadgeHtml(guest.rsvp_status);
    const paxText    = guest.jumlah_hadir > 1 ? `${guest.jumlah_hadir} orang` : '1 orang';
    const rsvpTime   = guest.rsvp_at
      ? new Date(guest.rsvp_at).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
      : '—';
    const ucapanHtml = guest.ucapan
      ? `<div class="wall-ucapan">&ldquo;${guest.ucapan}&rdquo;</div>`
      : '';

    card.innerHTML = `
      <div class="wall-top-row">
        <div class="wall-avatar" style="background:${gradient};">${initials}</div>
        <div class="wall-name-row">
          <div class="wall-name">${guest.display_name || '—'}</div>
          <div class="wall-inst">${guest.instansi || 'Tamu Undangan'}</div>
        </div>
        <div>${statusBadge}</div>
      </div>
      ${ucapanHtml}
      <div class="wall-footer">
        <span>👥 ${paxText}</span>
        <span>🕐 ${rsvpTime}</span>
      </div>
    `;
    return card;
  }

  /**
   * Memuat semua data wall dari Supabase (hanya yang sudah konfirmasi)
   */
  async function loadAttendanceWall() {
    if (!wallContainer) return;

    if (!window.supabaseClient || window.SUPABASE_CONFIG?.isPlaceholder) {
      // Mode demo: tampilkan placeholder
      wallContainer.innerHTML = `
        <div style="text-align:center;padding:28px 16px;color:#94A3B8;">
          <div style="font-size:1.8rem;margin-bottom:8px;">👥</div>
          <div>Koneksikan ke Supabase untuk melihat<br>Live Attendance Wall secara realtime.</div>
        </div>`;
      return;
    }

    try {
      const { data: guests, error } = await window.supabaseClient
        .from('guests')
        .select('*')
        .neq('rsvp_status', 'Belum Konfirmasi')
        .order('rsvp_at', { ascending: false });

      if (error) throw error;

      if (!guests || guests.length === 0) {
        wallContainer.innerHTML = `
          <div style="text-align:center;padding:28px 16px;color:#94A3B8;">
            <div style="font-size:1.8rem;margin-bottom:8px;">📭</div>
            <div>Belum ada konfirmasi kehadiran.<br>Jadilah yang pertama mengkonfirmasi!</div>
          </div>`;
        return;
      }

      wallContainer.innerHTML = '';
      guests.forEach(guest => wallContainer.appendChild(createWallCard(guest)));

      console.info(`✅ [NEMTAS Wall] ${guests.length} konfirmasi dimuat dari Supabase.`);
    } catch (err) {
      console.error('❌ [NEMTAS Wall] Gagal memuat wall:', err);
      wallContainer.innerHTML = `
        <div style="text-align:center;padding:20px;color:#EF4444;">
          Gagal memuat daftar kehadiran. Silakan refresh halaman.
        </div>`;
    }
  }

  loadAttendanceWall();

  /**
   * Langganan Supabase Realtime — konfirmasi baru muncul langsung tanpa refresh
   */
  function initRealtimeWall() {
    if (!window.supabaseClient || window.SUPABASE_CONFIG?.isPlaceholder) return;

    const channel = window.supabaseClient
      .channel('public:guests-attendance')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests' },
        (payload) => {
          console.info('🔴 [NEMTAS Realtime] Event masuk:', payload.eventType, payload.new);

          const guest = payload.new;
          if (!guest || guest.rsvp_status === 'Belum Konfirmasi') return;

          // Hapus kartu lama dari guest yang sama jika ada (untuk UPDATE)
          const existing = wallContainer?.querySelector(`[data-guest-id="${guest.id}"]`);
          if (existing) existing.remove();

          // Tambahkan kartu baru di paling atas
          if (wallContainer) {
            const newCard = createWallCard(guest);
            newCard.style.animation = 'wallCardSlideIn 0.5s ease';
            wallContainer.prepend(newCard);
            showToast(`${guest.display_name} baru saja mengkonfirmasi kehadiran! 🎉`, 'success', 4000);
          }
        }
      )
      .subscribe((status) => {
        console.info('🔴 [NEMTAS Realtime] Status channel:', status);
      });
  }

  initRealtimeWall();

  /* ============================================================================
   * BLOK LOGIKA 3: KONTROL AUDIO LATAR & FLOATING MUSIC TOGGLE
   * ============================================================================
   * Musik latar dikontrol oleh modul global window.NemtasAudio (audio-player.js).
   * Di halaman detail, cek localStorage 'nemtas_music_autoplay' yang diset
   * saat tamu mengklik "Buka Undangan" di halaman cover.
   * Autoplay hanya dilakukan jika tamu sudah berinteraksi (klik tombol Buka Undangan),
   * sesuai kebijakan Autoplay Policy browser modern.
   * ============================================================================ */
  function initDetailAudio() {
    // Cek apakah bendera autoplay dari halaman cover ada
    const shouldAutoplay = localStorage.getItem('nemtas_music_autoplay') === 'true';

    if (shouldAutoplay) {
      // Hapus flag agar tidak loop autoplay saat refresh
      localStorage.removeItem('nemtas_music_autoplay');

      // Putar musik melalui modul NemtasAudio (dengan delay kecil agar DOM siap)
      setTimeout(() => {
        try {
          if (window.NemtasAudio && typeof window.NemtasAudio.play === 'function') {
            const p = window.NemtasAudio.play();
            if (p && typeof p.then === 'function') {
              p.then(() => console.info('🎵 [NEMTAS Audio] Autoplay berhasil di halaman detail.'))
               .catch(err => console.warn('⚠️ [NEMTAS Audio] Autoplay ditolak browser:', err.message));
            }
          }
        } catch (_) {}
      }, 300);
    }

    // Sinkronisasi status dari localStorage (jika pengguna sudah play sebelumnya)
    const isPlaying = localStorage.getItem('nemtas_music_playing') === 'true';
    if (isPlaying && window.NemtasAudio) {
      setTimeout(() => {
        try {
          if (typeof window.NemtasAudio.play === 'function') {
            const p = window.NemtasAudio.play();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          }
        } catch (_) {}
      }, 500);
    }
  }

  initDetailAudio();

  /* ============================================================================
   * ANIMASI KEYFRAME INLINE UNTUK WALL CARD BARU (Supabase Realtime)
   * ============================================================================ */
  if (!document.getElementById('wall-anim-style')) {
    const style = document.createElement('style');
    style.id = 'wall-anim-style';
    style.textContent = `
      @keyframes wallCardSlideIn {
        from { opacity:0; transform:translateY(-16px); }
        to   { opacity:1; transform:translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

}); // end DOMContentLoaded
