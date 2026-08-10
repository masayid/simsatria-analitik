/************************************************************
 * SIM SATRIA CORE
 * AUTHENTICATION & USER CONTEXT
 *
 * FASE 2
 * File: Auth.gs
 ************************************************************/


/**
 * ==========================================================
 * ROLE
 * ==========================================================
 */

const SATRIA_ROLES = {

  SUPERADMIN: 'SUPERADMIN',

  ADMIN_SEKOLAH: 'ADMIN_SEKOLAH',

  KEPALA_SEKOLAH: 'KEPALA_SEKOLAH',

  OPERATOR: 'OPERATOR',

  GURU: 'GURU',

  KARYAWAN: 'KARYAWAN'

};


/**
 * ==========================================================
 * USER STATUS
 * ==========================================================
 */

const SATRIA_USER_STATUS = {

  ACTIVE: 'ACTIVE',

  INACTIVE: 'INACTIVE',

  BLOCKED: 'BLOCKED'

};


/**
 * ==========================================================
 * GET CURRENT EMAIL
 * ==========================================================
 *
 * Mengambil email Google Account pengguna.
 *
 */

function getCurrentUserEmail_() {

  const email =
    Session
      .getActiveUser()
      .getEmail();


  if (!email) {

    throw new Error(
      'Identitas akun Google tidak dapat diperoleh. ' +
      'Pastikan pengguna sudah login dan deployment ' +
      'menggunakan konfigurasi autentikasi yang benar.'
    );

  }


  return String(email)
    .trim()
    .toLowerCase();

}


/**
 * ==========================================================
 * GET USER REGISTRY SHEET
 * ==========================================================
 */

function getUserRegistrySheet_() {

  const master =
    getMasterSpreadsheet_();


  const sheet =
    master.getSheetByName(
      'USERS'
    );


  if (!sheet) {

    throw new Error(
      'Sheet USERS belum dibuat.'
    );

  }


  return sheet;

}


/**
 * ==========================================================
 * GET ALL USERS
 * ==========================================================
 */

function getUserRegistryData_() {

  const sheet =
    getUserRegistrySheet_();


  const values =
    sheet.getDataRange()
      .getValues();


  if (
    !values ||
    values.length < 2
  ) {

    return [];

  }


  const headers =
    values[0].map(function(header) {

      return String(header)
        .trim();

    });


  return values
    .slice(1)
    .filter(function(row) {

      return row.some(function(value) {

        return String(value)
          .trim() !== '';

      });

    })
    .map(function(row) {

      const user = {};


      headers.forEach(
        function(header, index) {

          user[header] =
            row[index];

        }
      );


      return user;

    });

}


/**
 * ==========================================================
 * FIND USER BY EMAIL
 * ==========================================================
 */

function getUserByEmail_(
  email
) {

  const normalizedEmail =
    String(email || '')
      .trim()
      .toLowerCase();


  if (!normalizedEmail) {

    return null;

  }


  const users =
    getUserRegistryData_();


  for (
    let i = 0;
    i < users.length;
    i++
  ) {

    const user =
      users[i];


    const userEmail =
      String(
        user.EMAIL || ''
      )
        .trim()
        .toLowerCase();


    if (
      userEmail ===
      normalizedEmail
    ) {

      return user;

    }

  }


  return null;

}


/**
 * ==========================================================
 * VALIDATE ROLE
 * ==========================================================
 */

function isValidRole_(
  role
) {

  const value =
    String(role || '')
      .trim()
      .toUpperCase();


  return Object
    .values(SATRIA_ROLES)
    .indexOf(value) !== -1;

}


/**
 * ==========================================================
 * VALIDATE USER
 * ==========================================================
 */

function validateUser_(
  user
) {

  if (!user) {

    throw new Error(
      'Akun Anda belum terdaftar di SIM SATRIA.'
    );

  }


  const status =
    String(
      user.STATUS || ''
    )
      .trim()
      .toUpperCase();


  if (
    status !==
    SATRIA_USER_STATUS.ACTIVE
  ) {

    throw new Error(
      'Akun SIM SATRIA Anda tidak aktif.'
    );

  }


  const npsn =
    String(
      user.NPSN || ''
    )
      .trim();


  if (!/^\d{8}$/.test(npsn)) {

    throw new Error(
      'NPSN pengguna tidak valid.'
    );

  }


  const role =
    String(
      user.ROLE || ''
    )
      .trim()
      .toUpperCase();


  if (!isValidRole_(role)) {

    throw new Error(
      'Role pengguna tidak valid.'
    );

  }


  return true;

}


/**
 * ==========================================================
 * GET CURRENT USER CONTEXT
 * ==========================================================
 *
 * INI JANTUNG FASE 2.
 *
 * Email → User → NPSN → School Context
 *
 */

function getCurrentUserContext() {

  const email =
    getCurrentUserEmail_();


  const user =
    getUserByEmail_(
      email
    );


  validateUser_(
    user
  );


  const npsn =
    String(
      user.NPSN
    ).trim();


  const school =
    getSchoolContext(
      npsn
    );


  return {

    authenticated: true,

    email:
      email,

    userId:
      String(
        user.USER_ID || ''
      ),

    nama:
      String(
        user.NAMA || ''
      ),

    npsn:
      school.npsn,

    namaSekolah:
      school.namaSekolah,

    role:
      String(
        user.ROLE
      )
        .trim()
        .toUpperCase(),

    status:
      String(
        user.STATUS
      )
        .trim()
        .toUpperCase(),

    school:
      school

  };

}


/**
 * ==========================================================
 * AUTHENTICATION TEST
 * ==========================================================
 */

function testCurrentUser() {

  return getCurrentUserContext();

}

function setupUserSheet() {

  const master =
    getMasterSpreadsheet_();


  let sheet =
    master.getSheetByName(
      'USERS'
    );


  if (!sheet) {

    sheet =
      master.insertSheet(
        'USERS'
      );

  }


  const headers = [

    'USER_ID',
    'EMAIL',
    'NAMA',
    'NPSN',
    'ROLE',
    'STATUS',
    'CREATED_AT',
    'LAST_LOGIN'

  ];


  sheet
    .getRange(
      1,
      1,
      1,
      headers.length
    )
    .setValues([
      headers
    ]);


  sheet
    .getRange(
      1,
      1,
      1,
      headers.length
    )
    .setFontWeight(
      'bold'
    );


  sheet.setFrozenRows(1);


  return {

    success: true,

    sheet:
      'USERS',

    headers:
      headers

  };

}

function createInitialSuperAdmin() {

  const email =
    Session
      .getActiveUser()
      .getEmail();


  if (!email) {

    throw new Error(
      'Email Google tidak dapat diperoleh.'
    );

  }


  const sheet =
    getUserRegistrySheet_();


  const existing =
    getUserByEmail_(
      email
    );


  if (existing) {

    return {

      success: false,

      message:
        'Akun sudah terdaftar.',

      email:
        email

    };

  }


  sheet.appendRow([

    'U001',

    String(email)
      .trim()
      .toLowerCase(),

    'Administrator SIM SATRIA',

    '00000000',

    'SUPERADMIN',

    'ACTIVE',

    new Date(),

    ''

  ]);


  return {

    success: true,

    email:
      email,

    role:
      'SUPERADMIN'

  };

}


function registerUser(
  data
) {

  if (!data) {

    throw new Error(
      'Data user tidak ditemukan.'
    );

  }


  const email =
    String(
      data.email || ''
    )
      .trim()
      .toLowerCase();


  const nama =
    String(
      data.nama || ''
    ).trim();


  const npsn =
    String(
      data.npsn || ''
    ).trim();


  const role =
    String(
      data.role || ''
    )
      .trim()
      .toUpperCase();


  if (!email) {

    throw new Error(
      'Email wajib diisi.'
    );

  }


  if (!nama) {

    throw new Error(
      'Nama user wajib diisi.'
    );

  }


  if (!/^\d{8}$/.test(npsn)) {

    throw new Error(
      'NPSN harus 8 digit.'
    );

  }


  if (!isValidRole_(role)) {

    throw new Error(
      'Role tidak valid.'
    );

  }


  /*
   * Pastikan sekolah ada.
   */

  const school =
    getSchoolByNpsn_(
      npsn
    );


  if (!school) {

    throw new Error(
      'Sekolah dengan NPSN ' +
      npsn +
      ' belum terdaftar.'
    );

  }


  /*
   * Jangan izinkan email ganda.
   */

  if (
    getUserByEmail_(email)
  ) {

    throw new Error(
      'Email tersebut sudah terdaftar.'
    );

  }


  const sheet =
    getUserRegistrySheet_();


  /*
   * USER ID
   */

  const userId =
    'U' +
    String(
      sheet.getLastRow()
    )
      .padStart(
        4,
        '0'
      );


  sheet.appendRow([

    userId,

    email,

    nama,

    npsn,

    role,

    'ACTIVE',

    new Date(),

    ''

  ]);


  return {

    success: true,

    userId:
      userId,

    email:
      email,

    nama:
      nama,

    npsn:
      npsn,

    role:
      role,

    status:
      'ACTIVE'

  };

}

function testRegisterAdminSekolahA() {

  return registerUser({

    email:
      'masayid09@gmail.com',

    nama:
      'Admin SMA Negeri 2 Sukorejo',

    npsn:
      '20312345',

    role:
      'ADMIN_SEKOLAH'

  });

}

function testRegisterGuruSekolahA() {

  return registerUser({

    email:
      'guru1@sman2sukorejo.sch.id',

    nama:
      'Guru SMA Negeri 2 Sukorejo',

    npsn:
      '20312345',

    role:
      'GURU'

  });

}

function testRegisterKepalaSekolahA() {

  return registerUser({

    email:
      'kepala@sman2sukorejo.sch.id',

    nama:
      'Kepala SMA Negeri 2 Sukorejo',

    npsn:
      '20312345',

    role:
      'KEPALA_SEKOLAH'

  });

}


function testUserContext() {

  const context =
    getCurrentUserContext();


  Logger.log(
    JSON.stringify(
      context,
      null,
      2
    )
  );


  return context;

}
