/**
 * GYM LOGIC — Pure JS Functions (No DOM, No Firebase)
 * Semua business logic murni ada di sini.
 * Bisa di-import dan dipakai di semua halaman.
 */

/**
 * Menghitung selisih hari antara dua tanggal.
 * Hasilnya positif jika tanggalA lebih lama dari tanggalB.
 * @param {Date} tanggalA
 * @param {Date} tanggalB
 * @returns {number} Selisih dalam hari (bisa negatif)
 */
function hitungSelisihHari(tanggalA, tanggalB) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const a = new Date(tanggalA);
  const b = new Date(tanggalB);
  // Normalisasi ke tengah malam agar tidak terpengaruh jam
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / MS_PER_DAY);
}

/**
 * Mengecek apakah member kena denda daftar ulang saat perpanjangan.
 * Denda berlaku jika tanggalSelesai sudah terlewat LEBIH DARI 90 hari.
 *
 * @param {Date|Object} tanggalSelesai - Date object atau Firestore Timestamp
 * @param {number} thresholdHari - Batas hari (default 90)
 * @returns {{ isDenda: boolean, hariTerlambat: number, tanggalSelesaiDate: Date }}
 */
function cekDendaPerpanjangan(tanggalSelesai, thresholdHari = 90) {
  // Handle Firestore Timestamp ({ seconds, nanoseconds }) atau Date biasa
  const tanggalSelesaiDate = tanggalSelesai?.seconds
    ? new Date(tanggalSelesai.seconds * 1000)
    : new Date(tanggalSelesai);

  const sekarang = new Date();
  // Selisih positif = sudah expired, negatif = belum expired
  const hariTerlambat = hitungSelisihHari(tanggalSelesaiDate, sekarang);

  return {
    isDenda: hariTerlambat > thresholdHari,
    hariTerlambat: Math.max(0, hariTerlambat), // Tidak tampilkan negatif
    tanggalSelesaiDate
  };
}

/**
 * Menghitung total biaya perpanjangan lengkap dengan rincian.
 *
 * @param {Object} memberData - Data member dari Firestore
 * @param {Object} paketDipilih - { nama, harga, durasiBulan, ... }
 * @param {number} biayaDaftarUlang - Dari config (80000)
 * @param {number} thresholdHari - Dari config (90)
 * @returns {Object} Rincian biaya lengkap
 */
function hitungBiayaPerpanjangan(memberData, paketDipilih, biayaDaftarUlang, thresholdHari = 90) {
  const { isDenda, hariTerlambat, tanggalSelesaiDate } = cekDendaPerpanjangan(
    memberData.tanggalSelesai,
    thresholdHari
  );

  const biayaDenda = isDenda ? biayaDaftarUlang : 0;
  const totalBayar = paketDipilih.harga + biayaDenda;

  return {
    isDenda,
    hariTerlambat,
    tanggalSelesaiDate,
    hargaPaket: paketDipilih.harga,
    biayaDenda,       // 0 jika tidak kena denda, 80000 jika kena
    totalBayar,
    labelDenda: isDenda
      ? `Biaya Daftar Ulang (expired ${hariTerlambat} hari)`
      : null
  };
}

/**
 * Menghitung tanggal selesai baru berdasarkan basis tanggal + durasi bulan.
 * Aman dari bug overflow tanggal (misal: 31 Jan + 1 bulan).
 *
 * @param {Date} basisTanggal - Tanggal mulai perhitungan
 * @param {number} durasiBulan
 * @returns {Date}
 */
function hitungTanggalSelesai(basisTanggal, durasiBulan) {
  const hasil = new Date(basisTanggal);
  const targetMonth = hasil.getMonth() + durasiBulan;
  const targetYear = hasil.getFullYear() + Math.floor(targetMonth / 12);
  const finalMonth = targetMonth % 12;

  hasil.setFullYear(targetYear);
  hasil.setMonth(finalMonth);

  // Cegah overflow: misal 31 Jan + 1 bulan → 28/29 Feb, bukan 3 Mar
  const lastDayOfTargetMonth = new Date(targetYear, finalMonth + 1, 0).getDate();
  hasil.setDate(Math.min(basisTanggal.getDate(), lastDayOfTargetMonth));

  return hasil;
}

/**
 * Memvalidasi apakah waktu check-in sesuai jam operasional gender member.
 *
 * @param {string} gender - "female" | "male"
 * @param {{ buka: number, tutup: number }} jamOperasional - Jam dalam format 24h integer
 * @param {Date} waktuCheckin - Default: sekarang
 * @returns {{ isValid: boolean, pesan: string|null }}
 */
function validasiJamCheckin(gender, jamOperasional, waktuCheckin = new Date()) {
  const jam = waktuCheckin.getHours();
  const menit = waktuCheckin.getMinutes();
  const waktuDesimal = jam + menit / 60;

  const { buka, tutup } = jamOperasional;
  let isValid = false;

  if (tutup > buka) {
    // Normal range: misal 05:00 - 20:00
    isValid = waktuDesimal >= buka && waktuDesimal < tutup;
  } else {
    // Melewati tengah malam: misal 20:00 - 24:00
    isValid = waktuDesimal >= buka;
  }

  if (isValid) return { isValid: true, pesan: null };

  const pad = (n) => String(n % 24).padStart(2, "0");
  const labelGender = gender === "female" ? "Akhwat" : "Ikhwan";
  const jamSekarang = waktuCheckin.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return {
    isValid: false,
    pesan: `Check-in ditolak. Jam operasional ${labelGender}: ${pad(buka)}:00 – ${pad(tutup)}:00. Sekarang pukul ${jamSekarang}.`
  };
}

/**
 * Format angka ke format Rupiah.
 * @param {number} angka
 * @returns {string}
 */
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(angka);
}

/**
 * Format Firestore Timestamp atau Date ke string tanggal Indonesia.
 * @param {Object|Date} timestamp
 * @returns {string}
 */
function formatTanggal(timestamp) {
  if (!timestamp) return "-";
  const date = timestamp?.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
