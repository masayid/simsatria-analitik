/************************************************************
 * SIM SATRIA CORE
 * SCHOOL REGISTRY
 *
 * File : SchoolRegistry.gs
 ************************************************************/
/**
 * ==========================================================
 * GET MASTER
 * ==========================================================
 */
function getMasterSpreadsheet_() {
  return SpreadsheetApp.openById(
    getMasterSpreadsheetId_()
  );
}
/**
 * ==========================================================
 * GET SCHOOL REGISTRY SHEET
 * ==========================================================
 */
function getSchoolRegistrySheet_() {
  const master =
    getMasterSpreadsheet_();
  const sheet =
    master.getSheetByName(
      SATRIA_CONFIG.MASTER_SHEET_NAME
    );
  if (!sheet) {
    throw new Error(
      'Sheet SCHOOLS tidak ditemukan. ' +
      'Jalankan setupMasterSheet() terlebih dahulu.'
    );
  }
  return sheet;
}
/**
 * ==========================================================
 * READ REGISTRY
 * ==========================================================
 */
function getSchoolRegistryData_() {
  const sheet =
    getSchoolRegistrySheet_();
  const values =
    sheet.getDataRange().getValues();
  if (
    !values ||
    values.length < 2
  ) {
    return [];
  }
  const headers =
    values[0].map(function(header) {
      return String(header).trim();
    });
  return values
    .slice(1)
    .filter(function(row) {
      return row.some(function(value) {
        return String(value).trim() !== '';
      });
    })
    .map(function(row) {
      const school = {};
      headers.forEach(
        function(header, index) {
          school[header] =
            row[index];
        }
      );
      return school;
    });
}
/**
 * ==========================================================
 * GET SCHOOL BY NPSN
 * ==========================================================
 */
function getSchoolByNpsn_(npsn) {
  if (!npsn) {
    return null;
  }
  const normalized =
    String(npsn)
      .trim();
  const schools =
    getSchoolRegistryData_();
  for (
    let i = 0;
    i < schools.length;
    i++
  ) {
    const school =
      schools[i];
    if (
      String(school.NPSN)
        .trim() === normalized
    ) {
      return school;
    }
  }
  return null;
}
/**
 * ==========================================================
 * CHECK SCHOOL
 * ==========================================================
 */
function schoolExists_(npsn) {
  return !!getSchoolByNpsn_(npsn);
}
/**
 * ==========================================================
 * REGISTER SCHOOL
 * ==========================================================
 *
 * Fungsi ini:
 *
 * 1. Membuat Spreadsheet sekolah
 * 2. Membuat Folder Drive sekolah
 * 3. Membuat struktur sheet dasar
 * 4. Mendaftarkan sekolah ke SCHOOLS
 *
 */
function registerSchool(data) {
  if (!data) {
    throw new Error(
      'Data sekolah tidak ditemukan.'
    );
  }
  const npsn =
    String(data.npsn || '')
      .trim();
  const namaSekolah =
    String(data.namaSekolah || '')
      .trim();
  if (!npsn) {
    throw new Error(
      'NPSN wajib diisi.'
    );
  }
  if (!namaSekolah) {
    throw new Error(
      'Nama sekolah wajib diisi.'
    );
  }
  if (schoolExists_(npsn)) {
    throw new Error(
      'NPSN ' +
      npsn +
      ' sudah terdaftar.'
    );
  }
  /*
   * --------------------------------------------------------
   * CREATE SPREADSHEET
   * --------------------------------------------------------
   */
  const spreadsheet =
    SpreadsheetApp.create(
      'SIM SATRIA - ' +
      namaSekolah +
      ' - ' +
      npsn
    );
  /*
   * --------------------------------------------------------
   * CREATE DRIVE FOLDER
   * --------------------------------------------------------
   */
  const folder =
    DriveApp.createFolder(
      'SIM SATRIA - ' +
      namaSekolah +
      ' - ' +
      npsn
    );
  /*
   * --------------------------------------------------------
   * INITIALIZE DATABASE
   * --------------------------------------------------------
   */
  initializeSchoolDatabase_(
    spreadsheet
  );
  initializeMasterDataSheets_(
  spreadsheet
  );
  /*
   * --------------------------------------------------------
   * INITIALIZE DRIVE
   * --------------------------------------------------------
   */
  initializeSchoolDrive_(
    folder
  );
  /*
   * --------------------------------------------------------
   * SAVE REGISTRY
   * --------------------------------------------------------
 */
  const sheet =
    getSchoolRegistrySheet_();
  sheet.appendRow([
    npsn,
    namaSekolah,
    String(
      data.kepalaSekolah || ''
    ),
    String(
      data.alamat || ''
    ),
    String(
      data.logoUrl || ''
    ),
    String(
      data.tagline || ''
    ),
    String(
      data.warnaUtama ||
      SATRIA_CONFIG.DEFAULT_PRIMARY
    ),
    String(
      data.warnaSekunder ||
      SATRIA_CONFIG.DEFAULT_SECONDARY
    ),
    spreadsheet.getId(),
    folder.getId(),
    'ACTIVE',
    new Date()
  ]);
  return {
    success: true,
    npsn:
      npsn,
    namaSekolah:
      namaSekolah,
    spreadsheetId:
      spreadsheet.getId(),
    spreadsheetUrl:
      spreadsheet.getUrl(),
    folderId:
      folder.getId(),
    folderUrl:
      folder.getUrl(),
    status:
      'ACTIVE'
  };
}
/**
 * ==========================================================
 * LIST SCHOOLS
 * ==========================================================
 */
function getAllSchools() {
  return getSchoolRegistryData_()
    .map(function(school) {
      return {
        npsn:
          String(
            school.NPSN || ''
          ),
        namaSekolah:
          String(
            school.NAMA_SEKOLAH || ''
          ),
        status:
          String(
            school.STATUS || ''
          ),
        spreadsheetId:
          String(
            school.SPREADSHEET_ID || ''
          ),
        driveFolderId:
          String(
            school.DRIVE_FOLDER_ID || ''
          )
      };
    });
}
/**
 * ==========================================================
 * SET SCHOOL STATUS
 * ==========================================================
 */
function setSchoolStatus(
  npsn,
  status
) {
  const sheet =
    getSchoolRegistrySheet_();
  const values =
    sheet.getDataRange().getValues();
  const headers =
    values[0];
  const npsnIndex =
    headers.indexOf('NPSN');
  const statusIndex =
    headers.indexOf('STATUS');
  if (
    npsnIndex === -1 ||
    statusIndex === -1
  ) {
    throw new Error(
      'Struktur SCHOOLS tidak sesuai.'
    );
  }
  for (
    let i = 1;
    i < values.length;
    i++
  ) {
    if (
      String(values[i][npsnIndex])
        .trim() ===
      String(npsn)
        .trim()
    ) {
      sheet
        .getRange(
          i + 1,
          statusIndex + 1
        )
        .setValue(
          String(status)
            .toUpperCase()
        );
      return {
        success: true,
        npsn:
          String(npsn),
        status:
          String(status)
            .toUpperCase()
      };
    }
  }
  throw new Error(
    'NPSN tidak ditemukan.'
  );
}
function testRegisterSchool() {
  const result =
    registerSchool({
      npsn:
        '20312345',
      namaSekolah:
        'SMA Negeri 2 Sukorejo',
      kepalaSekolah:
        'Nama Kepala Sekolah',
      alamat:
        'Alamat SMA Negeri 2 Sukorejo',
      logoUrl:
        '',
      tagline:
        'Mulai Berakhlak - Hebat Berkarya',
      warnaUtama:
        '#0B3D2E',
      warnaSekunder:
        '#2E7D32'
    });
  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
  return result;
}
function testRegisterSchoolB() {
  return registerSchool({
    npsn:
      '20367890',
    namaSekolah:
      'SMA Negeri X',
    kepalaSekolah:
      'Kepala Sekolah X',
    alamat:
      'Alamat Sekolah X',
    logoUrl:
      '',
    tagline:
      'Sekolah Digital',
    warnaUtama:
      '#1565C0',
    warnaSekunder:
      '#42A5F5'
  });
}
function upgradeExistingSchoolMasterData(
  npsn
) {
  const school =
    getSchoolByNpsn_(
      npsn
    );
  if (!school) {
    throw new Error(
      'Sekolah tidak ditemukan.'
    );
  }
  const spreadsheet =
    SpreadsheetApp.openById(
      school.SPREADSHEET_ID
    );
  initializeMasterDataSheets_(
    spreadsheet
  );
  return {
    success: true,
    npsn:
      npsn,
    sekolah:
      school.NAMA_SEKOLAH,
    spreadsheetId:
      spreadsheet.getId()
  };
}
function testUpgradeSekolahA() {
  return upgradeExistingSchoolMasterData(
    '20312345'
  );
}
function testUpgradeSekolahB() {
  return upgradeExistingSchoolMasterData(
    '20367890'
  );
}
