/**
 * GYM CONFIG — Single Source of Truth
 * Semua konstanta harga, jam operasional, dan paket ada di sini.
 * Edit file ini jika ada perubahan harga atau aturan bisnis.
 */
const GYM_CONFIG = {
  shared: {
    biayaDaftarBaru: 75000,
    biayaDaftarUlang: 75000,
    dendaThresholdHari: 0,  // Denda berlaku langsung jika expired (0 hari grace period)
    firebaseConfig: {
      apiKey: "AIzaSyBJsVSa2KVdB7w3A-5c9i5MqcpdaqZ_lqQ",
      authDomain: "vinca-gym-website.firebaseapp.com",
      projectId: "vinca-gym-website",
      storageBucket: "vinca-gym-website.firebasestorage.app",
      messagingSenderId: "430179505282",
      appId: "1:430179505282:web:e7128a258fb64cebcb109b",
      measurementId: "G-5KVHK8RPK9"
    },
    whatsappNumber: "6285782919391",
    rekeningBCA: "4060622839",
    rekeningNama: "RIMA RIZKY AMELIA"
  },

  akhwat: {
    gymType: "akhwat",
    gender: "female",
    label: "Gym Akhwat",
    operasionalJam: { buka: 5, tutup: 20 }, // 05:00 - 20:00
    memberCodePrefix: "VG",                  // Legacy: VG-S0001
    counterKeyPrefix: "",                    // Legacy counter keys: silver, gold, platinum
    paket: {
      silver:   { nama: "Silver (1 Bulan)",    harga: 175000,  prefix: "S", durasiBulan: 1  },
      gold:     { nama: "Gold (6 Bulan)",       harga: 900000,  prefix: "G", durasiBulan: 6  },
      platinum: { nama: "Platinum (12 Bulan)",  harga: 1500000, prefix: "P", durasiBulan: 12 }
    },
    paketPT: {
      pt1:  { nama: "Personal Trainer 1 Sesi",  harga: 100000  },
      pt4:  { nama: "Personal Trainer 4 Sesi",  harga: 375000  },
      pt8:  { nama: "Personal Trainer 8 Sesi",  harga: 750000  },
      pt12: { nama: "Personal Trainer 12 Sesi", harga: 1100000 }
    },
    visitHarian: 50000
  },

  ikhwan: {
    gymType: "ikhwan",
    gender: "male",
    label: "Gym Ikhwan",
    operasionalJam: { buka: 20, tutup: 24 }, // 20:00 - 00:00
    memberCodePrefix: "VGI",                 // VGI-S0001
    counterKeyPrefix: "ikhwan_",             // Counter keys: ikhwan_silver, dll
    paket: {
      silver:   { nama: "Silver (1 Bulan)",    harga: 175000,  prefix: "S", durasiBulan: 1  },
      gold:     { nama: "Gold (6 Bulan)",       harga: 900000,  prefix: "G", durasiBulan: 6  },
      platinum: { nama: "Platinum (12 Bulan)",  harga: 1500000, prefix: "P", durasiBulan: 12 }
    },
    visitHarian: 50000
  }
};
