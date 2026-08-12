/**
 * SIM SATRIA - MANAJEMEN PENGGUNA SEKOLAH
 *
 * Hanya ADMIN_SEKOLAH yang boleh mengelola pengguna pada spreadsheet
 * sekolah aktif. Data pengguna disimpan lokal pada sheet USERS sekolah.
 */
const USER_MANAGEMENT_CONFIG = {
  SHEET: "USERS",
  ALLOWED_ROLES: ["GURU", "WALI_KELAS", "KARYAWAN"],
  ACTIVE_STATUS: "ACTIVE",
};

function requireUserManager_() {
  const context = getCurrentUserContext();
  if (normalizeRole_(context.role) !== "ADMIN_SEKOLAH") {
    throw new Error("Menu Manajemen Pengguna hanya dapat digunakan oleh ADMIN_SEKOLAH.");
  }
  return context;
}

function getUserManagementView() {
  requireUserManager_();
  return {
    success: true,
    html: HtmlService.createHtmlOutputFromFile("manajemenPengguna").getContent(),
    js: HtmlService.createHtmlOutputFromFile("manajemenPengguna_js").getContent(),
  };
}

function getSchoolUsers() {
  const context = requireUserManager_();
  const sheet = getOrCreateUsersSheet_(context.school.spreadsheetId);
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return { success: true, users: [], npsn: context.npsn, sekolah: context.school.namaSekolah };

  const headers = values[0].map(normalizeHeader_);
  const index = {};
  headers.forEach(function (h, i) { index[h] = i; });

  const users = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const email = String(row[index.EMAIL] || "").trim().toLowerCase();
    if (!email) continue;
    users.push({
      rowNumber: i + 1,
      userId: String(row[index.USER_ID] || "").trim(),
      email: email,
      nip: String(row[index.NIP] || "").trim(),
      nama: String(row[index.NAMA] || "").trim(),
      role: String(row[index.ROLE] || "").trim().toUpperCase(),
      status: String(row[index.STATUS] || "").trim().toUpperCase(),
    });
  }

  users.sort(function (a, b) {
    return String(a.nama || a.email).localeCompare(String(b.nama || b.email), "id", { sensitivity: "base" });
  });

  return {
    success: true,
    users: users,
    npsn: context.npsn,
    sekolah: context.school.namaSekolah,
  };
}

function saveSchoolUser(user) {
  const context = requireUserManager_();
  user = user || {};

  const email = normalizeEmail_(user.email);
  const nip = String(user.nip || "").trim();
  const nama = String(user.nama || "").trim();
  const role = normalizeRole_(user.role || "GURU");
  const status = normalizeRole_(user.status || "ACTIVE");

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Email guru tidak valid.");
  if (!nama) throw new Error("Nama pengguna wajib diisi.");
  if (!USER_MANAGEMENT_CONFIG.ALLOWED_ROLES.includes(role)) {
    throw new Error("Role tidak diizinkan untuk dikelola oleh ADMIN_SEKOLAH.");
  }
  if (!["ACTIVE", "INACTIVE"].includes(status)) throw new Error("Status pengguna tidak valid.");
  if (email === normalizeEmail_(context.email)) throw new Error("Akun ADMIN_SEKOLAH sendiri tidak boleh diubah melalui menu ini.");

  const sheet = getOrCreateUsersSheet_(context.school.spreadsheetId);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(normalizeHeader_);
  const index = {};
  headers.forEach(function (h, i) { index[h] = i; });

  let targetRow = -1;
  let existingUserId = "";
  for (let i = 1; i < values.length; i++) {
    if (normalizeEmail_(values[i][index.EMAIL]) === email) {
      targetRow = i + 1;
      existingUserId = String(values[i][index.USER_ID] || "").trim();
      break;
    }
  }

  const userId = existingUserId || "USR-" + Utilities.getUuid().replace(/-/g, "").substring(0, 12).toUpperCase();
  const row = new Array(headers.length).fill("");
  row[index.USER_ID] = userId;
  row[index.EMAIL] = email;
  row[index.NIP] = nip;
  row[index.NAMA] = nama;
  row[index.ROLE] = role;
  row[index.STATUS] = status;

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, headers.length).setValues([row]);
  } else {
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length).setValues([row]);
  }

  clearUserContextCache_(email);
  return {
    success: true,
    action: targetRow > 0 ? "UPDATED" : "CREATED",
    userId: userId,
    email: email,
    npsn: context.npsn,
    sekolah: context.school.namaSekolah,
  };
}

function deleteSchoolUser(email) {
  const context = requireUserManager_();
  email = normalizeEmail_(email);
  if (!email) throw new Error("Email pengguna wajib diisi.");
  if (email === normalizeEmail_(context.email)) throw new Error("Akun Anda sendiri tidak boleh dihapus.");

  const sheet = getOrCreateUsersSheet_(context.school.spreadsheetId);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) throw new Error("Pengguna tidak ditemukan.");

  const headers = values[0].map(normalizeHeader_);
  const emailIndex = headers.indexOf("EMAIL");
  const roleIndex = headers.indexOf("ROLE");
  if (emailIndex < 0 || roleIndex < 0) throw new Error("Struktur USERS tidak lengkap.");

  for (let i = 1; i < values.length; i++) {
    if (normalizeEmail_(values[i][emailIndex]) !== email) continue;
    const role = normalizeRole_(values[i][roleIndex]);
    if (!USER_MANAGEMENT_CONFIG.ALLOWED_ROLES.includes(role)) {
      throw new Error("Hanya pengguna GURU/WALI_KELAS/KARYAWAN yang dapat dihapus melalui menu ini.");
    }
    sheet.deleteRow(i + 1);
    clearUserContextCache_(email);
    return { success: true, email: email, npsn: context.npsn, sekolah: context.school.namaSekolah };
  }

  throw new Error("Pengguna dengan email " + email + " tidak ditemukan.");
}

function setSchoolUserStatus(email, status) {
  const context = requireUserManager_();
  email = normalizeEmail_(email);
  status = normalizeRole_(status);
  if (!["ACTIVE", "INACTIVE"].includes(status)) throw new Error("Status tidak valid.");
  if (email === normalizeEmail_(context.email)) throw new Error("Status akun Admin Sekolah sendiri tidak dapat diubah di sini.");

  const sheet = getOrCreateUsersSheet_(context.school.spreadsheetId);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(normalizeHeader_);
  const emailIndex = headers.indexOf("EMAIL");
  const statusIndex = headers.indexOf("STATUS");
  if (emailIndex < 0 || statusIndex < 0) throw new Error("Struktur USERS tidak lengkap.");

  for (let i = 1; i < values.length; i++) {
    if (normalizeEmail_(values[i][emailIndex]) === email) {
      sheet.getRange(i + 1, statusIndex + 1).setValue(status);
      clearUserContextCache_(email);
      return { success: true, email: email, status: status };
    }
  }
  throw new Error("Pengguna tidak ditemukan.");
}

function getOrCreateUsersSheet_(spreadsheetId) {
  if (!spreadsheetId) throw new Error("Spreadsheet sekolah aktif tidak ditemukan.");
  const ss = SpreadsheetApp.openById(spreadsheetId);
  let sheet = ss.getSheetByName(USER_MANAGEMENT_CONFIG.SHEET);
  if (!sheet) sheet = ss.insertSheet(USER_MANAGEMENT_CONFIG.SHEET);
  ensureLocalHeaders_(sheet, ["USER_ID", "EMAIL", "NIP", "NAMA", "ROLE", "STATUS"]);
  return sheet;
}

function clearUserContextCache_(email) {
  const safe = normalizeEmail_(email).replace(/[^a-zA-Z0-9]/g, "_");
  CacheService.getScriptCache().remove("USER_CONTEXT_V4_" + safe);
  CacheService.getScriptCache().remove("LOCAL_USER_" + safe);
}
