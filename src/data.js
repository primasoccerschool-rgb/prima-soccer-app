import { supabase } from "./supabaseClient";

// ---------- Students ----------
export async function fetchStudents() {
  const { data, error } = await supabase.from("students").select("*").order("prenom");
  if (error) throw error;
  return (data || []).map((s) => ({
    id: s.id,
    prenom: s.prenom,
    nom: s.nom,
    dateNaissance: s.date_naissance,
    sexe: s.sexe,
    parent: s.parent || "",
    telephone: s.telephone || "",
    dateInscription: s.date_inscription,
    actif: s.actif,
  }));
}

export async function upsertStudent(student) {
  const row = {
    prenom: student.prenom,
    nom: student.nom,
    date_naissance: student.dateNaissance,
    sexe: student.sexe,
    parent: student.parent || "",
    telephone: student.telephone || "",
    date_inscription: student.dateInscription,
    actif: student.actif !== false,
  };
  if (student.id) {
    const { error } = await supabase.from("students").update(row).eq("id", student.id);
    if (error) throw error;
    return student.id;
  } else {
    const { data, error } = await supabase.from("students").insert(row).select("id").single();
    if (error) throw error;
    return data.id;
  }
}

export async function deactivateStudentRow(id) {
  const { error } = await supabase.from("students").update({ actif: false }).eq("id", id);
  if (error) throw error;
}

// ---------- Attendance ----------
export async function fetchAllAttendance() {
  const { data, error } = await supabase.from("attendance").select("student_id, date, present");
  if (error) throw error;
  const result = {};
  (data || []).forEach((row) => {
    if (!result[row.date]) result[row.date] = {};
    result[row.date][row.student_id] = row.present;
  });
  return result;
}

export async function setAttendanceCell(studentId, date, present) {
  const { error } = await supabase
    .from("attendance")
    .upsert({ student_id: studentId, date, present }, { onConflict: "student_id,date" });
  if (error) throw error;
}

// ---------- Payments ----------
export async function fetchAllPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select("student_id, month, paid, amount, date_paid");
  if (error) throw error;
  const result = {};
  (data || []).forEach((row) => {
    if (!result[row.student_id]) result[row.student_id] = {};
    result[row.student_id][row.month] = {
      paid: row.paid,
      amount: row.amount,
      datePaid: row.date_paid,
    };
  });
  return result;
}

export async function setPaymentCell(studentId, month, { paid, amount, datePaid }) {
  const { error } = await supabase.from("payments").upsert(
    { student_id: studentId, month, paid, amount, date_paid: datePaid },
    { onConflict: "student_id,month" }
  );
  if (error) throw error;
}

// ---------- Registrations ----------
export async function fetchRegistrations() {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => ({
    id: r.id,
    status: r.status,
    submittedAt: r.submitted_at,
    kelas: r.kelas,
    fullName: r.full_name,
    birthPlace: r.birth_place,
    birthDate: r.birth_date,
    gender: r.gender,
    nationality: r.nationality,
    address: r.address,
    phone: r.phone,
    email: r.email,
    currentSchool: r.current_school,
    schoolGrade: r.school_grade,
    fatherName: r.father_name,
    fatherPhone: r.father_phone,
    fatherJob: r.father_job,
    motherName: r.mother_name,
    motherPhone: r.mother_phone,
    motherJob: r.mother_job,
    emergencyName: r.emergency_name,
    emergencyRelation: r.emergency_relation,
    emergencyPhone: r.emergency_phone,
    bloodType: r.blood_type,
    height: r.height,
    weight: r.weight,
    jerseySize: r.jersey_size,
    jerseyNumber: r.jersey_number,
    shoeSize: r.shoe_size,
    position: r.position,
    experience: r.experience,
    previousClub: r.previous_club,
    achievements: r.achievements,
    allergies: r.allergies,
    asthma: r.asthma,
    previousInjury: r.previous_injury,
    specialDisease: r.special_disease,
    onTreatment: r.on_treatment,
    treatmentDetail: r.treatment_detail,
    currentMedication: r.current_medication,
    otherNotes: r.other_notes,
    parentNameConsent: r.parent_name_consent,
    agree: r.agree,
  }));
}

export async function insertRegistration(reg) {
  const row = {
    status: "pending",
    submitted_at: new Date().toISOString(),
    kelas: reg.kelas,
    full_name: reg.fullName,
    birth_place: reg.birthPlace,
    birth_date: reg.birthDate,
    gender: reg.gender,
    nationality: reg.nationality,
    address: reg.address,
    phone: reg.phone,
    email: reg.email,
    current_school: reg.currentSchool,
    school_grade: reg.schoolGrade,
    father_name: reg.fatherName,
    father_phone: reg.fatherPhone,
    father_job: reg.fatherJob,
    mother_name: reg.motherName,
    mother_phone: reg.motherPhone,
    mother_job: reg.motherJob,
    emergency_name: reg.emergencyName,
    emergency_relation: reg.emergencyRelation,
    emergency_phone: reg.emergencyPhone,
    blood_type: reg.bloodType,
    height: reg.height || null,
    weight: reg.weight || null,
    jersey_size: reg.jerseySize,
    jersey_number: reg.jerseyNumber,
    shoe_size: reg.shoeSize,
    position: reg.position,
    experience: reg.experience,
    previous_club: reg.previousClub,
    achievements: reg.achievements,
    allergies: reg.allergies,
    asthma: reg.asthma,
    previous_injury: reg.previousInjury,
    special_disease: reg.specialDisease,
    on_treatment: reg.onTreatment,
    treatment_detail: reg.treatmentDetail,
    current_medication: reg.currentMedication,
    other_notes: reg.otherNotes,
    parent_name_consent: reg.parentNameConsent,
    agree: reg.agree,
  };
  const { error } = await supabase.from("registrations").insert(row);
  if (error) throw error;
}

export async function updateRegistrationStatus(id, status) {
  const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
  if (error) throw error;
}

// ---------- Settings (single row, id = 1) ----------
export async function fetchSettings() {
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    academyName: data.academy_name,
    fee: data.fee,
    registrationFee: data.registration_fee,
    adminPassword: data.admin_password,
    website: data.website,
    email: data.email,
    address: data.address,
    youtube: data.youtube,
    tiktok: data.tiktok,
    facebook: data.facebook,
    instagram: data.instagram,
    phones: [data.phone1 || "", data.phone2 || ""],
    session1: data.session1,
    session2: data.session2,
    lang: data.lang,
  };
}

export async function updateSettings(settings) {
  const row = {
    id: 1,
    academy_name: settings.academyName,
    fee: settings.fee,
    registration_fee: settings.registrationFee,
    admin_password: settings.adminPassword,
    website: settings.website,
    email: settings.email,
    address: settings.address,
    youtube: settings.youtube,
    tiktok: settings.tiktok,
    facebook: settings.facebook,
    instagram: settings.instagram,
    phone1: settings.phones?.[0] || "",
    phone2: settings.phones?.[1] || "",
    session1: settings.session1,
    session2: settings.session2,
    lang: settings.lang,
  };
  const { error } = await supabase.from("settings").upsert(row, { onConflict: "id" });
  if (error) throw error;
}
