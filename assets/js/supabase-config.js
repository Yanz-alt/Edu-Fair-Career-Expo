/**
 * ==============================================================================
 * KONFIGURASI SUPABASE CLIENT CDN - NEMTAS EDU FAIR & CAREER EXPO 2026
 * SMK Negeri 6 Kota Tangerang Selatan
 * ==============================================================================
 * Petunjuk untuk Siswa / Pengembang:
 * 1. Buka dashboard proyek Supabase Anda: https://supabase.com/dashboard
 * 2. Masuk ke Project Settings -> API
 * 3. Salin Project URL ke dalam variabel SUPABASE_URL di bawah ini.
 * 4. Salin anon public API key ke dalam variabel SUPABASE_ANON_KEY di bawah ini.
 * 5. Anon key aman ditaruh di sisi klien karena dibatasi oleh Row Level Security (RLS).
 * ==============================================================================
 */

// GANTI DENGAN KREDENSIAL PROYEK SUPABASE ANDA:
const SUPABASE_URL = 'https://wkjlbjknzvxukvgoflel.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PA2Sc_xj5RZLGGO5Zva0Ag_p2gTjAzu';

// Flag pengecekan apakah kredensial masih default placeholder
const isPlaceholderKey = !SUPABASE_URL || SUPABASE_URL.includes('xyzcompanyproject') || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('dummy_anon_key');

// Inisialisasi Supabase Client Global
let supabaseClientInstance = null;

try {
  if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    supabaseClientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    console.info('✅ [NEMTAS Supabase] Client berhasil diinisialisasi dari CDN.');
  } else {
    console.warn('⚠️ [NEMTAS Supabase] Library Supabase CDN belum termuat.');
  }
} catch (err) {
  console.error('❌ [NEMTAS Supabase] Gagal menginisialisasi client:', err);
}

// Pasang ke window scope agar dapat diakses dari cover.js, detail.js, dan admin.js
window.SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isPlaceholder: isPlaceholderKey
};
window.supabaseClient = supabaseClientInstance;
