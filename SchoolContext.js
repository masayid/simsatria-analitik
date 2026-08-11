/**
 * SCHOOL CONTEXT
 * Semua modul bisnis mengambil sekolah dari context server.
 */
function getSchoolContext() {
  return getCurrentUserContext().school;
}
function getSchoolSpreadsheet_() {
  const school = getSchoolContext();
  if (!school.spreadsheetId) {
    throw new Error("SPREADSHEET_ID sekolah belum dikonfigurasi.");
  }
  return SpreadsheetApp.openById(school.spreadsheetId);
}
function getSchoolSheet_(sheetName) {
  const ss = getSchoolSpreadsheet_();
  const sh = ss.getSheetByName(sheetName);
  if (!sh) {
    throw new Error(
      'Sheet "' + sheetName + '" tidak ditemukan pada Spreadsheet sekolah.',
    );
  }
  return sh;
}
function getSchoolContextInfo() {
  const c = getCurrentUserContext();
  return {
    success: true,
    email: c.email,
    userId: c.userId,
    nip: c.nip,
    nama: c.nama,
    role: c.role,
    npsn: c.npsn,
    sekolah: c.school.namaSekolah,
    spreadsheetId: c.school.spreadsheetId,
    driveFolderId: c.school.driveFolderId,
  };
}
