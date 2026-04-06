/**
 * pt-modal.js — Personal Trainer Modal Logic
 * File ini menangani semua interaksi modal pemesanan PT di akhwat/index.html
 */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc }
  from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Reuse existing Firebase app jika sudah diinit, hindari duplicate app error
const firebaseConfig = {
  apiKey: "AIzaSyBJsVSa2KVdB7w3A-5c9i5MqcpdaqZ_lqQ",
  authDomain: "vinca-gym-website.firebaseapp.com",
  projectId: "vinca-gym-website",
  storageBucket: "vinca-gym-website.firebasestorage.app",
  messagingSenderId: "430179505282",
  appId: "1:430179505282:web:e7128a258fb64cebcb109b"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── State ──────────────────────────────────────────────────────────────────
let ptPaketAktif = { nama: '', harga: 0 };

// ── Helpers ────────────────────────────────────────────────────────────────
function formatRupiahPT(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(angka);
}

// ── Modal open/close ───────────────────────────────────────────────────────
function tutupPTModal() {
  const modal = document.getElementById('pt-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  modal.style.pointerEvents = 'none';
}

function bukaPTModal(namaPaket, harga) {
  ptPaketAktif = { nama: namaPaket, harga };
  document.getElementById('pt-modal-paket-label').textContent = namaPaket;
  document.getElementById('pt-modal-paket-nama').textContent  = namaPaket;
  document.getElementById('pt-modal-paket-harga').textContent = formatRupiahPT(harga);
  document.getElementById('pt-kode-member').value = '';
  document.getElementById('pt-error').classList.add('hidden');

  const modal = document.getElementById('pt-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  modal.style.pointerEvents = 'auto';
  setTimeout(() => document.getElementById('pt-kode-member').focus(), 100);
}

// Expose ke global agar bisa dipanggil dari onclick di HTML
window.bukaPTModal  = bukaPTModal;
window.tutupPTModal = tutupPTModal;

// ── Event listeners ────────────────────────────────────────────────────────
document.getElementById('pt-modal-close').addEventListener('click', tutupPTModal);

document.getElementById('pt-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('pt-modal')) tutupPTModal();
});

document.getElementById('pt-submit-btn').addEventListener('click', async () => {
  const kode    = document.getElementById('pt-kode-member').value.trim().toUpperCase();
  const errEl   = document.getElementById('pt-error');
  const btnText = document.getElementById('pt-submit-text');
  const spinner = document.getElementById('pt-submit-spinner');
  const icon    = document.getElementById('pt-submit-icon');
  const btn     = document.getElementById('pt-submit-btn');

  errEl.classList.add('hidden');

  if (!kode) {
    errEl.textContent = 'Silakan masukkan No. Member Anda.';
    errEl.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btnText.textContent = 'Memproses...';
  icon.classList.add('hidden');
  spinner.classList.remove('hidden');

  try {
    // Validasi kode member
    const q    = query(collection(db, 'pendaftaran_member'), where('kodePendaftaran', '==', kode));
    const snap = await getDocs(q);

    if (snap.empty) {
      errEl.textContent = 'No. Member tidak ditemukan. Pastikan kode sudah benar.';
      errEl.classList.remove('hidden');
      btn.disabled = false;
      btnText.textContent = 'Konfirmasi & Lanjut ke WhatsApp';
      icon.classList.remove('hidden');
      spinner.classList.add('hidden');
      return;
    }

    const memberData = snap.docs[0].data();

    // Simpan transaksi ke Firestore
    await addDoc(collection(db, 'transaksi_pt'), {
      kodePendaftaran:  kode,
      namaMember:       memberData.nama,
      paketPT:          ptPaketAktif.nama,
      harga:            ptPaketAktif.harga,
      tanggalTransaksi: new Date(),
      statusPembayaran: false
    });

    // Redirect ke WhatsApp
    const waMsg = encodeURIComponent(
      `Bismillah Vinca Gym, saya ${memberData.nama} (No. Member: ${kode}) ` +
      `ingin memesan sesi ${ptPaketAktif.nama} seharga ${formatRupiahPT(ptPaketAktif.harga)}. ` +
      `Mohon konfirmasi jadwal. Barakallahu fiik.`
    );
    tutupPTModal();
    window.open(`https://wa.me/6285782919391?text=${waMsg}`, '_blank');

  } catch (err) {
    console.error('PT transaction error:', err);
    errEl.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btnText.textContent = 'Konfirmasi & Lanjut ke WhatsApp';
    icon.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
});
