/************************************************************
 * SIM SATRIA CORE
 * MULTI-SCHOOL PLATFORM
 *
 * FASE 1
 * School Context Architecture
 *
 * File : Code.gs
 ************************************************************/
const SATRIA_CONFIG = {
  APP_NAME: 'SIM SATRIA',
  VERSION: '1.0.0',
  MASTER_SHEET_NAME: 'SCHOOLS',
  DEFAULT_PRIMARY: '#0B3D2E',
  DEFAULT_SECONDARY: '#2E7D32'
};
/**
 * ==========================================================
 * WEB APP
 * ==========================================================
 */
function doGet() {
  return HtmlService
    .createTemplateFromFile('index')
    .evaluate()
    .setTitle(SATRIA_CONFIG.APP_NAME)
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}
/**
 * ==========================================================
 * INCLUDE HTML
 * ==========================================================
 */
function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}
/**
 * ==========================================================
 * SYSTEM INFORMATION
 * ==========================================================
 */
function getSystemInfo() {
  return {
    appName:
      SATRIA_CONFIG.APP_NAME,
    version:
      SATRIA_CONFIG.VERSION,
    timestamp:
      new Date().toISOString()
  };
}
/**
 * ==========================================================
 * INITIALIZE MASTER
 * ==========================================================
 *
 * Jalankan fungsi ini satu kali setelah Spreadsheet
 * MASTER dibuat.
 *
 * Cara:
 *
 * 1. Buka Spreadsheet SIM SATRIA MASTER
 * 2. Salin ID Spreadsheet
 * 3. Masukkan ke fungsi di bawah
 * 4. Run
 *
 */
function setupMasterConnection() {
  const spreadsheetId =
    '1o7l24gGB7rXsjyFJJw1plz_0ud-V74USqyLQsFbZmS0';
  PropertiesService
    .getScriptProperties()
    .setProperty(
      'MASTER_SPREADSHEET_ID',
      spreadsheetId
    );
  Logger.log(
    'Master berhasil dikonfigurasi.'
  );
}
function setMasterSpreadsheetId(spreadsheetId) {
  if (!spreadsheetId) {
    throw new Error(
      'Spreadsheet ID MASTER wajib diisi.'
    );
  }
  PropertiesService
    .getScriptProperties()
    .setProperty(
      'MASTER_SPREADSHEET_ID',
      String(spreadsheetId).trim()
    );
  return {
    success: true,
    spreadsheetId:
      String(spreadsheetId).trim()
  };
}
/**
 * ==========================================================
 * GET MASTER SPREADSHEET ID
 * ==========================================================
 */
function getMasterSpreadsheetId_() {
  const id =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        'MASTER_SPREADSHEET_ID'
      );
  if (!id) {
    throw new Error(
      'MASTER_SPREADSHEET_ID belum dikonfigurasi.'
    );
  }
  return String(id).trim();
}
/**
 * ==========================================================
 * SETUP MASTER SHEET
 * ==========================================================
 *
 * Fungsi ini membuat sheet SCHOOLS beserta header.
 *
 */
function setupMasterSheet() {
  const master =
    SpreadsheetApp.openById(
      getMasterSpreadsheetId_()
    );
  let sheet =
    master.getSheetByName(
      SATRIA_CONFIG.MASTER_SHEET_NAME
    );
  if (!sheet) {
    sheet =
      master.insertSheet(
        SATRIA_CONFIG.MASTER_SHEET_NAME
      );
  }
  const headers = [
    'NPSN',
    'NAMA_SEKOLAH',
    'KEPALA_SEKOLAH',
    'ALAMAT',
    'LOGO_URL',
    'TAGLINE',
    'WARNA_UTAMA',
    'WARNA_SEKUNDER',
    'SPREADSHEET_ID',
    'DRIVE_FOLDER_ID',
    'STATUS',
    'CREATED_AT'
  ];
  sheet
    .getRange(
      1,
      1,
      1,
      headers.length
    )
    .setValues([headers]);
  sheet
    .getRange(
      1,
      1,
      1,
      headers.length
    )
    .setFontWeight('bold');
  sheet.setFrozenRows(1);
  return {
    success: true,
    sheetName:
      sheet.getName(),
    headers:
      headers
  };
}
/**
 * ==========================================================
 * SYSTEM HEALTH CHECK
 * ==========================================================
 */
function systemHealthCheck() {
  const result = {
    app: SATRIA_CONFIG.APP_NAME,
    version:
      SATRIA_CONFIG.VERSION,
    master: false,
    schoolCount: 0,
    timestamp:
      new Date().toISOString()
  };
  try {
    const master =
      SpreadsheetApp.openById(
        getMasterSpreadsheetId_()
      );
    result.master = true;
    const sheet =
      master.getSheetByName(
        SATRIA_CONFIG.MASTER_SHEET_NAME
      );
    if (sheet) {
      result.schoolCount =
        Math.max(
          0,
          sheet.getLastRow() - 1
        );
    }
  } catch (error) {
    result.error =
      error.message;
  }
  return result;
}