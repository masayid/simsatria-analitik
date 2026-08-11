/**
 * SCHOOL REGISTRY
 * MASTER_SPREADSHEET_ID disimpan di Script Properties.
 */
function getMasterSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty(
    "MASTER_SPREADSHEET_ID",
  );
  if (!id) {
    throw new Error(
      "MASTER_SPREADSHEET_ID belum dikonfigurasi pada Script Properties.",
    );
  }
  return SpreadsheetApp.openById(id);
}
function setMasterSpreadsheetId(id) {
  id = String(id || "").trim();
  if (!id) {
    throw new Error("ID Spreadsheet Master wajib diisi.");
  }
  SpreadsheetApp.openById(id);
  PropertiesService.getScriptProperties().setProperty(
    "MASTER_SPREADSHEET_ID",
    id,
  );
  return {
    success: true,
    spreadsheetId: id,
  };
}
function getSchoolByNpsn(npsn) {
  const school = getSchoolByNpsnAuth_(npsn);
  if (!school) {
    throw new Error("Sekolah tidak ditemukan.");
  }
  return school;
}
