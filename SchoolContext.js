/************************************************************
 * SIM SATRIA CORE
 * SCHOOL CONTEXT
 *
 * File : SchoolContext.gs
 ************************************************************/


/**
 * ==========================================================
 * NORMALIZE NPSN
 * ==========================================================
 */

function normalizeNpsn_(npsn) {

  return String(
    npsn || ''
  )
    .trim()
    .replace(/\s+/g, '');

}


/**
 * ==========================================================
 * VALIDATE NPSN FORMAT
 * ==========================================================
 */

function validateNpsnFormat_(npsn) {

  const value =
    normalizeNpsn_(npsn);


  if (!value) {

    throw new Error(
      'NPSN wajib diisi.'
    );

  }


  /*
   * NPSN umumnya berupa 8 digit.
   */

  if (!/^\d{8}$/.test(value)) {

    throw new Error(
      'Format NPSN harus berupa 8 digit angka.'
    );

  }


  return value;

}


/**
 * ==========================================================
 * GET SCHOOL CONTEXT
 * ==========================================================
 */

function getSchoolContext(npsn) {

  const normalized =
    validateNpsnFormat_(npsn);


  const school =
    getSchoolByNpsn_(
      normalized
    );


  if (!school) {

    throw new Error(
      'NPSN ' +
      normalized +
      ' belum terdaftar di SIM SATRIA.'
    );

  }


  const status =
    String(
      school.STATUS || ''
    )
      .trim()
      .toUpperCase();


  if (status !== 'ACTIVE') {

    throw new Error(
      'Sekolah dengan NPSN ' +
      normalized +
      ' tidak aktif.'
    );

  }


  if (
    !school.SPREADSHEET_ID
  ) {

    throw new Error(
      'Spreadsheet sekolah belum dikonfigurasi.'
    );

  }


  if (
    !school.DRIVE_FOLDER_ID
  ) {

    throw new Error(
      'Folder Drive sekolah belum dikonfigurasi.'
    );

  }


  return {

    npsn:
      normalized,

    namaSekolah:
      String(
        school.NAMA_SEKOLAH || ''
      ),

    kepalaSekolah:
      String(
        school.KEPALA_SEKOLAH || ''
      ),

    alamat:
      String(
        school.ALAMAT || ''
      ),

    logoUrl:
      String(
        school.LOGO_URL || ''
      ),

    tagline:
      String(
        school.TAGLINE || ''
      ),

    warnaUtama:
      String(
        school.WARNA_UTAMA ||
        SATRIA_CONFIG.DEFAULT_PRIMARY
      ),

    warnaSekunder:
      String(
        school.WARNA_SEKUNDER ||
        SATRIA_CONFIG.DEFAULT_SECONDARY
      ),

    spreadsheetId:
      String(
        school.SPREADSHEET_ID
      ),

    driveFolderId:
      String(
        school.DRIVE_FOLDER_ID
      ),

    status:
      status

  };

}


/**
 * ==========================================================
 * TEST SCHOOL CONTEXT
 * ==========================================================
 */

function testSchoolContext(npsn) {

  const context =
    getSchoolContext(npsn);

  return {

    success: true,

    context:
      context

  };

}


/**
 * ==========================================================
 * GET SCHOOL PROFILE
 * ==========================================================
 *
 * Dipanggil frontend.
 *
 */

function getSchoolProfile(npsn) {

  const context =
    getSchoolContext(npsn);


  return {

    success: true,

    appName:
      SATRIA_CONFIG.APP_NAME,

    version:
      SATRIA_CONFIG.VERSION,

    npsn:
      context.npsn,

    namaSekolah:
      context.namaSekolah,

    kepalaSekolah:
      context.kepalaSekolah,

    alamat:
      context.alamat,

    logoUrl:
      context.logoUrl,

    tagline:
      context.tagline,

    warnaUtama:
      context.warnaUtama,

    warnaSekunder:
      context.warnaSekunder,

    status:
      context.status

  };

}


/**
 * ==========================================================
 * SCHOOL CONNECTION TEST
 * ==========================================================
 */

function testSchoolConnection(npsn) {

  const context =
    getSchoolContext(npsn);


  const database =
    getSchoolDatabaseInfo_(
      context
    );


  const drive =
    getSchoolDriveInfo_(
      context
    );


  return {

    success: true,

    npsn:
      context.npsn,

    namaSekolah:
      context.namaSekolah,

    database:
      database,

    drive:
      drive

  };

}

function testContextSekolahA() {

  return getSchoolContext(
    '20312345'
  );

}

function testContextSekolahB() {

  return getSchoolContext(
    '20367890'
  );

}