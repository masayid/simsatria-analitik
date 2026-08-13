/**
 * SCHOOL REGISTRY
 *
 * MASTER dibaca LANGSUNG oleh akun pengguna yang sedang mengakses Web App.
 * Deployment WAJIB: Execute as = User accessing the web app.
 *
 * ADMIN_SEKOLAH maupun GURU memakai identitas Session.getActiveUser().
 * Karena itu setiap akun yang perlu autentikasi harus memiliki akses minimal
 * Viewer ke Spreadsheet MASTER.
 *
 * Database sekolah tetap diambil dari School Context; frontend tidak boleh
 * memilih spreadsheet sekolah secara langsung.
 */
function getMasterSpreadsheet_() {
  const id = getMasterSpreadsheetId_();
  if (!id) throw new Error("MASTER_SPREADSHEET_ID belum dikonfigurasi.");

  try {
    return SpreadsheetApp.openById(id);
  } catch (e) {
    throw new Error(
      "Akun pengguna tidak dapat membaca Spreadsheet MASTER. Pastikan akun Google yang digunakan untuk Web App memiliki akses minimal Viewer ke MASTER. Detail: " +
        e.message,
    );
  }
}

function getMasterAdminSheet_() {
  const sheet = getMasterSpreadsheet_().getSheetByName("ADMIN_SEKOLAH");
  if (!sheet) throw new Error("Sheet ADMIN_SEKOLAH tidak ditemukan pada MASTER.");
  return sheet;
}

function getMasterSchoolsSheet_() {
  const ss = getMasterSpreadsheet_();
  const sheet = ss.getSheetByName("SCHOOLS") || ss.getSheetByName("schools");
  if (!sheet) throw new Error("Sheet SCHOOLS tidak ditemukan pada MASTER.");
  return sheet;
}

function getSchoolByNpsn(npsn) {
  const school = getSchoolByNpsnAuth_(npsn);
  if (!school) throw new Error("Sekolah tidak ditemukan.");
  return school;
}

function getSchoolByNpsnDirect_(npsn) {
  const target = normalizeNpsn_(npsn);
  if (!target) return null;
  const rows = sheetValuesToObjects_(getMasterSchoolsSheet_());
  return rows.find(row => normalizeNpsn_(row.NPSN) === target) || null;
}
