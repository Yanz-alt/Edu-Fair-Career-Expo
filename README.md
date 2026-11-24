# Edu Fair & Career Expo 2026 — SMKN 6 Kota Tangerang Selatan
## Platform Undangan Digital & Manajemen RSVP Realtime (100% Pure HTML, CSS, & Vanilla JS)

Aplikasi web undangan digital resmi kegiatan **Edu Fair dan Career Expo 2026** SMK Negeri 6 Kota Tangerang Selatan bertema:  
> *"Connecting Competence to Future: Bekerja, Melanjutkan, Berwirausaha"*  
> **Rabu, 25 November 2026 | Pukul 07.00 – 14.20 WIB**  
> Lokasi: SMKN 6 Kota Tangerang Selatan (`-6.263100, 106.666100`)

Dibangun dengan arsitektur **Zero-Build Static Architecture**: **100% HTML5, CSS3 murni, Vanilla JavaScript (ES6+)**, dan terhubung ke **Supabase** via CDN `@supabase/supabase-js@2` tanpa bundler, tanpa React, tanpa Next.js, dan tanpa Tailwind build step.

---

## 📁 Struktur File Proyek

```text
Undangan Edufair/
├── index.html                            # Halaman 1: Hero Cover & Sambutan Personal
├── detail.html                           # Halaman 2: Detail Acara, Countdown, Rundown, Maps, Galeri, RSVP & Live Wall
├── panel-admin-nemtas-77462c60.html      # Halaman Rahasia Admin (Password Gate + CRUD Tamu + WA 1-Klik)
├── assets/
│   ├── css/
│   │   └── style.css                     # Stylesheet kustom modern, responsif (360px-Desktop), glassmorphism
│   ├── js/
│   │   ├── supabase-config.js            # Konfigurasi SUPABASE_URL & SUPABASE_ANON_KEY
│   │   ├── rundown-data.js               # Objek jadwal acara window.RUNDOWN_DATA (Bebas error CORS)
│   │   ├── audio-player.js               # Kontrol audio latar melayang + fallback Web Audio API ambient synth
│   │   ├── cover.js                      # Logika Halaman 1 (?invite= / ?to=) & animasi buka undangan
│   │   ├── detail.js                     # Countdown real-time, tab rundown, maps toast, RSVP & Realtime wall
│   │   └── admin.js                      # Password gate SHA-256, statistik, CRUD, import/export CSV, WA blast
│   ├── img/                              # Folder foto galeri kegiatan (galeri-1.jpg s.d. galeri-4.jpg)
│   └── audio/                            # Folder musik latar (backsound.mp3)
├── 01_PRD_EduFair_CareerExpo_2026.md     # Spesifikasi PRD lengkap
├── 03_SUPABASE_SCHEMA_AND_SEED.sql       # Skema SQL, RLS, Realtime & seed 34 tamu
├── 04_tamuedufair_cleaned.csv            # Data tamu bersih
├── 05_rundown_edufair_2026.json          # Data rundown JSON resmi
└── README.md                             # Dokumentasi proyek ini
```

---

## 🔑 Kredensial Halaman Rahasia Admin

- **Nama File / Path**: `panel-admin-nemtas-77462c60.html`
- **Kata Sandi Akses**: `Nemtas@2026#0amULS7q`
- **Metode Proteksi**:
  - Divalidasi menggunakan algoritma **SHA-256 hash comparison** di JavaScript (`crypto.subtle`) sehingga kata sandi tidak terlihat dalam bentuk teks polos saat inspect elemen.
  - Sesi login disimpan di `sessionStorage`.
  - Dilengkapi `<meta name="robots" content="noindex, nofollow">` dan **tidak ditautkan** dari halaman publik mana pun.

---

## 🚀 Panduan Setup Supabase

1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Buka menu **SQL Editor**, salin dan jalankan seluruh isi file `03_SUPABASE_SCHEMA_AND_SEED.sql`.  
   Script ini akan:
   - Membuat tabel `public.guests` lengkap dengan indeks dan validasi check constraint.
   - Mengaktifkan **Row Level Security (RLS)** dan policy publik.
   - Mengaktifkan publikasi **Supabase Realtime** (`ALTER PUBLICATION supabase_realtime ADD TABLE public.guests;`).
   - Memasukkan seluruh data **34 tamu undangan** dari `tamuedufair.csv` lengkap dengan `unique_token`.
3. Buka menu **Project Settings -> API**:
   - Salin **Project URL**
   - Salin **`anon` `public` key**
4. Buka file `assets/js/supabase-config.js` di editor, lalu ganti nilai variabel:
   ```javascript
   const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
5. Simpan file. Aplikasi kini terhubung langsung secara realtime dengan database Supabase!

*(Catatan: Aplikasi ini juga memiliki mode demo/offline otomatis sehingga tetap dapat diuji tanpa koneksi Supabase).*

---

## 🌐 Cara Deploy

### A. Deploy ke GitHub Pages (Subpath-Safe)
1. Buat repositori baru di GitHub (misal: `edufair-nemtas-2026`).
2. Lakukan inisialisasi Git dan push seluruh folder proyek:
   ```bash
   git init
   git add .
   git commit -m "feat: digital invitation edufair 2026 SMKN 6 Tangsel"
   git branch -M main
   git remote add origin https://github.com/USERNAME/edufair-nemtas-2026.git
   git push -u origin main
   ```
3. Buka repositori di browser $\rightarrow$ **Settings** $\rightarrow$ **Pages**.
4. Pada bagian **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **`main`** / folder: **`/ (root)`**
5. Klik **Save**. Tunggu 1–2 menit hingga situs Anda aktif di:  
   `https://USERNAME.github.io/edufair-nemtas-2026/`  
   *(Seluruh tautan menggunakan path relatif sehingga tidak akan terjadi error 404 pada subpath GitHub Pages).*

### B. Deploy ke Vercel (Static)
1. Buka [Vercel Dashboard](https://vercel.com) $\rightarrow$ **Add New Project**.
2. Hubungkan dengan repositori GitHub Anda.
3. Framework Preset pilih **Other** (karena HTML/JS statis murni).
4. Klik **Deploy**. Selesai dalam hitungan detik!

---

## 🎓 Panduan Ujian Lisan ASAS Ganjil (3 Blok Kode Wajib)

Ketika penguji meminta Anda menjelaskan kode program, jelaskan ketiga blok kode berikut:

### 1. Pembacaan Parameter URL & Query Tamu (`/* === BLOK LOGIKA 1 === */`)
- **Lokasi**: `assets/js/cover.js` & `assets/js/detail.js`
- **Penjelasan**:
  Menggunakan `const params = new URLSearchParams(window.location.search)` untuk membaca parameter `?invite=<token>` atau fallback `?to=<nama>`. Jika ada token, sistem memanggil query database:
  ```javascript
  const { data: guest } = await window.supabaseClient
    .from('guests')
    .select('*')
    .eq('unique_token', token)
    .single();
  ```
  Data `display_name`, `instansi`, dan `kategori` kemudian dimanipulasi ke dalam DOM menggunakan `document.getElementById(...).textContent`. Selain itu, kolom `opened_at` langsung diperbarui saat tamu pertama kali membuka link.

### 2. Manipulasi DOM RSVP & Realtime Attendance Wall (`/* === BLOK LOGIKA 2 === */`)
- **Lokasi**: `assets/js/detail.js` & `assets/js/admin.js`
- **Penjelasan**:
  Saat form disubmit, event `e.preventDefault()` mencegah reload halaman. JavaScript membaca nilai status kehadiran, jumlah hadir, nama perwakilan, dan ucapan, lalu mengirim pembaruan ke Supabase:
  ```javascript
  await window.supabaseClient.from('guests').update(updatePayload).eq('id', guestId);
  ```
  Form kemudian digantikan oleh tiket konfirmasi hijau. Secara bersamaan, daftar kehadiran seluruh tamu diperbarui secara langsung melalui langganan **Supabase Realtime**:
  ```javascript
  window.supabaseClient
    .channel('public:guests-attendance')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, payload => {
      loadAttendanceWall();
    })
    .subscribe();
  ```

### 3. Kontrol Audio Latar & Floating Music Toggle (`/* === BLOK LOGIKA 3 === */`)
- **Lokasi**: `assets/js/audio-player.js`
- **Penjelasan**:
  Mengontrol pemutaran elemen `<audio>` menggunakan metode `.play()` dan `.pause()`. Status pemutaran disimpan di `localStorage.setItem('nemtas_music_playing', 'true')` sehingga musik tetap berjalan berkelanjutan saat tamu berpindah dari `index.html` ke `detail.html`. Tombol melayang `#floating-music-btn` memiliki animasi piringan berputar dan ripple. Jika file `assets/audio/backsound.mp3` belum ditambahkan, modul ini secara otomatis mengaktifkan **Web Audio API ambient chord synthesizer** secara lokal sehingga audio tetap berbunyi tanpa pernah mengalami error.

---

## 🎯 7 Fitur Wajib Penilaian ASAS Ganjil 2026/2027

1. ✅ **Hero Cover & Sambutan Personal (`index.html`)**: Membaca parameter URL `?invite=` / `?to=`, menampilkan badge kategori, animasi exit sampul, dan transisi ke `detail.html`.
2. ✅ **Detail Acara & Countdown Real-Time (`detail.html`)**: Menghitung mundur Hari, Jam, Menit, Detik menuju 25 November 2026 pukul 07.00 WIB, dilengkapi tombol simpan ke Google Calendar dan unduh file `.ics`.
3. ✅ **Rundown Acara Interaktif (`assets/js/rundown-data.js`)**: Navigasi tab responsif Sesi 1, Sesi 2A (Indoor), Sesi 2B (Outdoor), dan Sesi 3 bebas CORS.
4. ✅ **Lokasi Akurat SMKN 6 Tangsel & Copy Toast**: Peta Google Maps terverifikasi di Jelupang Serpong Utara (`-6.263100, 106.666100`), tombol rute, serta tombol salin alamat dan narahubung panitia dengan notifikasi Toast elegan.
5. ✅ **Galeri Foto & Scroll Reveal**: Grid 4 foto responsif dengan fallback ilustrasi SVG otomatis (`onerror`), modal lightbox foto, dan animasi kemunculan via `IntersectionObserver`.
6. ✅ **Auto-Filled RSVP & Live Shared Attendance Wall**: Form terisi otomatis sesuai token tamu, radio card status kehadiran interaktif, tiket konfirmasi, dan live shared wall yang terhubung ke Supabase Realtime.
7. ✅ **Panel Rahasia Admin (`panel-admin-nemtas-77462c60.html`)**: Password gate SHA-256, kartu statistik, pencarian & filter, CRUD tamu, import/export CSV, serta generator link dan tombol kirim WhatsApp 1-klik dengan template pesan resmi.
