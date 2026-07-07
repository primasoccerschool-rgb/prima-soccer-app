import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  fetchStudents, upsertStudent, deactivateStudentRow,
  fetchAllAttendance, setAttendanceCell,
  fetchAllPayments, setPaymentCell,
  fetchRegistrations, insertRegistration, updateRegistrationStatus,
  fetchSettings, updateSettings,
} from "./data";

// ---------- Styles / tokens ----------
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@500;700&display=swap');`;

const HERO_TEAM = "https://raw.githubusercontent.com/primasoccerschool-rgb/prima-soccer-app/main/IMG_7786.jpeg";
const LOGO_CLEAN = "https://raw.githubusercontent.com/primasoccerschool-rgb/prima-soccer-app/main/IMG_7785.png";


const COLORS = {
  pitchDark: "#0B2818",
  pitch: "#163C29",
  grass: "#2D6A4F",
  chalk: "#F7F5EF",
  card: "#FFFFFF",
  gold: "#D4A24C",
  ink: "#12261C",
  inkSoft: "#4A5D53",
  red: "#C1440E",
  redSoft: "#F3D9CE",
  greenSoft: "#DCEEE2",
  orange: "#E96B24",
  orangeDark: "#B6501A",
};

// Official Prima Soccer School Indonesia age groups
const CATEGORY_BOUNDS = [
  { max: 9, label: "A" },
  { max: 12, label: "B" },
  { max: 17, label: "C" },
];

const LOCALE_CODE = { fr: "fr-FR", en: "en-US", id: "id-ID" };

const MONTH_NAMES = {
  fr: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  id: ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],
};

// ---------- i18n ----------
const STRINGS = {
  fr: {
    subtitle: "Gestion académie",
    loading: "Chargement…",
    nav: { dashboard: "Tableau de bord", players: "Joueurs", attendance: "Présences", payments: "Paiements", registrations: "Inscriptions", settings: "Paramètres" },
    adminBtn: "Espace admin",
    publicBtn: "Voir la page publique",
    backAdmin: "← Retour à l'administration",
    logoutBtn: "Se déconnecter",
    login: {
      title: "Espace administrateur",
      subtitle: "Cet espace est réservé à l'équipe de l'académie.",
      passwordLabel: "Mot de passe",
      submit: "Se connecter",
      error: "Mot de passe incorrect.",
      cancel: "Annuler",
    },
    dashboard: {
      title: "Tableau de bord", players: "Joueurs inscrits", presentToday: "Présents aujourd'hui",
      outOf: (n) => `sur ${n}`, dues: (m) => `Cotisations — ${m}`, categories: "Catégories actives",
      breakdown: "Répartition par catégorie", noPlayers: "Aucun joueur inscrit pour le moment.",
    },
    players: {
      title: "Joueurs", add: "+ Inscrire un joueur", search: "Rechercher un joueur…", all: "Toutes",
      yearsOld: "ans", upToDate: "À jour", unpaidMonth: "Impayé (mois)", edit: "Modifier", remove: "Retirer",
      noMatch: "Aucun joueur ne correspond à la recherche.",
      exportBtn: "📥 Exporter (CSV/Excel)",
      exportModalTitle: "Export des joueurs",
      exportModalHint: "Copiez ce texte, puis collez-le dans un nouveau fichier Excel ou Google Sheets : les colonnes se sépareront automatiquement.",
      copyBtn: "📋 Copier le texte",
      downloadBtn: "⬇️ Télécharger le fichier",
      shareBtn: "📤 Partager…",
      copiedMsg: "✓ Copié dans le presse-papiers !",
      copyFailMsg: "Impossible de copier automatiquement : sélectionnez le texte ci-dessus et copiez-le manuellement (appui long).",
      downloadBtn: "⬇️ Essayer de télécharger le fichier",
      close: "Fermer",
      colCategory: "Catégorie", colFirstName: "Prénom", colLastName: "Nom", colBirthDate: "Date de naissance",
      colAge: "Âge", colGender: "Sexe", colParent: "Parent / tuteur", colPhone: "Téléphone",
      colRegDate: "Date d'inscription", colPaymentStatus: "Statut paiement (mois en cours)",
      sheetAll: "Tous",
    },
    attendance: {
      title: "Présences", markAllPresent: "Tout marquer présent", markAllAbsent: "Tout marquer absent",
      presentCount: (a, b) => `${a} / ${b} présents`, noPlayers: "Aucun joueur inscrit.", present: "Présent", absent: "Absent",
    },
    payments: {
      title: "Paiements", collected: (m) => `Collecté — ${m}`, expected: "Attendu", remaining: "Reste à collecter",
      noPlayers: "Aucun joueur inscrit.", paidOn: (d) => `· payé le ${d}`, paid: "Payé ✓", unpaid: "Impayé",
    },
    settings: {
      title: "Paramètres", academyName: "Nom de l'académie", fee: "Cotisation mensuelle par défaut (IDR)",
      feeHelp: "Cette cotisation est utilisée par défaut lors de l'ajout d'un nouveau mois de paiement ; vous pouvez toujours l'ajuster joueur par joueur.",
      registrationFee: "Frais d'inscription (IDR)",
      adminPassword: "Mot de passe administrateur",
      adminPasswordHelp: "Ce mot de passe protège l'accès à l'espace de gestion. Partagez-le uniquement avec l'équipe de l'académie.",
      contactSocial: "Coordonnées & réseaux sociaux", website: "Site web", email: "E-mail", address: "Adresse",
      youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook", instagram: "Instagram",
      phone1: "Téléphone 1", phone2: "Téléphone 2",
      footerHelp: "Ces informations apparaissent dans le pied de la barre latérale et sur la page publique.",
      language: "Langue de l'application",
      scheduleTitle: "Horaires des entraînements", session1: "Séance 1", session2: "Séance 2",
    },
    modal: {
      editTitle: "Modifier le joueur", addTitle: "Inscrire un joueur", firstName: "Prénom", lastName: "Nom",
      birthDate: "Date de naissance", gender: "Sexe", male: "Masculin", female: "Féminin",
      parent: "Nom du parent / tuteur", phone: "Téléphone", registrationDate: "Date d'inscription",
      cancel: "Annuler", save: "Enregistrer",
    },
    adminReg: {
      title: "Demandes d'inscription", pending: "En attente", approve: "Approuver", reject: "Rejeter",
      approved: "Approuvée", rejected: "Rejetée", noRequests: "Aucune demande pour le moment.",
      submittedOn: (d) => `Envoyée le ${d}`, viewDetails: "Détails", category: "Classe",
      approveConfirm: "Créer la fiche joueur à partir de cette demande ?",
    },
    public: {
      navHome: "Accueil", navRegister: "Pré-inscription",
      heroSubtitle: "Discipline • Respect • Esprit d'équipe • Réussite",
      heroTagline: "Rêve. Entraîne-toi. Réussis.",
      ctaRegister: "S'inscrire maintenant",
      aboutTitle: "À propos de l'académie",
      aboutText: "Prima Soccer School Indonesia accueille les jeunes footballeurs de 6 à 17 ans et les accompagne avec des entraîneurs qualifiés, dans un cadre discipliné et bienveillant.",
      categoriesTitle: "Catégories d'âge",
      ageRange: "Âge",
      scheduleTitle: "Horaires des entraînements",
      feesTitle: "Tarifs",
      registrationFeeLabel: "Frais d'inscription",
      monthlyFeeLabel: "Cotisation mensuelle",
      contactTitle: "Contact",
      formTitle: "Formulaire de pré-inscription",
      formIntro: "Remplissez ce formulaire pour inscrire votre enfant. Notre équipe vous contactera pour finaliser l'inscription.",
      submit: "Envoyer la demande",
      successTitle: "Demande envoyée !",
      successText: "Merci ! Votre demande de pré-inscription a bien été reçue. Notre équipe vous contactera prochainement.",
      newRequest: "Nouvelle demande",
      required: "Ce formulaire est partagé : vos réponses seront visibles par l'équipe de l'académie.",
      printBtn: "🖨️ Imprimer le formulaire vierge",
    },
    regform: {
      sectionStudent: "A. Données de l'élève", category: "Classe (choisissez une catégorie)",
      fullName: "Nom complet", birthPlace: "Lieu de naissance", birthDate: "Date de naissance",
      gender: "Sexe", male: "Masculin", female: "Féminin", nationality: "Nationalité",
      address: "Adresse complète", phone: "Téléphone / portable", email: "E-mail",
      currentSchool: "École actuelle", schoolGrade: "Classe scolaire",
      sectionParent: "B. Parents / tuteur", fatherName: "Nom du père", fatherPhone: "Téléphone du père",
      fatherJob: "Profession du père", motherName: "Nom de la mère", motherPhone: "Téléphone de la mère",
      motherJob: "Profession de la mère",
      sectionEmergency: "C. Contact d'urgence", emergencyName: "Nom", emergencyRelation: "Lien de parenté", emergencyPhone: "Téléphone",
      sectionSupport: "D. Informations complémentaires", bloodType: "Groupe sanguin", height: "Taille (cm)",
      weight: "Poids (kg)", jerseySize: "Taille de maillot", jerseyNumber: "Numéro souhaité", shoeSize: "Pointure",
      sectionFootball: "E. Informations football", position: "Poste principal",
      posGoalkeeper: "Gardien", posDefender: "Défenseur", posMidfielder: "Milieu", posForward: "Attaquant",
      experience: "Expérience de jeu", expBeginner: "Débutant", exp1to2: "1 à 2 ans", expMore2: "Plus de 2 ans",
      previousClub: "Club / école précédente", achievements: "Palmarès (le cas échéant)",
      sectionHealth: "F. Antécédents de santé", allergies: "Allergies (aliments / médicaments / autres)",
      asthma: "Asthme", yes: "Oui", no: "Non", previousInjury: "Blessure antérieure", specialDisease: "Maladie particulière",
      onTreatment: "Sous traitement médical", treatmentDetail: "Si oui, précisez", currentMedication: "Médicament actuellement pris",
      otherNotes: "Autres informations",
      sectionConsent: "G. Consentement du parent / tuteur", parentNameConsent: "Nom du parent / tuteur",
      consentText: "Je certifie que les informations ci-dessus sont exactes et j'autorise mon enfant à participer aux entraînements, matchs et programmes de Prima Soccer School Indonesia.",
      agree: "J'accepte les conditions ci-dessus",
    },
  },
  en: {
    subtitle: "Academy management",
    loading: "Loading…",
    nav: { dashboard: "Dashboard", players: "Players", attendance: "Attendance", payments: "Payments", registrations: "Registrations", settings: "Settings" },
    adminBtn: "Admin area",
    publicBtn: "View public page",
    backAdmin: "← Back to administration",
    logoutBtn: "Log out",
    login: {
      title: "Admin area",
      subtitle: "This area is reserved for the academy staff.",
      passwordLabel: "Password",
      submit: "Log in",
      error: "Incorrect password.",
      cancel: "Cancel",
    },
    dashboard: {
      title: "Dashboard", players: "Registered players", presentToday: "Present today",
      outOf: (n) => `out of ${n}`, dues: (m) => `Dues — ${m}`, categories: "Active categories",
      breakdown: "Breakdown by category", noPlayers: "No players registered yet.",
    },
    players: {
      title: "Players", add: "+ Register a player", search: "Search a player…", all: "All",
      yearsOld: "years old", upToDate: "Up to date", unpaidMonth: "Unpaid (month)", edit: "Edit", remove: "Remove",
      noMatch: "No player matches your search.",
      exportBtn: "📥 Export (CSV/Excel)",
      exportModalTitle: "Player export",
      exportModalHint: "Copy this text, then paste it into a new Excel or Google Sheets file: the columns will separate automatically.",
      copyBtn: "📋 Copy text",
      downloadBtn: "⬇️ Download file",
      shareBtn: "📤 Share…",
      copiedMsg: "✓ Copied to clipboard!",
      copyFailMsg: "Couldn't copy automatically: select the text above and copy it manually (long press).",
      downloadBtn: "⬇️ Try to download the file",
      close: "Close",
      colCategory: "Category", colFirstName: "First name", colLastName: "Last name", colBirthDate: "Date of birth",
      colAge: "Age", colGender: "Gender", colParent: "Parent / guardian", colPhone: "Phone",
      colRegDate: "Registration date", colPaymentStatus: "Payment status (current month)",
      sheetAll: "All",
    },
    attendance: {
      title: "Attendance", markAllPresent: "Mark all present", markAllAbsent: "Mark all absent",
      presentCount: (a, b) => `${a} / ${b} present`, noPlayers: "No players registered.", present: "Present", absent: "Absent",
    },
    payments: {
      title: "Payments", collected: (m) => `Collected — ${m}`, expected: "Expected", remaining: "Remaining to collect",
      noPlayers: "No players registered.", paidOn: (d) => `· paid on ${d}`, paid: "Paid ✓", unpaid: "Unpaid",
    },
    settings: {
      title: "Settings", academyName: "Academy name", fee: "Default monthly fee (IDR)",
      feeHelp: "This fee is used by default when adding a new payment month; you can always adjust it per player.",
      registrationFee: "Registration fee (IDR)",
      adminPassword: "Admin password",
      adminPasswordHelp: "This password protects access to the management area. Share it only with academy staff.",
      contactSocial: "Contact & social media", website: "Website", email: "Email", address: "Address",
      youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook", instagram: "Instagram",
      phone1: "Phone 1", phone2: "Phone 2",
      footerHelp: "This information appears at the bottom of the sidebar and on the public page.",
      language: "App language",
      scheduleTitle: "Training schedule", session1: "Session 1", session2: "Session 2",
    },
    modal: {
      editTitle: "Edit player", addTitle: "Register a player", firstName: "First name", lastName: "Last name",
      birthDate: "Date of birth", gender: "Gender", male: "Male", female: "Female",
      parent: "Parent / guardian name", phone: "Phone", registrationDate: "Registration date",
      cancel: "Cancel", save: "Save",
    },
    adminReg: {
      title: "Registration requests", pending: "Pending", approve: "Approve", reject: "Reject",
      approved: "Approved", rejected: "Rejected", noRequests: "No requests yet.",
      submittedOn: (d) => `Submitted on ${d}`, viewDetails: "Details", category: "Class",
      approveConfirm: "Create the player record from this request?",
    },
    public: {
      navHome: "Home", navRegister: "Pre-registration",
      heroSubtitle: "Discipline • Respect • Teamwork • Achievement",
      heroTagline: "Dream. Train. Achieve.",
      ctaRegister: "Register now",
      aboutTitle: "About the academy",
      aboutText: "Prima Soccer School Indonesia welcomes young footballers aged 6 to 17, guided by qualified coaches in a disciplined and caring environment.",
      categoriesTitle: "Age categories",
      ageRange: "Age",
      scheduleTitle: "Training schedule",
      feesTitle: "Fees",
      registrationFeeLabel: "Registration fee",
      monthlyFeeLabel: "Monthly fee",
      contactTitle: "Contact",
      formTitle: "Pre-registration form",
      formIntro: "Fill in this form to register your child. Our team will contact you to finalize the registration.",
      submit: "Send request",
      successTitle: "Request sent!",
      successText: "Thank you! Your pre-registration request has been received. Our team will contact you soon.",
      newRequest: "New request",
      required: "This form is shared: your answers will be visible to the academy's staff.",
      printBtn: "🖨️ Print blank form",
    },
    regform: {
      sectionStudent: "A. Student information", category: "Class (choose a category)",
      fullName: "Full name", birthPlace: "Place of birth", birthDate: "Date of birth",
      gender: "Gender", male: "Male", female: "Female", nationality: "Nationality",
      address: "Full address", phone: "Phone / mobile", email: "Email",
      currentSchool: "Current school", schoolGrade: "School grade",
      sectionParent: "B. Parents / guardian", fatherName: "Father's name", fatherPhone: "Father's phone",
      fatherJob: "Father's job", motherName: "Mother's name", motherPhone: "Mother's phone",
      motherJob: "Mother's job",
      sectionEmergency: "C. Emergency contact", emergencyName: "Name", emergencyRelation: "Relationship", emergencyPhone: "Phone",
      sectionSupport: "D. Additional information", bloodType: "Blood type", height: "Height (cm)",
      weight: "Weight (kg)", jerseySize: "Jersey size", jerseyNumber: "Preferred number", shoeSize: "Shoe size",
      sectionFootball: "E. Football information", position: "Main position",
      posGoalkeeper: "Goalkeeper", posDefender: "Defender", posMidfielder: "Midfielder", posForward: "Forward",
      experience: "Playing experience", expBeginner: "Beginner", exp1to2: "1–2 years", expMore2: "More than 2 years",
      previousClub: "Previous club / school", achievements: "Achievements (if any)",
      sectionHealth: "F. Health history", allergies: "Allergies (food / medicine / other)",
      asthma: "Asthma", yes: "Yes", no: "No", previousInjury: "Previous injury", specialDisease: "Special condition",
      onTreatment: "Currently under treatment", treatmentDetail: "If yes, specify", currentMedication: "Medication currently taken",
      otherNotes: "Other information",
      sectionConsent: "G. Parent / guardian consent", parentNameConsent: "Parent / guardian name",
      consentText: "I certify that the information above is accurate and I authorize my child to take part in the training, matches and programs of Prima Soccer School Indonesia.",
      agree: "I agree to the above",
    },
  },
  id: {
    subtitle: "Manajemen akademi",
    loading: "Memuat…",
    nav: { dashboard: "Dasbor", players: "Pemain", attendance: "Kehadiran", payments: "Pembayaran", registrations: "Pendaftaran", settings: "Pengaturan" },
    adminBtn: "Area admin",
    publicBtn: "Lihat halaman publik",
    backAdmin: "← Kembali ke administrasi",
    logoutBtn: "Keluar",
    login: {
      title: "Area admin",
      subtitle: "Area ini khusus untuk tim akademi.",
      passwordLabel: "Kata sandi",
      submit: "Masuk",
      error: "Kata sandi salah.",
      cancel: "Batal",
    },
    dashboard: {
      title: "Dasbor", players: "Pemain terdaftar", presentToday: "Hadir hari ini",
      outOf: (n) => `dari ${n}`, dues: (m) => `Iuran — ${m}`, categories: "Kategori aktif",
      breakdown: "Rincian per kategori", noPlayers: "Belum ada pemain terdaftar.",
    },
    players: {
      title: "Pemain", add: "+ Daftarkan pemain", search: "Cari pemain…", all: "Semua",
      yearsOld: "tahun", upToDate: "Lunas", unpaidMonth: "Belum bayar (bulan ini)", edit: "Ubah", remove: "Hapus",
      noMatch: "Tidak ada pemain yang cocok dengan pencarian.",
      exportBtn: "📥 Ekspor (CSV/Excel)",
      exportModalTitle: "Ekspor data pemain",
      exportModalHint: "Salin teks ini, lalu tempel ke file Excel atau Google Sheets baru: kolom akan otomatis terpisah.",
      copyBtn: "📋 Salin teks",
      downloadBtn: "⬇️ Unduh file",
      shareBtn: "📤 Bagikan…",
      copiedMsg: "✓ Berhasil disalin!",
      copyFailMsg: "Tidak dapat menyalin otomatis: pilih teks di atas dan salin secara manual (tekan lama).",
      downloadBtn: "⬇️ Coba unduh file",
      close: "Tutup",
      colCategory: "Kategori", colFirstName: "Nama depan", colLastName: "Nama belakang", colBirthDate: "Tanggal lahir",
      colAge: "Usia", colGender: "Jenis kelamin", colParent: "Orang tua / wali", colPhone: "Telepon",
      colRegDate: "Tanggal pendaftaran", colPaymentStatus: "Status pembayaran (bulan berjalan)",
      sheetAll: "Semua",
    },
    attendance: {
      title: "Kehadiran", markAllPresent: "Tandai semua hadir", markAllAbsent: "Tandai semua absen",
      presentCount: (a, b) => `${a} / ${b} hadir`, noPlayers: "Belum ada pemain terdaftar.", present: "Hadir", absent: "Absen",
    },
    payments: {
      title: "Pembayaran", collected: (m) => `Terkumpul — ${m}`, expected: "Target", remaining: "Sisa yang harus ditagih",
      noPlayers: "Belum ada pemain terdaftar.", paidOn: (d) => `· dibayar pada ${d}`, paid: "Lunas ✓", unpaid: "Belum bayar",
    },
    settings: {
      title: "Pengaturan", academyName: "Nama akademi", fee: "Iuran bulanan default (IDR)",
      feeHelp: "Iuran ini digunakan secara default saat menambahkan bulan pembayaran baru; Anda tetap bisa menyesuaikannya per pemain.",
      registrationFee: "Uang pendaftaran (IDR)",
      adminPassword: "Kata sandi admin",
      adminPasswordHelp: "Kata sandi ini melindungi akses ke area manajemen. Bagikan hanya kepada tim akademi.",
      contactSocial: "Kontak & media sosial", website: "Situs web", email: "Email", address: "Alamat",
      youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook", instagram: "Instagram",
      phone1: "Telepon 1", phone2: "Telepon 2",
      footerHelp: "Informasi ini muncul di bagian bawah sidebar dan di halaman publik.",
      language: "Bahasa aplikasi",
      scheduleTitle: "Jadwal latihan", session1: "Sesi 1", session2: "Sesi 2",
    },
    modal: {
      editTitle: "Ubah data pemain", addTitle: "Daftarkan pemain", firstName: "Nama depan", lastName: "Nama belakang",
      birthDate: "Tanggal lahir", gender: "Jenis kelamin", male: "Laki-laki", female: "Perempuan",
      parent: "Nama orang tua / wali", phone: "Telepon", registrationDate: "Tanggal pendaftaran",
      cancel: "Batal", save: "Simpan",
    },
    adminReg: {
      title: "Permintaan pendaftaran", pending: "Menunggu", approve: "Setujui", reject: "Tolak",
      approved: "Disetujui", rejected: "Ditolak", noRequests: "Belum ada permintaan.",
      submittedOn: (d) => `Dikirim pada ${d}`, viewDetails: "Detail", category: "Kelas",
      approveConfirm: "Buat data pemain dari permintaan ini?",
    },
    public: {
      navHome: "Beranda", navRegister: "Pendaftaran",
      heroSubtitle: "Discipline • Respect • Teamwork • Achievement",
      heroTagline: "Dream. Train. Achieve.",
      ctaRegister: "Daftar sekarang",
      aboutTitle: "Tentang akademi",
      aboutText: "Prima Soccer School Indonesia menerima peserta usia 6–17 tahun, dibimbing oleh pelatih berkualitas dalam suasana yang disiplin dan penuh perhatian.",
      categoriesTitle: "Kategori usia",
      ageRange: "Usia",
      scheduleTitle: "Jadwal latihan",
      feesTitle: "Informasi biaya",
      registrationFeeLabel: "Uang pendaftaran",
      monthlyFeeLabel: "Iuran bulanan",
      contactTitle: "Kontak",
      formTitle: "Formulir pendaftaran siswa",
      formIntro: "Isi formulir ini untuk mendaftarkan anak Anda. Tim kami akan menghubungi Anda untuk menyelesaikan pendaftaran.",
      submit: "Kirim formulir",
      successTitle: "Formulir terkirim!",
      successText: "Terima kasih! Formulir pendaftaran Anda telah kami terima. Tim kami akan segera menghubungi Anda.",
      newRequest: "Formulir baru",
      required: "Formulir ini bersifat berbagi: jawaban Anda akan terlihat oleh tim akademi.",
      printBtn: "🖨️ Cetak formulir kosong",
    },
    regform: {
      sectionStudent: "A. Data Pribadi Siswa", category: "Kelas (pilih salah satu)",
      fullName: "Nama Lengkap", birthPlace: "Tempat Lahir", birthDate: "Tanggal Lahir",
      gender: "Jenis Kelamin", male: "Laki-laki", female: "Perempuan", nationality: "Kewarganegaraan",
      address: "Alamat Lengkap", phone: "Nomor Telepon / HP", email: "Email",
      currentSchool: "Nama Sekolah", schoolGrade: "Kelas (Sekolah)",
      sectionParent: "B. Data Orang Tua / Wali", fatherName: "Nama Ayah", fatherPhone: "Nomor Telepon Ayah",
      fatherJob: "Pekerjaan Ayah", motherName: "Nama Ibu", motherPhone: "Nomor Telepon Ibu",
      motherJob: "Pekerjaan Ibu",
      sectionEmergency: "C. Kontak Darurat", emergencyName: "Nama", emergencyRelation: "Hubungan", emergencyPhone: "Nomor Telepon",
      sectionSupport: "D. Informasi Penunjang", bloodType: "Golongan Darah", height: "Tinggi Badan (cm)",
      weight: "Berat Badan (kg)", jerseySize: "Ukuran Jersey", jerseyNumber: "Nomor Punggung Pilihan", shoeSize: "Ukuran Sepatu",
      sectionFootball: "E. Informasi Sepakbola", position: "Posisi Utama",
      posGoalkeeper: "Penjaga Gawang", posDefender: "Bek", posMidfielder: "Gelandang", posForward: "Penyerang",
      experience: "Pengalaman Bermain", expBeginner: "Pemula", exp1to2: "1 - 2 Tahun", expMore2: "> 2 Tahun",
      previousClub: "Klub / Sekolah Sebelumnya", achievements: "Prestasi (Jika ada)",
      sectionHealth: "F. Riwayat Kesehatan", allergies: "Alergi (Obat / Makanan / Lainnya)",
      asthma: "Asma", yes: "Ya", no: "Tidak", previousInjury: "Cedera Sebelumnya", specialDisease: "Penyakit Khusus",
      onTreatment: "Sedang Dalam Pengobatan", treatmentDetail: "Jika ya, jelaskan", currentMedication: "Obat yang Sedang Dikonsumsi",
      otherNotes: "Lain-lain (Informasi Tambahan)",
      sectionConsent: "G. Persetujuan Orang Tua / Wali", parentNameConsent: "Nama Orang Tua / Wali",
      consentText: "Saya selaku orang tua / wali menyatakan bahwa data yang diberikan di atas adalah benar adanya dan mengizinkan anak saya untuk mengikuti seluruh kegiatan latihan, pertandingan, dan program yang diselenggarakan oleh Prima Soccer School Indonesia.",
      agree: "Saya menyetujui pernyataan di atas",
    },
  },
};

function computeAge(birthDateStr) {
  if (!birthDateStr) return null;
  const b = new Date(birthDateStr);
  if (isNaN(b)) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

function getCategory(birthDateStr) {
  const age = computeAge(birthDateStr);
  if (age === null) return "—";
  for (const c of CATEGORY_BOUNDS) {
    if (age <= c.max) return c.label;
  }
  return "C";
}

function catColor(cat) {
  const map = { A: "#F2994A", B: "#E96B24", C: "#12261C", "—": "#7A7A7A" };
  return map[cat] || "#3B3B3B";
}

function todayISO() { return new Date().toISOString().slice(0, 10); }
function currentMonth() { return new Date().toISOString().slice(0, 7); }
function monthLabel(ym, lang) {
  const [y, m] = ym.split("-");
  const names = MONTH_NAMES[lang] || MONTH_NAMES.fr;
  return `${names[parseInt(m, 10) - 1]} ${y}`;
}
function fmtMoney(n) { return "Rp " + (n || 0).toLocaleString("id-ID"); }
function initials(prenom, nom) { return ((prenom?.[0] || "") + (nom?.[0] || "")).toUpperCase(); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ---------- Small UI atoms ----------
function Badge({ children, bg, color = "#fff" }) {
  return (
    <span style={{
      background: bg, color, fontFamily: "'Roboto Mono', monospace", fontSize: 11, fontWeight: 700,
      padding: "3px 8px", borderRadius: 999, letterSpacing: 0.4, whiteSpace: "nowrap",
    }}>{children}</span>
  );
}
function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 3px rgba(11,40,24,0.08)", flex: "1 1 150px", minWidth: 150, borderTop: `3px solid ${accent}` }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: COLORS.ink, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 6, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function Field({ label, children }) {
  return <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginTop: 12 }}>{label}{children}</label>;
}
const inputStyle = { width: "100%", marginTop: 5, padding: "9px 11px", borderRadius: 8, border: "1px solid #DCE3DE", fontSize: 13.5 };

const ALL = "__ALL__";
const DEFAULT_SETTINGS = {
  academyName: "Prima Soccer School Indonesia",
  fee: 150000,
  registrationFee: 300000,
  adminPassword: "prima2018",
  website: "primasoccerschool.com",
  email: "primasoccerschool@gmail.com",
  address: "Jl. Griya Asri Raya - Kel. Jelupang - Serpong - Tangerang Selatan",
  youtube: "prima soccer school Indonesia",
  tiktok: "prima soccer school Indonesia",
  facebook: "Prima Soccer School Indonesia",
  instagram: "@primasoccerschoolindonesia",
  phones: ["0853 4288 3803", "0822 1000 3063"],
  session1: "Rabu · 15.45 – 17.45 (Semua Usia)",
  session2: "Sabtu · 07.45 – 10.45 (Semua Usia)",
  lang: "fr",
};
const EMPTY_REG = {
  kelas: "A", fullName: "", birthPlace: "", birthDate: "", gender: "M", nationality: "Indonesia",
  address: "", phone: "", email: "", currentSchool: "", schoolGrade: "",
  fatherName: "", fatherPhone: "", fatherJob: "", motherName: "", motherPhone: "", motherJob: "",
  emergencyName: "", emergencyRelation: "", emergencyPhone: "",
  bloodType: "", height: "", weight: "", jerseySize: "", jerseyNumber: "", shoeSize: "",
  position: "", experience: "", previousClub: "", achievements: "",
  allergies: "", asthma: "no", previousInjury: "", specialDisease: "", onTreatment: "no",
  treatmentDetail: "", currentMedication: "", otherNotes: "",
  parentNameConsent: "", agree: false,
};

// ---------- Main App ----------
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("public"); // 'public' | 'admin'
  const [publicTab, setPublicTab] = useState("home"); // 'home' | 'register' | 'success'
  const [tab, setTab] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [payments, setPayments] = useState({});
  const [registrations, setRegistrations] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState(ALL);
  const [attDate, setAttDate] = useState(todayISO());
  const [payMonth, setPayMonth] = useState(currentMonth());
  const [regDraft, setRegDraft] = useState(EMPTY_REG);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [viewingReg, setViewingReg] = useState(null);
  const [exportText, setExportText] = useState(null);
  const [copyStatus, setCopyStatus] = useState("");

  const lang = settings.lang || "fr";
  const t = STRINGS[lang] || STRINGS.fr;

  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, a, p, reg, set] = await Promise.all([
          fetchStudents(),
          fetchAllAttendance(),
          fetchAllPayments(),
          fetchRegistrations(),
          fetchSettings(),
        ]);
        setStudents(s); setAttendance(a); setPayments(p); setRegistrations(reg);
        setSettings({ ...DEFAULT_SETTINGS, ...(set || {}) });
        setLoaded(true);
      } catch (err) {
        console.error(err);
        setLoadError(err.message || String(err));
      }
    })();
  }, []);

  const persistSettings = useCallback((next) => {
    setSettings(next);
    updateSettings(next).catch(err => console.error("Settings save error", err));
  }, []);

  const activeStudents = useMemo(() => students.filter(s => s.actif !== false), [students]);
  const categories = useMemo(() => {
    const set = new Set(activeStudents.map(s => getCategory(s.dateNaissance)));
    return [ALL, ...Array.from(set).sort()];
  }, [activeStudents]);
  const filteredStudents = useMemo(() => activeStudents.filter(s => {
    const matchSearch = `${s.prenom} ${s.nom}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === ALL || getCategory(s.dateNaissance) === filterCat;
    return matchSearch && matchCat;
  }), [activeStudents, search, filterCat]);

  const todaysAtt = attendance[attDate] || {};
  const presentCountToday = Object.values(attendance[todayISO()] || {}).filter(Boolean).length;

  function toggleAttendance(studentId) {
    const newValue = !((attendance[attDate] || {})[studentId]);
    setAttendance(prev => ({ ...prev, [attDate]: { ...(prev[attDate] || {}), [studentId]: newValue } }));
    setAttendanceCell(studentId, attDate, newValue).catch(err => console.error("Attendance save error", err));
  }
  function markAll(present) {
    setAttendance(prev => {
      const dayRecord = { ...(prev[attDate] || {}) };
      filteredStudents.forEach(s => { dayRecord[s.id] = present; });
      return { ...prev, [attDate]: dayRecord };
    });
    filteredStudents.forEach(s => {
      setAttendanceCell(s.id, attDate, present).catch(err => console.error("Attendance save error", err));
    });
  }
  function getPaymentRecord(studentId, month) {
    return (payments[studentId] && payments[studentId][month]) || { paid: false, amount: settings.fee, datePaid: null };
  }
  function togglePayment(studentId) {
    const current = getPaymentRecord(studentId, payMonth);
    const next = { paid: !current.paid, amount: current.amount || settings.fee, datePaid: !current.paid ? todayISO() : null };
    setPayments(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [payMonth]: next } }));
    setPaymentCell(studentId, payMonth, next).catch(err => console.error("Payment save error", err));
  }
  function setPaymentAmount(studentId, amount) {
    const current = getPaymentRecord(studentId, payMonth);
    const next = { ...current, amount: Number(amount) || 0 };
    setPayments(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [payMonth]: next } }));
    setPaymentCell(studentId, payMonth, next).catch(err => console.error("Payment save error", err));
  }
  const monthCollected = activeStudents.reduce((sum, s) => sum + (getPaymentRecord(s.id, payMonth).paid ? (getPaymentRecord(s.id, payMonth).amount || 0) : 0), 0);
  const monthExpected = activeStudents.length * settings.fee;

  function openNewStudent() {
    setEditingStudent({ id: null, prenom: "", nom: "", dateNaissance: "", sexe: "M", parent: "", telephone: "", dateInscription: todayISO(), actif: true });
    setShowForm(true);
  }
  function openEditStudent(s) { setEditingStudent({ ...s }); setShowForm(true); }
  function setPhone(index, value) {
    const next = [...(settings.phones || [])];
    next[index] = value;
    persistSettings({ ...settings, phones: next });
  }
  async function saveStudent(e) {
    e.preventDefault();
    if (!editingStudent.prenom || !editingStudent.nom || !editingStudent.dateNaissance) return;
    try {
      if (editingStudent.id) {
        await upsertStudent(editingStudent);
        setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
      } else {
        const newId = await upsertStudent(editingStudent);
        setStudents([...students, { ...editingStudent, id: newId }]);
      }
      setShowForm(false); setEditingStudent(null);
    } catch (err) {
      console.error("Student save error", err);
      alert("Erreur lors de l'enregistrement : " + (err.message || err));
    }
  }
  async function deactivateStudent(id) {
    try {
      await deactivateStudentRow(id);
      setStudents(students.map(s => s.id === id ? { ...s, actif: false } : s));
    } catch (err) {
      console.error("Deactivate error", err);
    }
  }

  function buildStudentsCSV() {
    const genderLabel = (g) => g === "F" ? t.modal.female : t.modal.male;
    const headers = [
      t.players.colCategory, t.players.colFirstName, t.players.colLastName, t.players.colBirthDate,
      t.players.colAge, t.players.colGender, t.players.colParent, t.players.colPhone,
      t.players.colRegDate, t.players.colPaymentStatus,
    ];
    const rowFor = (s) => {
      const rec = getPaymentRecord(s.id, currentMonth());
      return [
        getCategory(s.dateNaissance), s.prenom, s.nom, s.dateNaissance, computeAge(s.dateNaissance),
        genderLabel(s.sexe), s.parent || "", s.telephone || "", s.dateInscription || "",
        rec.paid ? t.players.upToDate : t.players.unpaidMonth,
      ];
    };
    const escapeCell = (v) => {
      const str = String(v ?? "");
      return /[";\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const byCat = { A: [], B: [], C: [] };
    activeStudents.forEach(s => {
      const cat = getCategory(s.dateNaissance);
      if (byCat[cat]) byCat[cat].push(s);
    });
    ["A", "B", "C"].forEach(cat => byCat[cat].sort((a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`)));

    const lines = [headers.map(escapeCell).join(";")];
    ["A", "B", "C"].forEach(cat => {
      byCat[cat].forEach(s => lines.push(rowFor(s).map(escapeCell).join(";")));
    });
    return lines.join("\r\n");
  }

  function exportStudentsExcel() {
    setCopyStatus("");
    setExportText(buildStudentsCSV());
  }

  async function copyExportText() {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyStatus("ok");
    } catch (err) {
      setCopyStatus("fail");
    }
  }

  function downloadExportFile() {
    const csvContent = "\uFEFF" + exportText;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `joueurs_prima_soccer_${todayISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }


  // ---- Public registration form ----
  async function submitRegistration(e) {
    e.preventDefault();
    if (!regDraft.fullName || !regDraft.birthDate || !regDraft.agree) return;
    try {
      await insertRegistration(regDraft);
      const refreshed = await fetchRegistrations();
      setRegistrations(refreshed);
      setRegDraft(EMPTY_REG);
      setPublicTab("success");
    } catch (err) {
      console.error("Registration submit error", err);
      alert("Une erreur est survenue lors de l'envoi. Merci de réessayer.");
    }
  }
  async function approveRegistration(reg) {
    const parts = reg.fullName.trim().split(" ");
    const prenom = parts[0] || reg.fullName;
    const nom = parts.slice(1).join(" ") || "-";
    const student = {
      prenom, nom, dateNaissance: reg.birthDate, sexe: reg.gender,
      parent: reg.fatherName || reg.motherName || reg.parentNameConsent || "",
      telephone: reg.phone || reg.fatherPhone || reg.motherPhone || "",
      dateInscription: todayISO(), actif: true,
    };
    try {
      const newId = await upsertStudent(student);
      setStudents([...students, { ...student, id: newId }]);
      await updateRegistrationStatus(reg.id, "approved");
      setRegistrations(registrations.map(r => r.id === reg.id ? { ...r, status: "approved" } : r));
    } catch (err) {
      console.error("Approve error", err);
      alert("Erreur lors de l'approbation : " + (err.message || err));
    }
  }
  async function rejectRegistration(reg) {
    try {
      await updateRegistrationStatus(reg.id, "rejected");
      setRegistrations(registrations.map(r => r.id === reg.id ? { ...r, status: "rejected" } : r));
    } catch (err) {
      console.error("Reject error", err);
    }
  }
  const pendingRegs = registrations.filter(r => r.status === "pending");

  function attemptAdminLogin(e) {
    e.preventDefault();
    if (loginInput === (settings.adminPassword || "")) {
      setAdminUnlocked(true);
      setShowAdminLogin(false);
      setLoginInput("");
      setLoginError(false);
      setView("admin");
    } else {
      setLoginError(true);
    }
  }
  function requestAdminAccess() {
    if (adminUnlocked) setView("admin");
    else setShowAdminLogin(true);
  }
  function logoutAdmin() {
    setAdminUnlocked(false);
    setView("public");
  }

  if (loadError) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: COLORS.pitchDark, color: COLORS.chalk, fontFamily: "'Inter', sans-serif", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 34, marginBottom: 10 }}>⚠️</div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Impossible de se connecter à la base de données.</div>
        <div style={{ fontSize: 12.5, color: "#c7d6cc", maxWidth: 420 }}>
          Vérifiez votre fichier <code>.env</code> (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) et que le script <code>supabase/schema.sql</code> a bien été exécuté dans votre projet Supabase.
        </div>
        <div style={{ fontSize: 11, color: "#9db3a6", marginTop: 10 }}>{loadError}</div>
      </div>
    );
  }
  if (!loaded) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: COLORS.pitchDark, color: COLORS.chalk, fontFamily: "'Inter', sans-serif" }}>{t.loading}</div>;
  }

  const globalStyle = (
    <style>{`
      ${FONT_IMPORT}
      * { box-sizing: border-box; }
      button { cursor: pointer; font-family: 'Inter', sans-serif; }
      input, select, textarea { font-family: 'Inter', sans-serif; }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-thumb { background: #cfd9d2; border-radius: 4px; }
      @media (max-width: 760px) {
        .sidebar { position: fixed; bottom: 0; left: 0; right: 0; top: auto !important; width: 100% !important; height: 64px; flex-direction: row !important; z-index: 50; }
        .sidebar .brand { display: none; }
        .sidebar nav { flex-direction: row !important; width: 100%; justify-content: space-around; }
        .sidebar nav button { flex-direction: column; font-size: 10px !important; padding: 6px !important; }
        .main-content { margin-left: 0 !important; padding-bottom: 84px !important; }
      }
      @media print {
        .no-print { display: none !important; }
        body, .print-area { background: #fff !important; }
        .print-area { max-width: 100% !important; padding: 0 !important; }
        input, select, textarea { border: 1px solid #999 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        * { box-shadow: none !important; }
      }
    `}</style>
  );

  // =========================================================
  // PUBLIC VIEW
  // =========================================================
  if (view === "public") {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: COLORS.chalk, minHeight: "100vh", color: COLORS.ink }}>
        {globalStyle}
        {/* Top bar */}
        <div className="no-print" style={{ background: COLORS.pitchDark, color: "#fff", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={LOGO_CLEAN} alt="Prima Soccer School Indonesia" style={{ width: 40, height: 32, borderRadius: 6, objectFit: "cover" }} />
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: 0.5 }}>{settings.academyName}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setPublicTab("home")} style={{ background: "transparent", border: "none", color: publicTab === "home" ? COLORS.gold : "#c7d6cc", fontWeight: 700, fontSize: 13 }}>{t.public.navHome}</button>
            <button onClick={() => setPublicTab("register")} style={{ background: publicTab === "register" ? COLORS.orange : "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, padding: "8px 14px", borderRadius: 8 }}>{t.public.navRegister}</button>
            <div style={{ display: "flex", gap: 4 }}>
              {["fr", "en", "id"].map(l => (
                <button key={l} onClick={() => persistSettings({ ...settings, lang: l })} style={{ background: lang === l ? COLORS.gold : "rgba(255,255,255,0.08)", color: lang === l ? COLORS.pitchDark : "#c7d6cc", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10.5, fontWeight: 700 }}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={requestAdminAccess} style={{ background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "#c7d6cc", borderRadius: 8, padding: "7px 12px", fontSize: 11.5 }}>{t.adminBtn}</button>
          </div>
        </div>

        {publicTab === "home" && (
          <div>
            {/* Hero */}
            <div style={{ background: `linear-gradient(135deg, ${COLORS.pitchDark}, ${COLORS.pitch})`, color: "#fff", padding: "44px 20px 0", textAlign: "center", overflow: "hidden" }}>
              <img src={LOGO_CLEAN} alt="Prima Soccer School Indonesia" style={{ height: 74, borderRadius: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.35)" }} />
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, margin: "14px 0 0", letterSpacing: 1 }}>{settings.academyName}</h1>
              <p style={{ color: COLORS.gold, fontWeight: 700, marginTop: 8, fontSize: 14, letterSpacing: 0.5 }}>{t.public.heroSubtitle}</p>
              <p style={{ fontStyle: "italic", color: "#c7d6cc", marginTop: 6 }}>{t.public.heroTagline}</p>
              <button onClick={() => setPublicTab("register")} style={{ marginTop: 20, background: COLORS.orange, color: "#fff", border: "none", borderRadius: 10, padding: "13px 28px", fontWeight: 700, fontSize: 14.5 }}>{t.public.ctaRegister}</button>
              <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
                <img src={HERO_TEAM} alt="Joueurs Prima Soccer School Indonesia" style={{ width: "100%", maxWidth: 380, display: "block" }} />
              </div>
            </div>

            <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 20px" }}>
              {/* About */}
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26 }}>{t.public.aboutTitle}</h2>
                <p style={{ color: COLORS.inkSoft, fontSize: 14.5, lineHeight: 1.6 }}>{t.public.aboutText}</p>
              </section>

              {/* Categories */}
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26 }}>{t.public.categoriesTitle}</h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[{ l: "A", r: "6 - 9" }, { l: "B", r: "10 - 12" }, { l: "C", r: "13 - 17" }].map(c => (
                    <div key={c.l} style={{ flex: "1 1 140px", background: COLORS.card, borderRadius: 12, padding: 18, textAlign: "center", boxShadow: "0 1px 3px rgba(11,40,24,0.08)", borderTop: `4px solid ${catColor(c.l)}` }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30 }}>{c.l}</div>
                      <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>{t.public.ageRange} {c.r} {t.players.yearsOld}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Schedule */}
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26 }}>{t.public.scheduleTitle}</h2>
                <div style={{ background: COLORS.card, borderRadius: 12, boxShadow: "0 1px 3px rgba(11,40,24,0.08)", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", fontSize: 14, fontWeight: 600 }}>{settings.session1}</div>
                  <div style={{ padding: "14px 18px", fontSize: 14, fontWeight: 600, borderTop: "1px solid #F0F1EC" }}>{settings.session2}</div>
                </div>
              </section>

              {/* Fees */}
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26 }}>{t.public.feesTitle}</h2>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <StatCard label={t.public.registrationFeeLabel} value={fmtMoney(settings.registrationFee)} accent={COLORS.orange} />
                  <StatCard label={t.public.monthlyFeeLabel} value={fmtMoney(settings.fee)} accent={COLORS.grass} />
                </div>
              </section>

              {/* Contact */}
              <section>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26 }}>{t.public.contactTitle}</h2>
                <div style={{ background: COLORS.card, borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(11,40,24,0.08)", fontSize: 13.5, lineHeight: 2 }}>
                  <div>📍 {settings.address}</div>
                  <div>📞 {settings.phones?.filter(Boolean).join(" / ")}</div>
                  <div>✉️ {settings.email}</div>
                  <div>🌐 {settings.website}</div>
                  <div>📷 Instagram: {settings.instagram} &nbsp;|&nbsp; 📘 Facebook: {settings.facebook}</div>
                  <div>📺 YouTube: {settings.youtube} &nbsp;|&nbsp; 🎵 TikTok: {settings.tiktok}</div>
                </div>
              </section>
            </div>
          </div>
        )}

        {publicTab === "register" && (
          <div className="print-area" style={{ maxWidth: 720, margin: "0 auto", padding: "36px 20px 80px", position: "relative" }}>
            <img src={LOGO_CLEAN} alt="" className="no-print" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "70%", maxWidth: 480, opacity: 0.05, zIndex: 0, pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, marginBottom: 4 }}>{t.public.formTitle}</h1>
                <p style={{ color: COLORS.inkSoft, fontSize: 13.5, marginTop: 0 }}>{t.public.formIntro}</p>
              </div>
              <button type="button" onClick={() => window.print()} className="no-print" style={{ background: "#EEF1EC", border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>{t.public.printBtn}</button>
            </div>
            <p style={{ color: COLORS.inkSoft, fontSize: 11.5, marginTop: -6 }}>{t.public.required}</p>

            <form onSubmit={submitRegistration}>
              {/* A. Student */}
              <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, marginTop: 16, boxShadow: "0 1px 3px rgba(11,40,24,0.08)" }}>
                <h3 style={{ marginTop: 0, fontSize: 15 }}>{t.regform.sectionStudent}</h3>
                <Field label={t.regform.category}>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    {["A", "B", "C"].map(c => (
                      <button type="button" key={c} onClick={() => setRegDraft({ ...regDraft, kelas: c })} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: regDraft.kelas === c ? `2px solid ${catColor(c)}` : "1px solid #DCE3DE", background: regDraft.kelas === c ? COLORS.greenSoft : "#fff", fontWeight: 700 }}>{c}</button>
                    ))}
                  </div>
                </Field>
                <Field label={t.regform.fullName}><input required style={inputStyle} value={regDraft.fullName} onChange={e => setRegDraft({ ...regDraft, fullName: e.target.value })} /></Field>
                <div style={{ display: "flex", gap: 10 }}>
                  <Field label={t.regform.birthPlace}><input style={inputStyle} value={regDraft.birthPlace} onChange={e => setRegDraft({ ...regDraft, birthPlace: e.target.value })} /></Field>
                  <Field label={t.regform.birthDate}><input required type="date" style={inputStyle} value={regDraft.birthDate} onChange={e => setRegDraft({ ...regDraft, birthDate: e.target.value })} /></Field>
                </div>
                <Field label={t.regform.gender}>
                  <select style={inputStyle} value={regDraft.gender} onChange={e => setRegDraft({ ...regDraft, gender: e.target.value })}>
                    <option value="M">{t.regform.male}</option>
                    <option value="F">{t.regform.female}</option>
                  </select>
                </Field>
                <Field label={t.regform.nationality}><input style={inputStyle} value={regDraft.nationality} onChange={e => setRegDraft({ ...regDraft, nationality: e.target.value })} /></Field>
                <Field label={t.regform.address}><input style={inputStyle} value={regDraft.address} onChange={e => setRegDraft({ ...regDraft, address: e.target.value })} /></Field>
                <div style={{ display: "flex", gap: 10 }}>
                  <Field label={t.regform.phone}><input style={inputStyle} value={regDraft.phone} onChange={e => setRegDraft({ ...regDraft, phone: e.target.value })} /></Field>
                  <Field label={t.regform.email}><input type="email" style={inputStyle} value={regDraft.email} onChange={e => setRegDraft({ ...regDraft, email: e.target.value })} /></Field>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Field label={t.regform.currentSchool}><input style={inputStyle} value={regDraft.currentSchool} onChange={e => setRegDraft({ ...regDraft, currentSchool: e.target.value })} /></Field>
                  <Field label={t.regform.schoolGrade}><input style={inputStyle} value={regDraft.schoolGrade} onChange={e => setRegDraft({ ...regDraft, schoolGrade: e.target.value })} /></Field>
                </div>
              </div>

              {/* B. Parents */}
              <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, marginTop: 16, boxShadow: "0 1px 3px rgba(11,40,24,0.08)" }}>
                <h3 style={{ marginTop: 0, fontSize: 15 }}>{t.regform.sectionParent}</h3>
                <Field label={t.regform.fatherName}><input style={inputStyle} value={regDraft.fatherName} onChange={e => setRegDraft({ ...regDraft, fatherName: e.target.value })} /></Field>
                <div style={{ display: "flex", gap: 10 }}>
                  <Field label={t.regform.fatherPhone}><input style={inputStyle} value={regDraft.fatherPhone} onChange={e => setRegDraft({ ...regDraft, fatherPhone: e.target.value })} /></Field>
                  <Field label={t.regform.fatherJob}><input style={inputStyle} value={regDraft.fatherJob} onChange={e => setRegDraft({ ...regDraft, fatherJob: e.target.value })} /></Field>
                </div>
                <Field label={t.regform.motherName}><input style={inputStyle} value={regDraft.motherName} onChange={e => setRegDraft({ ...regDraft, motherName: e.target.value })} /></Field>
                <div style={{ display: "flex", gap: 10 }}>
                  <Field label={t.regform.motherPhone}><input style={inputStyle} value={regDraft.motherPhone} onChange={e => setRegDraft({ ...regDraft, motherPhone: e.target.value })} /></Field>
                  <Field label={t.regform.motherJob}><input style={inputStyle} value={regDraft.motherJob} onChange={e => setRegDraft({ ...regDraft, motherJob: e.target.value })} /></Field>
                </div>
              </div>

              {/* C. Emergency */}
              <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, marginTop: 16, boxShadow: "0 1px 3px rgba(11,40,24,0.08)" }}>
                <h3 style={{ marginTop: 0, fontSize: 15 }}>{t.regform.sectionEmergency}</h3>
                <Field label={t.regform.emergencyName}><input style={inputStyle} value={regDraft.emergencyName} onChange={e => setRegDraft({ ...regDraft, emergencyName: e.target.value })} /></Field>
                <div style={{ display: "flex", gap: 10 }}>
                  <Field label={t.regform.emergencyRelation}><input style={inputStyle} value={regDraft.emergencyRelation} onChange={e => setRegDraft({ ...regDraft, emergencyRelation: e.target.value })} /></Field>
                  <Field label={t.regform.emergencyPhone}><input style={inputStyle} value={regDraft.emergencyPhone} onChange={e => setRegDraft({ ...regDraft, emergencyPhone: e.target.value })} /></Field>
                </div>
              </div>

              {/* D. Support info */}
              <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, marginTop: 16, boxShadow: "0 1px 3px rgba(11,40,24,0.08)" }}>
                <h3 style={{ marginTop: 0, fontSize: 15 }}>{t.regform.sectionSupport}</h3>
                <div style={{ display: "flex", gap: 10 }}>
                  <Field label={t.regform.bloodType}>
                    <select style={inputStyle} value={regDraft.bloodType} onChange={e => setRegDraft({ ...regDraft, bloodType: e.target.value })}>
                      <option value="">—</option><option>A</option><option>B</option><option>AB</option><option>O</option>
                    </select>
                  </Field>
                  <Field label={t.regform.height}><input type="number" style={inputStyle} value={regDraft.height} onChange={e => setRegDraft({ ...regDraft, height: e.target.value })} /></Field>
                  <Field label={t.regform.weight}><input type="number" style={inputStyle} value={regDraft.weight} onChange={e => setRegDraft({ ...regDraft, weight: e.target.value })} /></Field>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Field label={t.regform.jerseySize}>
                    <select style={inputStyle} value={regDraft.jerseySize} onChange={e => setRegDraft({ ...regDraft, jerseySize: e.target.value })}>
                      <option value="">—</option><option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
                    </select>
                  </Field>
                  <Field label={t.regform.jerseyNumber}><input style={inputStyle} value={regDraft.jerseyNumber} onChange={e => setRegDraft({ ...regDraft, jerseyNumber: e.target.value })} /></Field>
                  <Field label={t.regform.shoeSize}><input style={inputStyle} value={regDraft.shoeSize} onChange={e => setRegDraft({ ...regDraft, shoeSize: e.target.value })} /></Field>
                </div>
              </div>

              {/* E. Football */}
              <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, marginTop: 16, boxShadow: "0 1px 3px rgba(11,40,24,0.08)" }}>
                <h3 style={{ marginTop: 0, fontSize: 15 }}>{t.regform.sectionFootball}</h3>
                <Field label={t.regform.position}>
                  <select style={inputStyle} value={regDraft.position} onChange={e => setRegDraft({ ...regDraft, position: e.target.value })}>
                    <option value="">—</option>
                    <option value="goalkeeper">{t.regform.posGoalkeeper}</option>
                    <option value="defender">{t.regform.posDefender}</option>
                    <option value="midfielder">{t.regform.posMidfielder}</option>
                    <option value="forward">{t.regform.posForward}</option>
                  </select>
                </Field>
                <Field label={t.regform.experience}>
                  <select style={inputStyle} value={regDraft.experience} onChange={e => setRegDraft({ ...regDraft, experience: e.target.value })}>
                    <option value="">—</option>
                    <option value="beginner">{t.regform.expBeginner}</option>
                    <option value="1to2">{t.regform.exp1to2}</option>
                    <option value="more2">{t.regform.expMore2}</option>
                  </select>
                </Field>
                <Field label={t.regform.previousClub}><input style={inputStyle} value={regDraft.previousClub} onChange={e => setRegDraft({ ...regDraft, previousClub: e.target.value })} /></Field>
                <Field label={t.regform.achievements}><textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={regDraft.achievements} onChange={e => setRegDraft({ ...regDraft, achievements: e.target.value })} /></Field>
              </div>

              {/* F. Health */}
              <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, marginTop: 16, boxShadow: "0 1px 3px rgba(11,40,24,0.08)" }}>
                <h3 style={{ marginTop: 0, fontSize: 15 }}>{t.regform.sectionHealth}</h3>
                <Field label={t.regform.allergies}><input style={inputStyle} value={regDraft.allergies} onChange={e => setRegDraft({ ...regDraft, allergies: e.target.value })} /></Field>
                <Field label={t.regform.asthma}>
                  <select style={inputStyle} value={regDraft.asthma} onChange={e => setRegDraft({ ...regDraft, asthma: e.target.value })}>
                    <option value="no">{t.regform.no}</option><option value="yes">{t.regform.yes}</option>
                  </select>
                </Field>
                <Field label={t.regform.previousInjury}><input style={inputStyle} value={regDraft.previousInjury} onChange={e => setRegDraft({ ...regDraft, previousInjury: e.target.value })} /></Field>
                <Field label={t.regform.specialDisease}><input style={inputStyle} value={regDraft.specialDisease} onChange={e => setRegDraft({ ...regDraft, specialDisease: e.target.value })} /></Field>
                <Field label={t.regform.onTreatment}>
                  <select style={inputStyle} value={regDraft.onTreatment} onChange={e => setRegDraft({ ...regDraft, onTreatment: e.target.value })}>
                    <option value="no">{t.regform.no}</option><option value="yes">{t.regform.yes}</option>
                  </select>
                </Field>
                {regDraft.onTreatment === "yes" && (
                  <Field label={t.regform.treatmentDetail}><input style={inputStyle} value={regDraft.treatmentDetail} onChange={e => setRegDraft({ ...regDraft, treatmentDetail: e.target.value })} /></Field>
                )}
                <Field label={t.regform.currentMedication}><input style={inputStyle} value={regDraft.currentMedication} onChange={e => setRegDraft({ ...regDraft, currentMedication: e.target.value })} /></Field>
                <Field label={t.regform.otherNotes}><textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={regDraft.otherNotes} onChange={e => setRegDraft({ ...regDraft, otherNotes: e.target.value })} /></Field>
              </div>

              {/* G. Consent */}
              <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, marginTop: 16, boxShadow: "0 1px 3px rgba(11,40,24,0.08)" }}>
                <h3 style={{ marginTop: 0, fontSize: 15 }}>{t.regform.sectionConsent}</h3>
                <Field label={t.regform.parentNameConsent}><input required style={inputStyle} value={regDraft.parentNameConsent} onChange={e => setRegDraft({ ...regDraft, parentNameConsent: e.target.value })} /></Field>
                <p style={{ fontSize: 12.5, color: COLORS.inkSoft, lineHeight: 1.6 }}>{t.regform.consentText}</p>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                  <input type="checkbox" required checked={regDraft.agree} onChange={e => setRegDraft({ ...regDraft, agree: e.target.checked })} />
                  {t.regform.agree}
                </label>
              </div>

              <button type="submit" className="no-print" style={{ width: "100%", marginTop: 20, background: COLORS.orange, color: "#fff", border: "none", borderRadius: 10, padding: "14px 0", fontWeight: 700, fontSize: 15 }}>{t.public.submit}</button>
            </form>
            </div>
          </div>
        )}

        {publicTab === "success" && (
          <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 20px" }}>
            <div style={{ fontSize: 50 }}>✅</div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28 }}>{t.public.successTitle}</h1>
            <p style={{ color: COLORS.inkSoft, fontSize: 14 }}>{t.public.successText}</p>
            <button onClick={() => setPublicTab("home")} style={{ marginTop: 16, background: COLORS.grass, color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700 }}>{t.public.navHome}</button>
          </div>
        )}

        {showAdminLogin && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(11,40,24,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
            <form onSubmit={attemptAdminLogin} style={{ background: "#fff", borderRadius: 16, padding: 26, width: "100%", maxWidth: 340, textAlign: "center" }}>
              <div style={{ fontSize: 30 }}>🔒</div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, margin: "8px 0 2px" }}>{t.login.title}</h2>
              <p style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 0 }}>{t.login.subtitle}</p>
              <label style={{ display: "block", textAlign: "left", fontSize: 12.5, fontWeight: 600, marginTop: 10 }}>{t.login.passwordLabel}
                <input
                  type="password"
                  autoFocus
                  value={loginInput}
                  onChange={e => { setLoginInput(e.target.value); setLoginError(false); }}
                  style={{ ...inputStyle, borderColor: loginError ? COLORS.red : "#DCE3DE" }}
                />
              </label>
              {loginError && <p style={{ color: COLORS.red, fontSize: 12, marginTop: 6 }}>{t.login.error}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button type="button" onClick={() => { setShowAdminLogin(false); setLoginInput(""); setLoginError(false); }} style={{ flex: 1, background: "#EEF1EC", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700 }}>{t.login.cancel}</button>
                <button type="submit" style={{ flex: 1, background: COLORS.grass, color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700 }}>{t.login.submit}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // ADMIN VIEW
  // =========================================================
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: COLORS.chalk, minHeight: "100vh", color: COLORS.ink, display: "flex" }}>
      {globalStyle}

      {/* Sidebar */}
      <div className="sidebar" style={{ width: 220, background: COLORS.pitchDark, color: COLORS.chalk, display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0 }}>
        <div className="brand" style={{ padding: "22px 20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={LOGO_CLEAN} alt="Prima Soccer School Indonesia" style={{ width: 42, height: 34, borderRadius: 6, objectFit: "cover", boxShadow: "0 0 0 1px rgba(255,255,255,0.15)" }} />
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 0.3, color: COLORS.gold, lineHeight: 1.05 }}>{settings.academyName}</div>
          </div>
          <div style={{ fontSize: 11, color: "#9db3a6", marginTop: 6 }}>{t.subtitle}</div>
          <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
            {["fr", "en", "id"].map(l => (
              <button key={l} onClick={() => persistSettings({ ...settings, lang: l })} style={{ background: lang === l ? COLORS.gold : "rgba(255,255,255,0.08)", color: lang === l ? COLORS.pitchDark : "#c7d6cc", border: "none", borderRadius: 6, padding: "4px 9px", fontSize: 11, fontWeight: 700 }}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={() => setView("public")} style={{ marginTop: 12, width: "100%", background: "rgba(255,255,255,0.08)", color: "#c7d6cc", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 11.5, fontWeight: 700 }}>🌐 {t.publicBtn}</button>
          <button onClick={logoutAdmin} style={{ marginTop: 6, width: "100%", background: "rgba(220,80,60,0.15)", color: "#f0b3a8", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 11.5, fontWeight: 700 }}>🔒 {t.logoutBtn}</button>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 10px" }}>
          {[
            { key: "dashboard", label: t.nav.dashboard, icon: "📊" },
            { key: "students", label: t.nav.players, icon: "🧒" },
            { key: "attendance", label: t.nav.attendance, icon: "✅" },
            { key: "payments", label: t.nav.payments, icon: "💳" },
            { key: "registrations", label: t.nav.registrations, icon: "📝", badge: pendingRegs.length },
            { key: "settings", label: t.nav.settings, icon: "⚙️" },
          ].map(item => (
            <button key={item.key} onClick={() => setTab(item.key)} style={{ display: "flex", alignItems: "center", gap: 10, background: tab === item.key ? COLORS.grass : "transparent", color: tab === item.key ? "#fff" : "#c7d6cc", border: "none", borderRadius: 10, padding: "11px 14px", fontSize: 14, fontWeight: 600, textAlign: "left" }}>
              <span>{item.icon}</span> {item.label}
              {!!item.badge && <span style={{ marginLeft: "auto", background: COLORS.orange, color: "#fff", borderRadius: 999, fontSize: 10.5, fontWeight: 700, padding: "1px 7px" }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="brand" style={{ marginTop: "auto", padding: "16px 20px 22px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {settings.website && <div style={{ fontSize: 11, color: "#9db3a6", marginBottom: 6, wordBreak: "break-all" }}>🌐 {settings.website}</div>}
          {(settings.phones || []).filter(Boolean).map((p, i) => <div key={i} style={{ fontSize: 11, color: "#9db3a6" }}>📞 {p}</div>)}
        </div>
      </div>

      {/* Main content */}
      <div className="main-content" style={{ marginLeft: 220, flex: 1, padding: "28px 32px", maxWidth: 1100 }}>

        {tab === "dashboard" && (
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, marginBottom: 4 }}>{t.dashboard.title}</h1>
            <p style={{ color: COLORS.inkSoft, marginTop: 0, marginBottom: 22, fontSize: 13.5 }}>{new Date().toLocaleDateString(LOCALE_CODE[lang], { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 26 }}>
              <StatCard label={t.dashboard.players} value={activeStudents.length} accent={COLORS.grass} />
              <StatCard label={t.dashboard.presentToday} value={presentCountToday} sub={t.dashboard.outOf(activeStudents.length)} accent={COLORS.gold} />
              <StatCard label={t.dashboard.dues(monthLabel(currentMonth(), lang))} value={fmtMoney(monthCollected)} accent="#1B4B63" />
              <StatCard label={t.dashboard.categories} value={categories.length - 1} accent={COLORS.red} />
            </div>
            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(11,40,24,0.08)" }}>
              <h3 style={{ marginTop: 0, fontSize: 15 }}>{t.dashboard.breakdown}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {categories.filter(c => c !== ALL).map(cat => {
                  const count = activeStudents.filter(s => getCategory(s.dateNaissance) === cat).length;
                  const pct = activeStudents.length ? Math.round((count / activeStudents.length) * 100) : 0;
                  return (
                    <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 44 }}><Badge bg={catColor(cat)}>{cat}</Badge></div>
                      <div style={{ flex: 1, background: "#EEF1EC", borderRadius: 6, height: 10, overflow: "hidden" }}><div style={{ width: `${pct}%`, background: catColor(cat), height: "100%" }} /></div>
                      <div style={{ width: 60, fontSize: 12.5, color: COLORS.inkSoft, textAlign: "right" }}>{count} ({pct}%)</div>
                    </div>
                  );
                })}
                {activeStudents.length === 0 && <p style={{ color: COLORS.inkSoft, fontSize: 13 }}>{t.dashboard.noPlayers}</p>}
              </div>
            </div>
          </div>
        )}

        {tab === "students" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, margin: 0 }}>{t.players.title}</h1>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={exportStudentsExcel} style={{ background: "#EEF1EC", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13.5 }}>{t.players.exportBtn}</button>
                <button onClick={openNewStudent} style={{ background: COLORS.grass, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 13.5 }}>{t.players.add}</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.players.search} style={{ flex: "1 1 200px", padding: "10px 14px", borderRadius: 10, border: "1px solid #DCE3DE", fontSize: 13.5 }} />
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #DCE3DE", fontSize: 13.5 }}>
                {categories.map(c => <option key={c} value={c}>{c === ALL ? t.players.all : c}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {filteredStudents.map(s => {
                const cat = getCategory(s.dateNaissance);
                const rec = getPaymentRecord(s.id, currentMonth());
                return (
                  <div key={s.id} style={{ background: COLORS.card, borderRadius: 14, padding: 16, boxShadow: "0 1px 3px rgba(11,40,24,0.08)", borderLeft: `4px solid ${catColor(cat)}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: catColor(cat), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 17 }}>{initials(s.prenom, s.nom)}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{s.prenom} {s.nom}</div>
                        <div style={{ fontSize: 11.5, color: COLORS.inkSoft }}>{computeAge(s.dateNaissance)} {t.players.yearsOld}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                      <Badge bg={catColor(cat)}>{cat}</Badge>
                      <Badge bg={rec.paid ? COLORS.grass : COLORS.red}>{rec.paid ? t.players.upToDate : t.players.unpaidMonth}</Badge>
                    </div>
                    <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 10 }}>👤 {s.parent || "—"} · 📞 {s.telephone || "—"}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={() => openEditStudent(s)} style={{ flex: 1, background: "#EEF1EC", border: "none", borderRadius: 8, padding: "7px 0", fontSize: 12, fontWeight: 600 }}>{t.players.edit}</button>
                      <button onClick={() => deactivateStudent(s.id)} style={{ flex: 1, background: COLORS.redSoft, color: COLORS.red, border: "none", borderRadius: 8, padding: "7px 0", fontSize: 12, fontWeight: 600 }}>{t.players.remove}</button>
                    </div>
                  </div>
                );
              })}
              {filteredStudents.length === 0 && <p style={{ color: COLORS.inkSoft }}>{t.players.noMatch}</p>}
            </div>
          </div>
        )}

        {tab === "attendance" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, margin: 0 }}>{t.attendance.title}</h1>
              <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #DCE3DE", fontSize: 13.5 }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button onClick={() => markAll(true)} style={{ background: COLORS.greenSoft, color: COLORS.grass, border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, fontWeight: 700 }}>{t.attendance.markAllPresent}</button>
              <button onClick={() => markAll(false)} style={{ background: COLORS.redSoft, color: COLORS.red, border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, fontWeight: 700 }}>{t.attendance.markAllAbsent}</button>
              <div style={{ marginLeft: "auto", fontSize: 13, color: COLORS.inkSoft, alignSelf: "center" }}>{t.attendance.presentCount(Object.values(todaysAtt).filter(Boolean).length, activeStudents.length)}</div>
            </div>
            <div style={{ background: COLORS.card, borderRadius: 14, boxShadow: "0 1px 3px rgba(11,40,24,0.08)", overflow: "hidden" }}>
              {activeStudents.length === 0 && <p style={{ padding: 20, color: COLORS.inkSoft }}>{t.attendance.noPlayers}</p>}
              {activeStudents.map((s, i) => {
                const present = !!todaysAtt[s.id];
                return (
                  <div key={s.id} onClick={() => toggleAttendance(s.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: i === 0 ? "none" : "1px solid #F0F1EC", cursor: "pointer", background: present ? COLORS.greenSoft : "transparent" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: catColor(getCategory(s.dateNaissance)), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 13 }}>{initials(s.prenom, s.nom)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.prenom} {s.nom}</div>
                      <div style={{ fontSize: 11, color: COLORS.inkSoft }}>{getCategory(s.dateNaissance)}</div>
                    </div>
                    <Badge bg={present ? COLORS.grass : "#B7BFB9"}>{present ? t.attendance.present : t.attendance.absent}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, margin: 0 }}>{t.payments.title}</h1>
              <input type="month" value={payMonth} onChange={e => setPayMonth(e.target.value)} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #DCE3DE", fontSize: 13.5 }} />
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
              <StatCard label={t.payments.collected(monthLabel(payMonth, lang))} value={fmtMoney(monthCollected)} accent={COLORS.grass} />
              <StatCard label={t.payments.expected} value={fmtMoney(monthExpected)} accent="#1B4B63" />
              <StatCard label={t.payments.remaining} value={fmtMoney(Math.max(monthExpected - monthCollected, 0))} accent={COLORS.red} />
            </div>
            <div style={{ background: COLORS.card, borderRadius: 14, boxShadow: "0 1px 3px rgba(11,40,24,0.08)", overflow: "hidden" }}>
              {activeStudents.length === 0 && <p style={{ padding: 20, color: COLORS.inkSoft }}>{t.payments.noPlayers}</p>}
              {activeStudents.map((s, i) => {
                const rec = getPaymentRecord(s.id, payMonth);
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: i === 0 ? "none" : "1px solid #F0F1EC" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: catColor(getCategory(s.dateNaissance)), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 13 }}>{initials(s.prenom, s.nom)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.prenom} {s.nom}</div>
                      <div style={{ fontSize: 11, color: COLORS.inkSoft }}>{getCategory(s.dateNaissance)} {rec.paid && rec.datePaid ? t.payments.paidOn(rec.datePaid) : ""}</div>
                    </div>
                    <input type="number" value={rec.amount} onChange={e => setPaymentAmount(s.id, e.target.value)} style={{ width: 100, padding: "6px 8px", borderRadius: 8, border: "1px solid #DCE3DE", fontSize: 12.5, fontFamily: "'Roboto Mono', monospace" }} />
                    <button onClick={() => togglePayment(s.id)} style={{ background: rec.paid ? COLORS.grass : COLORS.red, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, minWidth: 90 }}>{rec.paid ? t.payments.paid : t.payments.unpaid}</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "registrations" && (
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, marginBottom: 18 }}>{t.adminReg.title}</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {registrations.length === 0 && <p style={{ color: COLORS.inkSoft }}>{t.adminReg.noRequests}</p>}
              {registrations.map(r => (
                <div key={r.id} style={{ background: COLORS.card, borderRadius: 14, padding: 18, boxShadow: "0 1px 3px rgba(11,40,24,0.08)", borderLeft: `4px solid ${catColor(r.kelas)}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{r.fullName} <Badge bg={catColor(r.kelas)}>{r.kelas}</Badge></div>
                      <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 2 }}>{computeAge(r.birthDate)} {t.players.yearsOld} · {r.phone || r.fatherPhone || r.motherPhone || "—"} · {t.adminReg.submittedOn(new Date(r.submittedAt).toLocaleDateString(LOCALE_CODE[lang]))}</div>
                    </div>
                    <div>
                      {r.status === "pending" && <Badge bg={COLORS.gold} color={COLORS.ink}>{t.adminReg.pending}</Badge>}
                      {r.status === "approved" && <Badge bg={COLORS.grass}>{t.adminReg.approved}</Badge>}
                      {r.status === "rejected" && <Badge bg={COLORS.red}>{t.adminReg.rejected}</Badge>}
                    </div>
                  </div>
                  <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 8 }}>
                    👤 {r.fatherName || "—"} / {r.motherName || "—"} &nbsp;·&nbsp; ✉️ {r.email || "—"} &nbsp;·&nbsp; 🏫 {r.currentSchool || "—"}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={() => setViewingReg(r)} style={{ flex: 1, background: "#EEF1EC", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700 }}>{t.adminReg.viewDetails}</button>
                    {r.status === "pending" && (
                      <>
                        <button onClick={() => { if (window.confirm(t.adminReg.approveConfirm)) approveRegistration(r); }} style={{ flex: 1, background: COLORS.grass, color: "#fff", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700 }}>{t.adminReg.approve}</button>
                        <button onClick={() => rejectRegistration(r)} style={{ flex: 1, background: COLORS.redSoft, color: COLORS.red, border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700 }}>{t.adminReg.reject}</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div style={{ maxWidth: 460 }}>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, marginBottom: 18 }}>{t.settings.title}</h1>

            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(11,40,24,0.08)", display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{t.settings.language}
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  {[{ code: "fr", label: "Français" }, { code: "en", label: "English" }, { code: "id", label: "Bahasa Indonesia" }].map(o => (
                    <button key={o.code} type="button" onClick={() => persistSettings({ ...settings, lang: o.code })} style={{ flex: 1, padding: "9px 6px", borderRadius: 8, border: lang === o.code ? `2px solid ${COLORS.grass}` : "1px solid #DCE3DE", background: lang === o.code ? COLORS.greenSoft : "#fff", fontWeight: 700, fontSize: 12 }}>{o.label}</button>
                  ))}
                </div>
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{t.settings.academyName}
                <input value={settings.academyName} onChange={e => persistSettings({ ...settings, academyName: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{t.settings.fee}
                <input type="number" value={settings.fee} onChange={e => persistSettings({ ...settings, fee: Number(e.target.value) || 0 })} style={inputStyle} />
                <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 3 }}>{fmtMoney(settings.fee)}</div>
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{t.settings.registrationFee}
                <input type="number" value={settings.registrationFee} onChange={e => persistSettings({ ...settings, registrationFee: Number(e.target.value) || 0 })} style={inputStyle} />
                <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 3 }}>{fmtMoney(settings.registrationFee)}</div>
              </label>
              <p style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 4 }}>{t.settings.feeHelp}</p>
            </div>

            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(11,40,24,0.08)", display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>🔒 {t.settings.adminPassword}</h3>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{t.settings.adminPassword}
                <input type="text" value={settings.adminPassword} onChange={e => persistSettings({ ...settings, adminPassword: e.target.value })} style={inputStyle} />
              </label>
              <p style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 0 }}>{t.settings.adminPasswordHelp}</p>
            </div>

            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(11,40,24,0.08)", display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>{t.settings.scheduleTitle}</h3>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{t.settings.session1}
                <input value={settings.session1} onChange={e => persistSettings({ ...settings, session1: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{t.settings.session2}
                <input value={settings.session2} onChange={e => persistSettings({ ...settings, session2: e.target.value })} style={inputStyle} />
              </label>
            </div>

            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(11,40,24,0.08)", display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>{t.settings.contactSocial}</h3>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{t.settings.address}
                <input value={settings.address} onChange={e => persistSettings({ ...settings, address: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{t.settings.website}
                <input value={settings.website} onChange={e => persistSettings({ ...settings, website: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>{t.settings.email}
                <input value={settings.email} onChange={e => persistSettings({ ...settings, email: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>📺 {t.settings.youtube}
                <input value={settings.youtube} onChange={e => persistSettings({ ...settings, youtube: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>🎵 {t.settings.tiktok}
                <input value={settings.tiktok} onChange={e => persistSettings({ ...settings, tiktok: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>📘 {t.settings.facebook}
                <input value={settings.facebook} onChange={e => persistSettings({ ...settings, facebook: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>📷 {t.settings.instagram}
                <input value={settings.instagram} onChange={e => persistSettings({ ...settings, instagram: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>📞 {t.settings.phone1}
                <input value={settings.phones?.[0] || ""} onChange={e => setPhone(0, e.target.value)} style={inputStyle} />
              </label>
              <label style={{ fontSize: 13, fontWeight: 600 }}>📞 {t.settings.phone2}
                <input value={settings.phones?.[1] || ""} onChange={e => setPhone(1, e.target.value)} style={inputStyle} />
              </label>
              <p style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 0 }}>{t.settings.footerHelp}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal: export students */}
      {exportText !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,40,24,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, margin: 0 }}>{t.players.exportModalTitle}</h2>
              <button onClick={() => { setExportText(null); setCopyStatus(""); }} style={{ background: "#EEF1EC", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 700 }}>✕</button>
            </div>
            <p style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 6 }}>{t.players.exportModalHint}</p>
            <textarea
              readOnly
              value={exportText}
              onFocus={e => e.target.select()}
              style={{ width: "100%", height: 220, marginTop: 10, padding: 10, borderRadius: 8, border: "1px solid #DCE3DE", fontFamily: "'Roboto Mono', monospace", fontSize: 11, resize: "vertical" }}
            />
            {copyStatus === "ok" && <p style={{ color: COLORS.grass, fontSize: 12.5, fontWeight: 700, marginTop: 6 }}>{t.players.copiedMsg}</p>}
            {copyStatus === "fail" && <p style={{ color: COLORS.red, fontSize: 12, marginTop: 6 }}>{t.players.copyFailMsg}</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <button onClick={copyExportText} style={{ flex: 1, background: COLORS.grass, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700 }}>{t.players.copyBtn}</button>
              <button onClick={downloadExportFile} style={{ flex: 1, background: COLORS.orange, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700 }}>{t.players.downloadBtn}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: registration detail */}
      {viewingReg && (() => {
        const r = viewingReg;
        const genderLabel = r.gender === "F" ? t.regform.female : t.regform.male;
        const posMap = { goalkeeper: t.regform.posGoalkeeper, defender: t.regform.posDefender, midfielder: t.regform.posMidfielder, forward: t.regform.posForward };
        const expMap = { beginner: t.regform.expBeginner, "1to2": t.regform.exp1to2, more2: t.regform.expMore2 };
        const yn = (v) => v === "yes" ? t.regform.yes : t.regform.no;
        const Row = ({ label, value }) => (value ? (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0", borderBottom: "1px solid #F0F1EC", fontSize: 12.5 }}>
            <span style={{ color: COLORS.inkSoft }}>{label}</span>
            <span style={{ fontWeight: 600, textAlign: "right" }}>{value}</span>
          </div>
        ) : null);
        const Section = ({ title, children }) => (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, color: COLORS.grass, marginBottom: 4 }}>{title}</h4>
            {children}
          </div>
        );
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(11,40,24,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, padding: 16 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, margin: 0 }}>{r.fullName}</h2>
                  <div style={{ marginTop: 4 }}><Badge bg={catColor(r.kelas)}>{r.kelas}</Badge>{" "}
                    {r.status === "pending" && <Badge bg={COLORS.gold} color={COLORS.ink}>{t.adminReg.pending}</Badge>}
                    {r.status === "approved" && <Badge bg={COLORS.grass}>{t.adminReg.approved}</Badge>}
                    {r.status === "rejected" && <Badge bg={COLORS.red}>{t.adminReg.rejected}</Badge>}
                  </div>
                </div>
                <button onClick={() => setViewingReg(null)} style={{ background: "#EEF1EC", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 700 }}>✕</button>
              </div>

              <Section title={t.regform.sectionStudent}>
                <Row label={t.regform.birthPlace} value={r.birthPlace} />
                <Row label={t.regform.birthDate} value={r.birthDate ? `${r.birthDate} (${computeAge(r.birthDate)} ${t.players.yearsOld})` : ""} />
                <Row label={t.regform.gender} value={genderLabel} />
                <Row label={t.regform.nationality} value={r.nationality} />
                <Row label={t.regform.address} value={r.address} />
                <Row label={t.regform.phone} value={r.phone} />
                <Row label={t.regform.email} value={r.email} />
                <Row label={t.regform.currentSchool} value={r.currentSchool} />
                <Row label={t.regform.schoolGrade} value={r.schoolGrade} />
              </Section>

              <Section title={t.regform.sectionParent}>
                <Row label={t.regform.fatherName} value={r.fatherName} />
                <Row label={t.regform.fatherPhone} value={r.fatherPhone} />
                <Row label={t.regform.fatherJob} value={r.fatherJob} />
                <Row label={t.regform.motherName} value={r.motherName} />
                <Row label={t.regform.motherPhone} value={r.motherPhone} />
                <Row label={t.regform.motherJob} value={r.motherJob} />
              </Section>

              <Section title={t.regform.sectionEmergency}>
                <Row label={t.regform.emergencyName} value={r.emergencyName} />
                <Row label={t.regform.emergencyRelation} value={r.emergencyRelation} />
                <Row label={t.regform.emergencyPhone} value={r.emergencyPhone} />
              </Section>

              <Section title={t.regform.sectionSupport}>
                <Row label={t.regform.bloodType} value={r.bloodType} />
                <Row label={t.regform.height} value={r.height} />
                <Row label={t.regform.weight} value={r.weight} />
                <Row label={t.regform.jerseySize} value={r.jerseySize} />
                <Row label={t.regform.jerseyNumber} value={r.jerseyNumber} />
                <Row label={t.regform.shoeSize} value={r.shoeSize} />
              </Section>

              <Section title={t.regform.sectionFootball}>
                <Row label={t.regform.position} value={posMap[r.position]} />
                <Row label={t.regform.experience} value={expMap[r.experience]} />
                <Row label={t.regform.previousClub} value={r.previousClub} />
                <Row label={t.regform.achievements} value={r.achievements} />
              </Section>

              <Section title={t.regform.sectionHealth}>
                <Row label={t.regform.allergies} value={r.allergies} />
                <Row label={t.regform.asthma} value={yn(r.asthma)} />
                <Row label={t.regform.previousInjury} value={r.previousInjury} />
                <Row label={t.regform.specialDisease} value={r.specialDisease} />
                <Row label={t.regform.onTreatment} value={yn(r.onTreatment)} />
                <Row label={t.regform.treatmentDetail} value={r.treatmentDetail} />
                <Row label={t.regform.currentMedication} value={r.currentMedication} />
                <Row label={t.regform.otherNotes} value={r.otherNotes} />
              </Section>

              <Section title={t.regform.sectionConsent}>
                <Row label={t.regform.parentNameConsent} value={r.parentNameConsent} />
                <Row label={t.regform.agree} value={r.agree ? t.regform.yes : t.regform.no} />
              </Section>

              {r.status === "pending" && (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => { if (window.confirm(t.adminReg.approveConfirm)) { approveRegistration(r); setViewingReg(null); } }} style={{ flex: 1, background: COLORS.grass, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700 }}>{t.adminReg.approve}</button>
                  <button onClick={() => { rejectRegistration(r); setViewingReg(null); }} style={{ flex: 1, background: COLORS.redSoft, color: COLORS.red, border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700 }}>{t.adminReg.reject}</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Modal: add/edit student */}
      {showForm && editingStudent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,40,24,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <form onSubmit={saveStudent} style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, marginTop: 0 }}>{editingStudent.id ? t.modal.editTitle : t.modal.addTitle}</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <Field label={t.modal.firstName}><input required style={inputStyle} value={editingStudent.prenom} onChange={e => setEditingStudent({ ...editingStudent, prenom: e.target.value })} /></Field>
              <Field label={t.modal.lastName}><input required style={inputStyle} value={editingStudent.nom} onChange={e => setEditingStudent({ ...editingStudent, nom: e.target.value })} /></Field>
            </div>
            <Field label={t.modal.birthDate}><input required type="date" style={inputStyle} value={editingStudent.dateNaissance} onChange={e => setEditingStudent({ ...editingStudent, dateNaissance: e.target.value })} /></Field>
            <Field label={t.modal.gender}>
              <select style={inputStyle} value={editingStudent.sexe} onChange={e => setEditingStudent({ ...editingStudent, sexe: e.target.value })}>
                <option value="M">{t.modal.male}</option>
                <option value="F">{t.modal.female}</option>
              </select>
            </Field>
            <Field label={t.modal.parent}><input style={inputStyle} value={editingStudent.parent} onChange={e => setEditingStudent({ ...editingStudent, parent: e.target.value })} /></Field>
            <Field label={t.modal.phone}><input style={inputStyle} value={editingStudent.telephone} onChange={e => setEditingStudent({ ...editingStudent, telephone: e.target.value })} /></Field>
            <Field label={t.modal.registrationDate}><input type="date" style={inputStyle} value={editingStudent.dateInscription} onChange={e => setEditingStudent({ ...editingStudent, dateInscription: e.target.value })} /></Field>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button type="button" onClick={() => { setShowForm(false); setEditingStudent(null); }} style={{ flex: 1, background: "#EEF1EC", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700 }}>{t.modal.cancel}</button>
              <button type="submit" style={{ flex: 1, background: COLORS.grass, color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700 }}>{t.modal.save}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
