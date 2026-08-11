/**
 * ============================================================
 * SIM SATRIA
 * MASTER CONFIGURATION
 * ============================================================
 *
 * Menyimpan dan mengambil Spreadsheet
 * SIM SATRIA MASTER.
 *
 * Property:
 * MASTER_SPREADSHEET_ID
 * ============================================================
 */


/**
 * ============================================================
 * AMBIL ID SPREADSHEET MASTER
 * ============================================================
 */
function getMasterSpreadsheetId_() {

  const props =
    PropertiesService
      .getScriptProperties();


  const id =
    String(
      props.getProperty(
        'MASTER_SPREADSHEET_ID'
      ) || ''
    ).trim();


  if (!id) {

    throw new Error(
      'MASTER_SPREADSHEET_ID belum dikonfigurasi. ' +
      'Jalankan setupMasterSpreadsheetId() terlebih dahulu.'
    );

  }


  return id;

}


/**
 * ============================================================
 * SET ID SPREADSHEET MASTER
 * ============================================================
 *
 * Jalankan SATU KALI secara manual dari Apps Script.
 *
 * GANTI ID DI BAWAH dengan ID Spreadsheet:
 * SIM SATRIA MASTER
 * ============================================================
 */
function setupMasterSpreadsheetId() {

  const MASTER_ID =
    '1o7l24gGB7rXsjyFJJw1plz_0ud-V74USqyLQsFbZmS0';


  if (
    !MASTER_ID ||
    MASTER_ID ===
      '1o7l24gGB7rXsjyFJJw1plz_0ud-V74USqyLQsFbZmS0'
  ) {

    throw new Error(
      'Silakan isi MASTER_ID dengan ID Spreadsheet SIM SATRIA MASTER.'
    );

  }


  /*
   * Validasi bahwa spreadsheet
   * benar-benar dapat dibuka.
   */

  const ss =
    SpreadsheetApp.openById(
      MASTER_ID
    );


  const sheet =
    ss.getSheetByName(
      'schools'
    );


  if (!sheet) {

    throw new Error(
      'Spreadsheet MASTER berhasil dibuka, ' +
      'tetapi sheet "schools" tidak ditemukan.'
    );

  }


  /*
   * Simpan ke Script Properties.
   */

  PropertiesService
    .getScriptProperties()
    .setProperty(
      'MASTER_SPREADSHEET_ID',
      MASTER_ID
    );


  return {

    success:
      true,

    message:
      'Spreadsheet SIM SATRIA MASTER berhasil dikonfigurasi.',

    spreadsheetId:
      MASTER_ID,

    spreadsheetName:
      ss.getName(),

    sheet:
      'schools'

  };

}


/**
 * ============================================================
 * TEST MASTER
 * ============================================================
 */
function testMasterSpreadsheet() {

  const masterId =
    getMasterSpreadsheetId_();


  const ss =
    SpreadsheetApp.openById(
      masterId
    );


  const sheet =
    ss.getSheetByName(
      'schools'
    );


  return {

    success:
      true,

    spreadsheetId:
      masterId,

    spreadsheetName:
      ss.getName(),

    sheet:
      sheet.getName(),

    lastRow:
      sheet.getLastRow(),

    lastColumn:
      sheet.getLastColumn()

  };

}