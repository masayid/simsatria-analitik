/**
 * AUTH.GS
 * Google identity -> USERS -> NPSN -> SCHOOLS
 *
 * Deployment wajib:
 * Execute as: User accessing the web app
 * Who has access: Anyone
 */
const AUTH_CONFIG = {
  USERS_SHEET: "USERS",
  SCHOOLS_SHEET: "SCHOOLS",
  ACTIVE_STATUS: "ACTIVE",
  CACHE_SECONDS: 21600,
};
function normalizeEmail_(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}
function getGoogleUserEmail_() {
  const user = Session.getActiveUser();
  const email = user ? normalizeEmail_(user.getEmail()) : "";
  if (!email) {
    throw new Error(
      "Identitas akun Google tidak dapat diperoleh. " +
        'Pastikan deployment menggunakan "User accessing the web app" ' +
        "dan akun sudah memberikan otorisasi.",
    );
  }
  return email;
}
function getCurrentUserContext() {
  const email = getGoogleUserEmail_();
  const cache = CacheService.getScriptCache();
  const cacheKey = "USER_CONTEXT_V3_" + email.replace(/[^a-zA-Z0-9]/g, "_");
  const cached = cache.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      cache.remove(cacheKey);
    }
  }
  const user = getUserByEmail_(email);
  if (!user) {
    throw new Error(
      'Akun Google "' + email + '" belum terdaftar di SIM SATRIA.',
    );
  }
  const status = String(user.STATUS || "")
    .trim()
    .toUpperCase();
  if (status !== AUTH_CONFIG.ACTIVE_STATUS) {
    throw new Error("Akun SIM SATRIA Anda tidak aktif.");
  }
  const npsn = String(user.NPSN || "").trim();
  if (!npsn) {
    throw new Error("Akun Anda belum memiliki NPSN sekolah.");
  }
  const school = getSchoolByNpsnAuth_(npsn);
  if (!school) {
    throw new Error(
      "Sekolah dengan NPSN " +
        npsn +
        " tidak ditemukan pada registry SIM SATRIA.",
    );
  }
  const schoolStatus = String(school.STATUS || "")
    .trim()
    .toUpperCase();
  if (schoolStatus && schoolStatus !== AUTH_CONFIG.ACTIVE_STATUS) {
    throw new Error("Sekolah Anda tidak aktif pada SIM SATRIA.");
  }
  const spreadsheetId = String(school.SPREADSHEET_ID || "").trim();
  if (!spreadsheetId) {
    throw new Error("Spreadsheet sekolah belum dikonfigurasi.");
  }
  const context = {
    authenticated: true,
    email: email,
    userId: String(user.USER_ID || "").trim(),
    nip: String(user.NIP || "").trim(),
    nama: String(user.NAMA || "").trim(),
    role: String(user.ROLE || "")
      .trim()
      .toUpperCase(),
    npsn: npsn,
    school: {
      npsn: npsn,
      namaSekolah: String(school.NAMA_SEKOLAH || "").trim(),
      spreadsheetId: spreadsheetId,
      driveFolderId: String(school.DRIVE_FOLDER_ID || "").trim(),
      alamat: String(school.ALAMAT || "").trim(),
      logoUrl: String(school.LOGO_URL || "").trim(),
      tagline: String(school.TAGLINE || "").trim(),
      warnaUtama: String(school.WARNA_UTAMA || "").trim(),
      warnaSekunder: String(school.WARNA_SEKUNDER || "").trim(),
    },
  };
  cache.put(cacheKey, JSON.stringify(context), AUTH_CONFIG.CACHE_SECONDS);
  return context;
}
function getUsersSheet_() {
  return getMasterSpreadsheet_().getSheetByName(AUTH_CONFIG.USERS_SHEET);
}
function getSchoolsSheet_() {
  return getMasterSpreadsheet_().getSheetByName(AUTH_CONFIG.SCHOOLS_SHEET);
}
function sheetToObjects_(sheet) {
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) return [];
  const headers = values[0].map((h) =>
    String(h || "")
      .trim()
      .toUpperCase(),
  );
  return values.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });
}
function getUserByEmail_(email) {
  const normalized = normalizeEmail_(email);
  if (!normalized) return null;
  const cache = CacheService.getScriptCache();
  const key = "USER_" + normalized.replace(/[^a-zA-Z0-9]/g, "_");
  const cached = cache.get(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      cache.remove(key);
    }
  }
  const sheet = getUsersSheet_();
  if (!sheet) {
    throw new Error("Sheet USERS tidak ditemukan pada Spreadsheet Master.");
  }
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return null;
  const headers = values[0].map((h) =>
    String(h || "")
      .trim()
      .toUpperCase(),
  );
  const emailIndex = headers.indexOf("EMAIL");
  if (emailIndex === -1) {
    throw new Error("Kolom EMAIL tidak ditemukan di USERS.");
  }
  for (let i = 1; i < values.length; i++) {
    if (normalizeEmail_(values[i][emailIndex]) === normalized) {
      const user = {};
      headers.forEach((h, j) => (user[h] = values[i][j]));
      cache.put(key, JSON.stringify(user), AUTH_CONFIG.CACHE_SECONDS);
      return user;
    }
  }
  return null;
}
function getSchoolByNpsnAuth_(npsn) {
  const normalized = String(npsn || "").trim();
  if (!normalized) return null;
  const cache = CacheService.getScriptCache();
  const key = "SCHOOL_" + normalized;
  const cached = cache.get(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      cache.remove(key);
    }
  }
  const sheet = getSchoolsSheet_();
  if (!sheet) {
    throw new Error("Sheet SCHOOLS tidak ditemukan pada Spreadsheet Master.");
  }
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return null;
  const headers = values[0].map((h) =>
    String(h || "")
      .trim()
      .toUpperCase(),
  );
  const npsnIndex = headers.indexOf("NPSN");
  if (npsnIndex === -1) {
    throw new Error("Kolom NPSN tidak ditemukan di SCHOOLS.");
  }
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][npsnIndex] || "").trim() === normalized) {
      const school = {};
      headers.forEach((h, j) => (school[h] = values[i][j]));
      cache.put(key, JSON.stringify(school), AUTH_CONFIG.CACHE_SECONDS);
      return school;
    }
  }
  return null;
}
function checkAuthentication() {
  try {
    const c = getCurrentUserContext();
    return {
      success: true,
      authenticated: true,
      email: c.email,
      userId: c.userId,
      npsn: c.npsn,
      sekolah: c.school.namaSekolah,
      role: c.role,
    };
  } catch (e) {
    return {
      success: false,
      authenticated: false,
      message: e.message,
    };
  }
}
function clearMyAuthCache() {
  const email = getGoogleUserEmail_();
  const cache = CacheService.getScriptCache();
  const userKey = "USER_CONTEXT_V3_" + email.replace(/[^a-zA-Z0-9]/g, "_");
  cache.remove(userKey);
  cache.remove("USER_" + email.replace(/[^a-zA-Z0-9]/g, "_"));
  const c = getCurrentUserContext();
  cache.remove("SCHOOL_" + c.npsn);
  return { success: true };
}
function refreshMySchoolContext() {
  const email = getGoogleUserEmail_();
  const normalizedEmail = normalizeEmail_(email);
  const cache = CacheService.getScriptCache();
  // =====================================================
  // KEY CACHE
  // =====================================================
  const userContextKey =
    "USER_CONTEXT_V3_" + normalizedEmail.replace(/[^a-zA-Z0-9]/g, "_");
  const userKey = "USER_" + normalizedEmail.replace(/[^a-zA-Z0-9]/g, "_");
  // =====================================================
  // HAPUS CACHE USER
  // =====================================================
  cache.remove(userContextKey);
  cache.remove(userKey);
  // =====================================================
  // BACA USERS LANGSUNG DARI MASTER
  // =====================================================
  const usersSheet = getUsersSheet_();
  const userValues = usersSheet.getDataRange().getValues();
  if (userValues.length < 2) {
    throw new Error("Data USERS kosong.");
  }
  const userHeaders = userValues[0].map(function (header) {
    return String(header || "")
      .trim()
      .toUpperCase();
  });
  const emailIndex = userHeaders.indexOf("EMAIL");
  if (emailIndex === -1) {
    throw new Error("Kolom EMAIL tidak ditemukan di USERS.");
  }
  let user = null;
  for (let i = 1; i < userValues.length; i++) {
    const rowEmail = normalizeEmail_(userValues[i][emailIndex]);
    if (rowEmail === normalizedEmail) {
      user = {};
      userHeaders.forEach(function (header, index) {
        user[header] = userValues[i][index];
      });
      break;
    }
  }
  if (!user) {
    throw new Error('Akun "' + normalizedEmail + '" tidak ditemukan di USERS.');
  }
  // =====================================================
  // NPSN TERBARU
  // =====================================================
  const npsn = String(user.NPSN || "").trim();
  if (!npsn) {
    throw new Error("NPSN akun belum tersedia.");
  }
  // =====================================================
  // HAPUS CACHE SCHOOL
  // =====================================================
  cache.remove("SCHOOL_" + npsn);
  // =====================================================
  // BACA SCHOOLS LANGSUNG DARI MASTER
  // =====================================================
  const schoolsSheet = getSchoolsSheet_();
  const schoolValues = schoolsSheet.getDataRange().getValues();
  if (schoolValues.length < 2) {
    throw new Error("Data SCHOOLS kosong.");
  }
  const schoolHeaders = schoolValues[0].map(function (header) {
    return String(header || "")
      .trim()
      .toUpperCase();
  });
  const npsnIndex = schoolHeaders.indexOf("NPSN");
  if (npsnIndex === -1) {
    throw new Error("Kolom NPSN tidak ditemukan di SCHOOLS.");
  }
  let school = null;
  for (let i = 1; i < schoolValues.length; i++) {
    const rowNpsn = String(schoolValues[i][npsnIndex] || "").trim();
    if (rowNpsn === npsn) {
      school = {};
      schoolHeaders.forEach(function (header, index) {
        school[header] = schoolValues[i][index];
      });
      break;
    }
  }
  if (!school) {
    throw new Error(
      "Sekolah dengan NPSN " + npsn + " tidak ditemukan di SCHOOLS.",
    );
  }
  // =====================================================
  // BUAT CONTEXT BARU
  // =====================================================
  const newContext = {
    authenticated: true,
    email: normalizedEmail,
    userId: String(user.USER_ID || "").trim(),
    nip: String(user.NIP || "").trim(),
    nama: String(user.NAMA || "").trim(),
    role: String(user.ROLE || "")
      .trim()
      .toUpperCase(),
    npsn: npsn,
    school: {
      npsn: npsn,
      namaSekolah: String(school.NAMA_SEKOLAH || "").trim(),
      spreadsheetId: String(school.SPREADSHEET_ID || "").trim(),
      driveFolderId: String(school.DRIVE_FOLDER_ID || "").trim(),
      alamat: String(school.ALAMAT || "").trim(),
      logoUrl: String(school.LOGO_URL || "").trim(),
      tagline: String(school.TAGLINE || "").trim(),
      warnaUtama: String(school.WARNA_UTAMA || "").trim(),
      warnaSekunder: String(school.WARNA_SEKUNDER || "").trim(),
    },
  };
  // =====================================================
  // VALIDASI RESOURCE BARU
  // =====================================================
  if (!newContext.school.spreadsheetId) {
    throw new Error("SPREADSHEET_ID sekolah kosong.");
  }
  if (!newContext.school.driveFolderId) {
    throw new Error("DRIVE_FOLDER_ID sekolah kosong.");
  }
  // =====================================================
  // SIMPAN CONTEXT BARU
  // =====================================================
  cache.put(
    userContextKey,
    JSON.stringify(newContext),
    AUTH_CONFIG.CACHE_SECONDS,
  );
  return {
    success: true,
    message: "School Context berhasil di-refresh dari Master.",
    email: newContext.email,
    npsn: newContext.npsn,
    sekolah: newContext.school.namaSekolah,
    spreadsheetId: newContext.school.spreadsheetId,
    driveFolderId: newContext.school.driveFolderId,
  };
}
