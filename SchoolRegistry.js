/*
 * SCHOOL REGISTRY
 *
 * MASTER_SPREADSHEET_ID disimpan di Script Properties.
 *
 * Login tidak lagi mensyaratkan akun aktif memiliki akses MASTER.
 * Jika MASTER dapat dibuka, data admin/sekolah dibaca langsung dari MASTER.
 * Registry lokal hanya fallback/cache untuk kondisi MASTER tidak dapat diakses.
 */
function getMasterSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("MASTER_SPREADSHEET_ID");
  if (!id) throw new Error("MASTER_SPREADSHEET_ID belum dikonfigurasi pada Script Properties.");
  return SpreadsheetApp.openById(id);
}

function createLocalMasterRegistryProxy_() {
  return {
    getSheetByName: function(sheetName) {
      const normalized = String(sheetName || "").trim().toUpperCase();
      if (normalized === "ADMIN_SEKOLAH") return createLocalRegistrySheet_("ADMIN");
      if (normalized === "SCHOOLS") return createLocalRegistrySheet_("SCHOOLS");
      return null;
    }
  };
}

function createLocalRegistrySheet_(type) {
  const props = PropertiesService.getScriptProperties();
  const prefix = type === "ADMIN" ? MASTER_AUTH_REGISTRY.ADMIN_PREFIX : MASTER_AUTH_REGISTRY.SCHOOL_PREFIX;
  const all = props.getProperties();
  const rows = [];

  Object.keys(all).forEach(function(key) {
    if (key.indexOf(prefix) !== 0) return;
    try { rows.push(JSON.parse(all[key])); } catch (e) {}
  });

  const headers = type === "ADMIN"
    ? ["USER_ID","EMAIL","NIP","NAMA","NPSN","ROLE","STATUS"]
    : ["NPSN","NAMA_SEKOLAH","STATUS","SPREADSHEET_ID","DRIVE_FOLDER_ID","ALAMAT","LOGO_URL","TAGLINE","WARNA_UTAMA","WARNA_SEKUNDER"];

  const values = [headers];
  rows.forEach(function(row) {
    values.push(headers.map(function(header) {
      return row[header] === undefined ? "" : row[header];
    }));
  });

  return {
    getDataRange: function() { return { getValues: function() { return values; } }; },
    getLastRow: function() { return values.length; },
    getLastColumn: function() { return headers.length; },
    getName: function() { return type === "ADMIN" ? "ADMIN_SEKOLAH" : "SCHOOLS"; }
  };
}

function setMasterSpreadsheetId(id) {
  id = String(id || "").trim();
  if (!id) throw new Error("ID Spreadsheet Master wajib diisi.");
  SpreadsheetApp.openById(id);
  PropertiesService.getScriptProperties().setProperty("MASTER_SPREADSHEET_ID", id);
  return { success: true, spreadsheetId: id };
}

function getSchoolByNpsn(npsn) {
  const school = getSchoolByNpsnAuth_(npsn);
  if (!school) throw new Error("Sekolah tidak ditemukan.");
  return school;
}
