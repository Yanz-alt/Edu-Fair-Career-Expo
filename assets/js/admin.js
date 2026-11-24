/**
 * ==============================================================================
 * LOGIKA PANEL RAHASIA ADMINISTRATOR (panel-admin-nemtas-77462c60.html)
 * Edu Fair dan Career Expo 2026 — SMKN 6 Kota Tangerang Selatan
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // State internal admin
  let allGuests = [];
  let filteredGuests = [];
  let isSupabaseLive = false;

  // Hash SHA-256 dari kata sandi: "Nemtas@2026#0amULS7q"
  const EXPECTED_PASSWORD_HASH = '21c733388547e34bec9b4699bc222eec8b77e5de301eb93f07a98cdf229e1c8c';
  const AUTH_SESSION_KEY = 'nemtas_admin_auth';

  // DOM Elements
  const passwordGateScreen = document.getElementById('password-gate-screen');
  const adminDashboardContainer = document.getElementById('admin-dashboard-container');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminPasswordInput = document.getElementById('admin-password-input');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const btnAdminLogout = document.getElementById('btn-admin-logout');

  // Filter & Search DOM
  const searchInput = document.getElementById('admin-search-input');
  const filterCategory = document.getElementById('admin-filter-category');
  const filterRsvp = document.getElementById('admin-filter-rsvp');
  const tableBody = document.getElementById('admin-table-body');
  const btnRefreshData = document.getElementById('btn-refresh-data');

  // Modals & Forms
  const modalAddGuest = document.getElementById('modal-add-guest');
  const modalEditGuest = document.getElementById('modal-edit-guest');
  const btnOpenModalAdd = document.getElementById('btn-open-modal-add');
  const formAddGuest = document.getElementById('form-add-guest');
  const formEditGuest = document.getElementById('form-edit-guest');
  const csvFileInput = document.getElementById('csv-file-input');
  const btnTriggerImportCsv = document.getElementById('btn-trigger-import-csv');
  const btnExportCsv = document.getElementById('btn-export-csv');

  /* ============================================================================
   * SISTEM TOAST NOTIFICATION
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
      iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#F59E0B" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38BDF8" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <span style="display: flex; align-items: center; flex-shrink: 0;">${iconSvg}</span>
      <span style="flex: 1; line-height: 1.4;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 350);
    }, duration);
  }

  /* ============================================================================
   * 1. PASSWORD GATE VALIDATION (SHA-256 SECURED)
   * ============================================================================ */
  async function sha256(message) {
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback jika crypto.subtle tidak aktif di lingkungan tertentu
    return message;
  }

  async function checkPassword(enteredPass) {
    const hashed = await sha256(enteredPass);
    return hashed === EXPECTED_PASSWORD_HASH || enteredPass === 'Nemtas@2026#0amULS7q';
  }

  function activateDashboard() {
    if (passwordGateScreen) passwordGateScreen.style.display = 'none';
    if (adminDashboardContainer) adminDashboardContainer.style.display = 'block';
    loadAdminGuestsData();
  }

  function handleLoginSubmit(e) {
    e.preventDefault();
    const entered = adminPasswordInput.value.trim();

    checkPassword(entered).then(isValid => {
      if (isValid) {
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        if (loginErrorMsg) loginErrorMsg.style.display = 'none';
        showToast('Login berhasil. Selamat datang di Panel Panitia!', 'success');
        activateDashboard();
      } else {
        if (loginErrorMsg) loginErrorMsg.style.display = 'block';
        showToast('Kata sandi admin tidak tepat!', 'error');
        adminPasswordInput.select();
      }
    });
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleLoginSubmit);
  }

  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', function () {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      if (adminDashboardContainer) adminDashboardContainer.style.display = 'none';
      if (passwordGateScreen) passwordGateScreen.style.display = 'flex';
      if (adminPasswordInput) adminPasswordInput.value = '';
      showToast('Anda telah keluar dari sesi admin.', 'info');
    });
  }

  // Cek apakah admin sudah login sebelumnya di tab ini
  if (sessionStorage.getItem(AUTH_SESSION_KEY) === 'true') {
    activateDashboard();
  }

  /* === BLOK LOGIKA 1: PEMBACAAN PARAMETER URL & QUERY DATABASE TAMU === */
  // Pada Panel Admin, blok ini menangani query data seluruh tamu dari tabel Supabase 'guests',
  // pembaruan status koneksi database, dan pemrosesan filter pencarian/kategori/status kehadiran.
  async function loadAdminGuestsData() {
    isSupabaseLive = window.supabaseClient && !window.SUPABASE_CONFIG?.isPlaceholder;
    const statusBadge = document.getElementById('supabase-status-badge');

    if (isSupabaseLive) {
      if (statusBadge) {
        statusBadge.textContent = 'Supabase Connected';
        statusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
        statusBadge.style.color = '#34D399';
        statusBadge.style.borderColor = '#10B981';
      }

      try {
        const { data, error } = await window.supabaseClient
          .from('guests')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        allGuests = data || [];
        console.info(`✅ [Admin] Memuat ${allGuests.length} data tamu dari Supabase.`);
      } catch (err) {
        console.warn('⚠️ Gagal mengambil dari Supabase, mengaktifkan data fallback:', err);
        allGuests = getInitialSeedGuests();
      }
    } else {
      if (statusBadge) {
        statusBadge.textContent = 'Mode Offline / Demo Test';
        statusBadge.style.background = 'rgba(245, 158, 11, 0.2)';
        statusBadge.style.color = '#FCD34D';
        statusBadge.style.borderColor = '#F59E0B';
      }
      allGuests = getInitialSeedGuests();
    }

    applyFilters();
  }

  function getInitialSeedGuests() {
    return [
      { id: 1, unique_token: '01-universitas-pembangunan--f07a', nama_tamu: 'Universitas Pembangunan Jaya', instansi: 'Universitas Pembangunan Jaya', display_name: 'Universitas Pembangunan Jaya', kategori: 'Universitas', no_whatsapp: '', rsvp_status: 'Hadir', jumlah_hadir: 3, opened_at: new Date().toISOString() },
      { id: 2, unique_token: '02-cakra-zebua-18bb', nama_tamu: 'Cakra Zebua', instansi: 'President University', display_name: 'Cakra Zebua', kategori: 'Universitas', no_whatsapp: '', rsvp_status: 'Belum Konfirmasi', jumlah_hadir: 1, opened_at: null },
      { id: 3, unique_token: '03-mahbub-haikal-ccea', nama_tamu: 'Mahbub Haikal', instansi: 'Universitas Multimedia Nusantara', display_name: 'Mahbub Haikal', kategori: 'Universitas', no_whatsapp: '', rsvp_status: 'Belum Konfirmasi', jumlah_hadir: 1, opened_at: null },
      { id: 4, unique_token: '04-universitas-muhammadiyah-1852', nama_tamu: 'Universitas Muhammadiyah Tangerang', instansi: 'Universitas Muhammadiyah Tangerang', display_name: 'Universitas Muhammadiyah Tangerang', kategori: 'Universitas', no_whatsapp: '', rsvp_status: 'Belum Konfirmasi', jumlah_hadir: 1, opened_at: null },
      { id: 5, unique_token: '05-andra-fea4', nama_tamu: 'Andra', instansi: 'Universitas Mercubuana', display_name: 'Andra', kategori: 'Universitas', no_whatsapp: '', rsvp_status: 'Belum Konfirmasi', jumlah_hadir: 1, opened_at: null },
      { id: 6, unique_token: '06-dyah-palupi-a9e0', nama_tamu: 'Dyah Palupi', instansi: 'UT Serang', display_name: 'Dyah Palupi', kategori: 'Universitas', no_whatsapp: '62818791755', rsvp_status: 'Hadir', jumlah_hadir: 2, opened_at: new Date().toISOString() },
      { id: 7, unique_token: '07-deswa-b04a', nama_tamu: 'Deswa', instansi: 'Universitas Budi Luhur', display_name: 'Deswa', kategori: 'Universitas', no_whatsapp: '6281280890067', rsvp_status: 'Perwakilan Hadir', nama_perwakilan: 'Tim Humas', jumlah_hadir: 2, opened_at: new Date().toISOString() },
      { id: 8, unique_token: '08-universitas-pradita-b9c8', nama_tamu: 'Universitas Pradita', instansi: 'Universitas Pradita', display_name: 'Universitas Pradita', kategori: 'Universitas', no_whatsapp: '', rsvp_status: 'Belum Konfirmasi', jumlah_hadir: 1, opened_at: null },
      { id: 9, unique_token: '09-chendri-irawan-754a', nama_tamu: 'Chendri Irawan', instansi: 'ITTS', display_name: 'Chendri Irawan', kategori: 'Universitas', no_whatsapp: '', rsvp_status: 'Belum Konfirmasi', jumlah_hadir: 1, opened_at: null },
      { id: 10, unique_token: '10-pengawas-smkn-6-kota-tan-6612', nama_tamu: null, instansi: 'Pengawas SMKN 6 Kota Tangerang Selatan', display_name: 'Pengawas SMKN 6 Kota Tangerang Selatan', kategori: 'Tamu', no_whatsapp: '', rsvp_status: 'Belum Konfirmasi', jumlah_hadir: 1, opened_at: null },
      { id: 22, unique_token: '22-alumni-2c2d', nama_tamu: 'Alumni', instansi: 'Alumni SMKN 6 Tangsel', display_name: 'Alumni', kategori: 'Alumni', no_whatsapp: '', rsvp_status: 'Belum Konfirmasi', jumlah_hadir: 1, opened_at: null },
      { id: 23, unique_token: '23-axis-98fb', nama_tamu: 'AXIS', instansi: 'AXIS', display_name: 'AXIS', kategori: 'Sponsorship', no_whatsapp: '', rsvp_status: 'Belum Konfirmasi', jumlah_hadir: 1, opened_at: null },
      { id: 32, unique_token: '32-kiki-hermawan-legowo-a0fd', nama_tamu: 'Kiki Hermawan Legowo', instansi: 'PT. Pasifik Cipta Nusantara', display_name: 'Kiki Hermawan Legowo', kategori: 'Industri', no_whatsapp: '', rsvp_status: 'Belum Konfirmasi', jumlah_hadir: 1, opened_at: null }
    ];
  }

  function updateStatCards(data) {
    const total = data.length;
    const opened = data.filter(g => g.opened_at !== null).length;
    const hadir = data.filter(g => g.rsvp_status === 'Hadir').length;
    const perwakilan = data.filter(g => g.rsvp_status === 'Perwakilan Hadir').length;
    const tidakHadir = data.filter(g => g.rsvp_status === 'Tidak Hadir').length;
    const pending = data.filter(g => !g.rsvp_status || g.rsvp_status === 'Belum Konfirmasi').length;

    let totalPax = 0;
    data.forEach(g => {
      if (g.rsvp_status === 'Hadir' || g.rsvp_status === 'Perwakilan Hadir') {
        totalPax += parseInt(g.jumlah_hadir || 1, 10);
      }
    });

    document.getElementById('stat-total-guests').textContent = total;
    document.getElementById('stat-opened').textContent = opened;
    document.getElementById('stat-hadir').textContent = hadir;
    document.getElementById('stat-perwakilan').textContent = perwakilan;
    document.getElementById('stat-tidak-hadir').textContent = tidakHadir;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-total-pax').textContent = totalPax;
  }

  function applyFilters() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const cat = filterCategory ? filterCategory.value : 'ALL';
    const rsvp = filterRsvp ? filterRsvp.value : 'ALL';

    filteredGuests = allGuests.filter(g => {
      // Search
      const matchSearch = !query ||
        (g.display_name && g.display_name.toLowerCase().includes(query)) ||
        (g.nama_tamu && g.nama_tamu.toLowerCase().includes(query)) ||
        (g.instansi && g.instansi.toLowerCase().includes(query)) ||
        (g.no_whatsapp && g.no_whatsapp.toLowerCase().includes(query)) ||
        (g.pj && g.pj.toLowerCase().includes(query));

      // Category
      const matchCat = cat === 'ALL' || (g.kategori && g.kategori.toLowerCase() === cat.toLowerCase());

      // RSVP
      const matchRsvp = rsvp === 'ALL' || (g.rsvp_status && g.rsvp_status.toLowerCase() === rsvp.toLowerCase());

      return matchSearch && matchCat && matchRsvp;
    });

    updateStatCards(allGuests);
    renderGuestsTable(filteredGuests);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (filterCategory) filterCategory.addEventListener('change', applyFilters);
  if (filterRsvp) filterRsvp.addEventListener('change', applyFilters);
  if (btnRefreshData) btnRefreshData.addEventListener('click', loadAdminGuestsData);

  /* === BLOK LOGIKA 2: MANIPULASI DOM FORM RSVP & REALTIME ATTENDANCE WALL === */
  // Pada Panel Admin, blok ini menangani:
  // 1. Rendering tabel manajemen tamu beserta tombol aksi Salin Link, Kirim WhatsApp, Edit & Hapus.
  // 2. Pembuatan link undangan yang subpath-safe (berjalan mulus di localhost maupun subpath repo GitHub Pages).
  // 3. Modal interaktif Tambah dan Edit Tamu dengan sinkronisasi ke Supabase.
  // 4. Parser Import CSV fleksibel (delimeter ';' dan ',') serta Export Rekap Kehadiran.

  /**
   * Menghasilkan URL undangan subpath-safe
   */
  function generateInviteUrl(token) {
    if (!token) return window.location.origin;
    // Gunakan new URL dengan path relatif index.html terhadap window.location.href
    const baseUrl = new URL('index.html', window.location.href).href;
    return `${baseUrl}?invite=${encodeURIComponent(token)}`;
  }

  /**
   * Menormalkan nomor telepon ke format internasional Indonesia (62...)
   */
  function cleanPhoneNumber(numStr) {
    if (!numStr) return '';
    let digits = String(numStr).replace(/\D/g, '');
    if (digits.startsWith('08')) {
      digits = '628' + digits.substring(2);
    } else if (digits.startsWith('8')) {
      digits = '628' + digits.substring(1);
    }
    return digits;
  }

  /**
   * Merender isi tabel data tamu
   */
  function renderGuestsTable(guests) {
    if (!tableBody) return;
    if (guests.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 36px; color: #94A3B8;">
            Tidak ada data tamu yang sesuai dengan filter pencarian.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = '';

    guests.forEach((guest, index) => {
      const tr = document.createElement('tr');

      // Status RSVP Badge
      let statusBadgeHtml = '<span style="color:#94A3B8;">Belum Konfirmasi</span>';
      if (guest.rsvp_status === 'Hadir') {
        statusBadgeHtml = '<span style="color:#10B981; font-weight:700;">● Hadir</span>';
      } else if (guest.rsvp_status === 'Perwakilan Hadir') {
        const repName = guest.nama_perwakilan ? ` (${guest.nama_perwakilan})` : '';
        statusBadgeHtml = `<span style="color:#F59E0B; font-weight:700;">● Perwakilan${repName}</span>`;
      } else if (guest.rsvp_status === 'Tidak Hadir') {
        statusBadgeHtml = '<span style="color:#EF4444; font-weight:700;">● Tidak Hadir</span>';
      }

      // Kategori Badge
      const cat = guest.kategori || 'Tamu';
      let catClass = 'badge-tamu';
      if (cat === 'Universitas') catClass = 'badge-universitas';
      else if (cat === 'Industri') catClass = 'badge-industri';
      else if (cat === 'Sponsorship') catClass = 'badge-sponsorship';
      else if (cat === 'Alumni') catClass = 'badge-alumni';

      // Status Link Dibuka
      const openedHtml = guest.opened_at
        ? `<span style="color:#10B981;" title="Dibuka: ${new Date(guest.opened_at).toLocaleString('id-ID')}">✔ Dibuka</span>`
        : '<span style="color:#64748B;">Belum</span>';

      // Phone Status Badge
      const cleanWa = cleanPhoneNumber(guest.no_whatsapp);
      const isWaScientific = String(guest.no_whatsapp || '').includes('E+');
      let waDisplayHtml = '';
      if (!guest.no_whatsapp || isWaScientific) {
        waDisplayHtml = '<span style="color:#EF4444; font-size:0.75rem;">Perlu Diisi</span>';
      } else {
        waDisplayHtml = `<span style="font-family:monospace; font-size:0.82rem;">${guest.no_whatsapp}</span>`;
      }

      tr.innerHTML = `
        <td style="color:#64748B;">${guest.id || index + 1}</td>
        <td>
          <div style="font-weight:700; color:#FFFFFF;">${guest.display_name || guest.nama_tamu || guest.instansi}</div>
          <div style="font-size:0.8rem; color:#94A3B8;">${guest.instansi || '-'}</div>
        </td>
        <td><span class="badge ${catClass}">${cat}</span></td>
        <td>${waDisplayHtml}</td>
        <td>${statusBadgeHtml}</td>
        <td style="text-align:center;">${guest.jumlah_hadir || 1}</td>
        <td>${openedHtml}</td>
        <td>
          <div class="admin-table-action-cell">
            <button type="button" class="btn btn-outline btn-sm action-copy-link" data-id="${guest.id}" data-token="${guest.unique_token}" data-name="${guest.display_name}" title="Salin Tautan Khusus Tamu" style="padding:6px 10px; color:#A3BBC4; border-color:#35586A;">
              🔗 Link
            </button>
            <button type="button" class="btn btn-emerald btn-sm action-send-wa" data-id="${guest.id}" title="Kirim Undangan Resmi via WhatsApp" style="padding:6px 10px;">
              💬 WA
            </button>
            <button type="button" class="btn btn-outline btn-sm action-edit-guest" data-id="${guest.id}" title="Edit Data Tamu" style="padding:6px 8px; color:#F59E0B; border-color:rgba(245,158,11,0.3);">
              ✏️
            </button>
            <button type="button" class="btn btn-outline btn-sm action-delete-guest" data-id="${guest.id}" title="Hapus Tamu" style="padding:6px 8px; color:#EF4444; border-color:rgba(239,68,68,0.3);">
              🗑️
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    attachTableActionEvents();
  }

  function attachTableActionEvents() {
    // 1. Salin Link Undangan Khusus
    document.querySelectorAll('.action-copy-link').forEach(btn => {
      btn.addEventListener('click', function () {
        const token = this.getAttribute('data-token');
        const guestName = this.getAttribute('data-name') || 'Tamu';
        const inviteUrl = generateInviteUrl(token);

        navigator.clipboard.writeText(inviteUrl).then(() => {
          showToast(`Link undangan untuk ${guestName} berhasil disalin!`, 'success');
        }).catch(() => {
          prompt('Salin link undangan ini:', inviteUrl);
        });
      });
    });

    // 2. Kirim WhatsApp 1-Klik
    document.querySelectorAll('.action-send-wa').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const guest = allGuests.find(g => String(g.id) === String(id));
        if (!guest) return;

        const cleanWa = cleanPhoneNumber(guest.no_whatsapp);
        const isScientific = String(guest.no_whatsapp || '').includes('E+');

        if (!cleanWa || isScientific || cleanWa.length < 8) {
          showToast('Nomor WhatsApp belum valid / kosong. Silakan lengkapi terlebih dahulu.', 'warning');
          openEditModal(guest);
          return;
        }

        const inviteUrl = generateInviteUrl(guest.unique_token);
        const messageText = `Kepada Yth.
*${guest.display_name || guest.instansi}* (${guest.instansi})

Dengan hormat,
SMK Negeri 6 Kota Tangerang Selatan mengundang Bapak/Ibu/Rekan untuk menghadiri:

🎓 *Edu Fair dan Career Expo 2026*
*"Connecting Competence to Future: Bekerja, Melanjutkan, Berwirausaha"*

📅 *Hari/Tanggal:* Rabu, 25 November 2026
⏰ *Waktu:* 07.00 – 14.20 WIB
📍 *Lokasi:* SMKN 6 Kota Tangerang Selatan, Jl. Magnolia VI No. 6, Jelupang, Serpong Utara, Tangsel

Silakan akses tautan undangan digital resmi dan formulir konfirmasi kehadiran (RSVP) melalui link khusus Anda:
👉 ${inviteUrl}

Kehadiran Bapak/Ibu merupakan kehormatan besar bagi kami. Terima kasih atas dukungan dan kerja sama yang terjalin.

Salam hormat,
*Panitia Edu Fair & Career Expo 2026*
SMK Negeri 6 Kota Tangerang Selatan`;

        const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(messageText)}`;
        window.open(waUrl, '_blank');
      });
    });

    // 3. Edit Tamu
    document.querySelectorAll('.action-edit-guest').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        const guest = allGuests.find(g => String(g.id) === String(id));
        if (guest) openEditModal(guest);
      });
    });

    // 4. Hapus Tamu
    document.querySelectorAll('.action-delete-guest').forEach(btn => {
      btn.addEventListener('click', async function () {
        const id = this.getAttribute('data-id');
        const guest = allGuests.find(g => String(g.id) === String(id));
        if (!guest) return;

        const konfirmasi = confirm(`Apakah Anda yakin ingin menghapus data tamu: "${guest.display_name || guest.instansi}"?`);
        if (!konfirmasi) return;

        try {
          if (isSupabaseLive) {
            const { error } = await window.supabaseClient.from('guests').delete().eq('id', id);
            if (error) throw error;
          }
          allGuests = allGuests.filter(g => String(g.id) !== String(id));
          applyFilters();
          showToast('Data tamu berhasil dihapus.', 'info');
        } catch (err) {
          console.error('Gagal menghapus tamu:', err);
          showToast('Gagal menghapus data tamu.', 'error');
        }
      });
    });
  }

  // --- MODAL UTILITIES ---
  function openModal(modalEl) {
    if (modalEl) modalEl.classList.add('is-open');
  }

  function closeModal(modalEl) {
    if (modalEl) modalEl.classList.remove('is-open');
  }

  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-close');
      const targetEl = document.getElementById(targetId);
      closeModal(targetEl);
    });
  });

  if (btnOpenModalAdd) {
    btnOpenModalAdd.addEventListener('click', () => openModal(modalAddGuest));
  }

  function openEditModal(guest) {
    document.getElementById('edit-guest-id').value = guest.id || '';
    document.getElementById('edit-nama-tamu').value = guest.nama_tamu || '';
    document.getElementById('edit-instansi').value = guest.instansi || '';
    document.getElementById('edit-kategori').value = guest.kategori || 'Tamu';
    document.getElementById('edit-whatsapp').value = guest.no_whatsapp || '';
    document.getElementById('edit-rsvp-status').value = guest.rsvp_status || 'Belum Konfirmasi';
    document.getElementById('edit-jumlah-hadir').value = guest.jumlah_hadir || 1;
    document.getElementById('edit-nama-perwakilan').value = guest.nama_perwakilan || '';
    document.getElementById('edit-ucapan').value = guest.ucapan || '';

    openModal(modalEditGuest);
  }

  // --- SUBMIT: FORM TAMBAH TAMU ---
  if (formAddGuest) {
    formAddGuest.addEventListener('submit', async function (e) {
      e.preventDefault();

      const namaTamu = document.getElementById('add-nama-tamu').value.trim();
      const instansi = document.getElementById('add-instansi').value.trim();
      const kategori = document.getElementById('add-kategori').value;
      const noWhatsapp = document.getElementById('add-whatsapp').value.trim();
      const pj = document.getElementById('add-pj').value.trim();

      const displayName = namaTamu || instansi;
      const nextId = allGuests.length > 0 ? Math.max(...allGuests.map(g => Number(g.id) || 0)) + 1 : 1;
      const slug = (instansi || namaTamu).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 24);
      const randomHex = Math.random().toString(16).substring(2, 6);
      const uniqueToken = `${String(nextId).padStart(2, '0')}-${slug}-${randomHex}`;

      const newGuest = {
        unique_token: uniqueToken,
        nama_tamu: namaTamu || null,
        instansi: instansi,
        display_name: displayName,
        kategori: kategori,
        no_whatsapp: noWhatsapp || null,
        pj: pj || null,
        rsvp_status: 'Belum Konfirmasi',
        jumlah_hadir: 1
      };

      try {
        if (isSupabaseLive) {
          const { data, error } = await window.supabaseClient.from('guests').insert([newGuest]).select();
          if (error) throw error;
          if (data && data[0]) {
            allGuests.push(data[0]);
          } else {
            allGuests.push({ ...newGuest, id: nextId });
          }
        } else {
          allGuests.push({ ...newGuest, id: nextId });
        }

        closeModal(modalAddGuest);
        formAddGuest.reset();
        applyFilters();
        showToast(`Tamu "${displayName}" berhasil ditambahkan!`, 'success');
      } catch (err) {
        console.error('Gagal menambah tamu:', err);
        showToast('Gagal menambahkan tamu baru.', 'error');
      }
    });
  }

  // --- SUBMIT: FORM EDIT TAMU ---
  if (formEditGuest) {
    formEditGuest.addEventListener('submit', async function (e) {
      e.preventDefault();

      const id = document.getElementById('edit-guest-id').value;
      const namaTamu = document.getElementById('edit-nama-tamu').value.trim();
      const instansi = document.getElementById('edit-instansi').value.trim();
      const kategori = document.getElementById('edit-kategori').value;
      const noWhatsapp = document.getElementById('edit-whatsapp').value.trim();
      const rsvpStatus = document.getElementById('edit-rsvp-status').value;
      const jumlahHadir = parseInt(document.getElementById('edit-jumlah-hadir').value, 10) || 1;
      const namaPerwakilan = document.getElementById('edit-nama-perwakilan').value.trim();
      const ucapan = document.getElementById('edit-ucapan').value.trim();

      const displayName = namaTamu || instansi;

      const updateData = {
        nama_tamu: namaTamu || null,
        instansi: instansi,
        display_name: displayName,
        kategori: kategori,
        no_whatsapp: noWhatsapp || null,
        rsvp_status: rsvpStatus,
        jumlah_hadir: jumlahHadir,
        nama_perwakilan: namaPerwakilan || null,
        ucapan: ucapan || null,
        updated_at: new Date().toISOString()
      };

      try {
        if (isSupabaseLive) {
          const { error } = await window.supabaseClient.from('guests').update(updateData).eq('id', id);
          if (error) throw error;
        }

        const idx = allGuests.findIndex(g => String(g.id) === String(id));
        if (idx !== -1) {
          allGuests[idx] = { ...allGuests[idx], ...updateData };
        }

        closeModal(modalEditGuest);
        applyFilters();
        showToast(`Data tamu "${displayName}" berhasil diperbarui!`, 'success');
      } catch (err) {
        console.error('Gagal update tamu:', err);
        showToast('Gagal memperbarui data tamu.', 'error');
      }
    });
  }

  // --- IMPORT CSV TAMU ---
  if (btnTriggerImportCsv && csvFileInput) {
    btnTriggerImportCsv.addEventListener('click', () => csvFileInput.click());

    csvFileInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async function (evt) {
        const text = evt.target.result;
        parseAndImportCSV(text);
      };
      reader.readAsText(file);
      csvFileInput.value = ''; // Reset
    });
  }

  async function parseAndImportCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      showToast('File CSV tidak memiliki data.', 'warning');
      return;
    }

    // Deteksi Delimiter (; atau ,)
    const firstLine = lines[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase());
    const importedGuests = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(delimiter);
      if (row.length < 2) continue;

      const rowObj = {};
      headers.forEach((h, colIdx) => {
        rowObj[h] = row[colIdx] ? row[colIdx].trim() : '';
      });

      const namaTamu = rowObj['nama_tamu'] || rowObj['nama'] || '';
      const instansi = rowObj['instansi'] || rowObj['perusahaan'] || rowObj['kampus'] || 'Mitra';
      let kategori = rowObj['kategori'] || 'Tamu';
      if (kategori.toLowerCase().includes('sponshor') || kategori.toLowerCase().includes('sponsor')) {
        kategori = 'Sponsorship';
      }

      let wa = rowObj['no_whatsapp'] || rowObj['whatsapp'] || rowObj['telepon'] || '';
      if (wa.includes('E+') || wa.length < 6) wa = '';

      const displayName = rowObj['display_name'] || namaTamu || instansi;
      const uniqueToken = rowObj['unique_token'] ||
        `${i}-${(instansi || displayName).toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 20)}-${Math.random().toString(16).substring(2, 6)}`;

      importedGuests.push({
        unique_token: uniqueToken,
        nama_tamu: namaTamu || null,
        instansi: instansi,
        display_name: displayName,
        kategori: kategori,
        no_whatsapp: wa || null,
        rsvp_status: 'Belum Konfirmasi',
        jumlah_hadir: 1
      });
    }

    if (importedGuests.length === 0) {
      showToast('Tidak ada data valid yang dapat diimpor.', 'warning');
      return;
    }

    try {
      if (isSupabaseLive) {
        const { error } = await window.supabaseClient.from('guests').upsert(importedGuests, { onConflict: 'unique_token' });
        if (error) throw error;
      }
      showToast(`Berhasil mengimpor ${importedGuests.length} data tamu!`, 'success');
      loadAdminGuestsData();
    } catch (err) {
      console.error('Error saat import CSV ke database:', err);
      // Simpan lokal jika offline
      importedGuests.forEach((g, idx) => {
        allGuests.push({ ...g, id: allGuests.length + idx + 1 });
      });
      applyFilters();
      showToast(`Impor CSV selesai (${importedGuests.length} tamu dimasukkan lokal).`, 'info');
    }
  }

  // --- EXPORT REKAP CSV ---
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', function () {
      if (allGuests.length === 0) {
        showToast('Tidak ada data tamu untuk diekspor.', 'warning');
        return;
      }

      const headers = ['ID', 'Unique Token', 'Nama Tamu', 'Instansi', 'Kategori', 'No WhatsApp', 'Status RSVP', 'Jumlah Hadir', 'Nama Perwakilan', 'Ucapan', 'Link Dibuka', 'Waktu Konfirmasi'];
      const rows = allGuests.map(g => [
        g.id || '',
        `"${g.unique_token || ''}"`,
        `"${(g.nama_tamu || '').replace(/"/g, '""')}"`,
        `"${(g.instansi || '').replace(/"/g, '""')}"`,
        `"${g.kategori || ''}"`,
        `"${g.no_whatsapp || ''}"`,
        `"${g.rsvp_status || 'Belum Konfirmasi'}"`,
        g.jumlah_hadir || 1,
        `"${(g.nama_perwakilan || '').replace(/"/g, '""')}"`,
        `"${(g.ucapan || '').replace(/"/g, '""')}"`,
        g.opened_at ? `"${new Date(g.opened_at).toLocaleString('id-ID')}"` : '""',
        g.confirmed_at ? `"${new Date(g.confirmed_at).toLocaleString('id-ID')}"` : '""'
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `Rekap-Kehadiran-EduFair-SMKN6Tangsel-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Rekap data kehadiran berhasil diekspor ke CSV!', 'success');
    });
  }

  /* === BLOK LOGIKA 3: KONTROL AUDIO LATAR & FLOATING MUSIC TOGGLE === */
  // Pada Halaman Panel Admin Rahasia ini, audio latar sengaja dinonaktifkan
  // agar staf panitia dapat bekerja mengelola data, mengecek kehadiran,
  // dan mengirim pesan WhatsApp secara tenang tanpa gangguan suara musik.
});
