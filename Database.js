/************************************************************
 * SIM SATRIA CORE
 * DATABASE SERVICE
 *
 * File : Database.gs
 ************************************************************/
/**
 * ==========================================================
 * GET SCHOOL SPREADSHEET
 * ==========================================================
 */
function getSchoolSpreadsheet_(
  context
) {
  if (!context) {
    throw new Error(
      'School Context tidak tersedia.'
    );
  }
  if (!context.spreadsheetId) {
    throw new Error(
      'Spreadsheet ID sekolah kosong.'
    );
  }
  try {
    return SpreadsheetApp.openById(
      context.spreadsheetId
    );
  } catch (error) {
    throw new Error(
      'Spreadsheet sekolah tidak dapat dibuka: ' +
      error.message
    );
  }
}
/**
 * ==========================================================
 * GET SCHOOL SHEET
 * ==========================================================
 */
function getSchoolSheet_(
  context,
  sheetName
) {
  const ss =
    getSchoolSpreadsheet_(
      context
    );
  const sheet =
    ss.getSheetByName(
      sheetName
    );
  if (!sheet) {
    throw new Error(
      'Sheet "' +
      sheetName +
      '" tidak ditemukan pada database ' +
      context.namaSekolah
    );
  }
  return sheet;
}
/**
 * ==========================================================
 * SCHOOL DATABASE INFO
 * ==========================================================
 */
function getSchoolDatabaseInfo_(
  context
) {
  const ss =
    getSchoolSpreadsheet_(
      context
    );
  return {
    connected:
      true,
    name:
      ss.getName(),
    id:
      ss.getId(),
    url:
      ss.getUrl(),
    sheets:
      ss
        .getSheets()
        .map(function(sheet) {
          return sheet.getName();
        })
  };
}
/**
 * ==========================================================
 * INITIALIZE SCHOOL DATABASE
 * ==========================================================
 */
function initializeSchoolDatabase_(
  spreadsheet
) {
  const requiredSheets = [
    'CONFIG',
    'GURU',
    'KARYAWAN',
    'SISWA',
    'KELAS',
    'TRX_PRESENSI',
    'TRX_PRESTASI',
    'TRX_AGENDA_GURU',
    'TRX_SBI',
    'TRX_PARKIR',
    'TRX_KEBERSIHAN',
    'TRX_KEAMANAN',
    'TRX_KERJA',
    'LOG'
  ];
  /*
   * Spreadsheet baru selalu mempunyai
   * minimal satu sheet.
   */
  const firstSheet =
    spreadsheet
      .getSheets()[0];
  if (
    firstSheet &&
    firstSheet.getName() === 'Sheet1'
  ) {
    firstSheet.setName(
      requiredSheets[0]
    );
  }
  const existing =
    spreadsheet
      .getSheets()
      .map(function(sheet) {
        return sheet.getName();
      });
  requiredSheets.forEach(
    function(sheetName) {
      if (
        existing.indexOf(
          sheetName
        ) === -1
      ) {
        spreadsheet.insertSheet(
          sheetName
        );
      }
    }
  );
  /*
   * CONFIG
   */
  setupSchoolConfigSheet_(
    spreadsheet
      .getSheetByName('CONFIG')
  );
  /*
   * MASTER SHEETS
   */
  setupMasterHeaders_(
    spreadsheet.getSheetByName('GURU'),
    [
      'NIP',
      'NAMA',
      'JENIS_KELAMIN',
      'STATUS',
      'EMAIL'
    ]
  );
  setupMasterHeaders_(
    spreadsheet.getSheetByName('KARYAWAN'),
    [
      'NIP',
      'NAMA',
      'JABATAN',
      'STATUS',
      'EMAIL'
    ]
  );
  setupMasterHeaders_(
    spreadsheet.getSheetByName('SISWA'),
    [
      'NISN',
      'NIS',
      'NAMA',
      'KELAS',
      'JENIS_KELAMIN',
      'STATUS'
    ]
  );
  setupMasterHeaders_(
    spreadsheet.getSheetByName('KELAS'),
    [
      'KODE_KELAS',
      'NAMA_KELAS',
      'TINGKAT',
      'WALI_KELAS',
      'STATUS'
    ]
  );
  /*
   * TRANSACTION SHEETS
   */
  setupMasterHeaders_(
    spreadsheet.getSheetByName(
      'TRX_PRESENSI'
    ),
    [
      'TIMESTAMP',
      'NPSN',
      'NIP',
      'NAMA',
      'TANGGAL',
      'STATUS',
      'KETERANGAN'
    ]
  );
  setupMasterHeaders_(
    spreadsheet.getSheetByName(
      'TRX_PRESTASI'
    ),
    [
      'TIMESTAMP',
      'NPSN',
      'NIP',
      'NAMA',
      'JENIS',
      'URAIAN',
      'BUKTI_FISIK'
    ]
  );
  setupMasterHeaders_(
    spreadsheet.getSheetByName(
      'TRX_AGENDA_GURU'
    ),
    [
      'TIMESTAMP',
      'NPSN',
      'NIP',
      'NAMA',
      'TANGGAL',
      'KELAS',
      'SESI',
      'TUJUAN_PEMBELAJARAN',
      'MATERI_PEMBELAJARAN'
    ]
  );
  setupMasterHeaders_(
    spreadsheet.getSheetByName(
      'TRX_SBI'
    ),
    [
      'TIMESTAMP',
      'NPSN',
      'NIP',
      'NAMA',
      'INDIKATOR',
      'SUBINDIKATOR',
      'URAIAN_KEGIATAN',
      'HAMBATAN',
      'SOLUSI',
      'KARAKTER',
      'BUKTI_FISIK'
    ]
  );
  setupMasterHeaders_(
    spreadsheet.getSheetByName(
      'TRX_PARKIR'
    ),
    [
      'TIMESTAMP',
      'NPSN',
      'NIP',
      'NAMA',
      'KENDALA',
      'SOLUSI',
      'UPLOAD_FOTO_PARKIR'
    ]
  );
  setupMasterHeaders_(
    spreadsheet.getSheetByName(
      'TRX_KEBERSIHAN'
    ),
    [
      'TIMESTAMP',
      'NPSN',
      'NIP',
      'NAMA',
      'KENDALA',
      'SOLUSI',
      'BUKTI_FISIK'
    ]
  );
  setupMasterHeaders_(
    spreadsheet.getSheetByName(
      'TRX_KEAMANAN'
    ),
    [
      'TIMESTAMP',
      'NPSN',
      'NIP',
      'NAMA',
      'KENDALA',
      'SOLUSI',
      'BUKTI_FISIK'
    ]
  );
  setupMasterHeaders_(
    spreadsheet.getSheetByName(
      'TRX_KERJA'
    ),
    [
      'TIMESTAMP',
      'NPSN',
      'NIP',
      'NAMA',
      'TANGGAL_PELAKSANAAN',
      'SESI',
      'BIDANG_TUGAS',
      'TARGET_PEKERJAAN',
      'URAIAN_PEKERJAAN',
      'KENDALA',
      'TINDAK_LANJUT',
      'REFLEKSI',
      'BUKTI_FISIK'
    ]
  );
  setupMasterHeaders_(
    spreadsheet.getSheetByName(
      'LOG'
    ),
    [
      'TIMESTAMP',
      'NPSN',
      'USER_ID',
      'EMAIL',
      'NIP',
      'NAMA_USER',
      'ROLE',
      'ACTION',
      'MODULE',
      'DESCRIPTION'
    ]
  );
}
/**
 * ==========================================================
 * CONFIG SCHOOL
 * ==========================================================
 */
function setupSchoolConfigSheet_(
  sheet
) {
  const headers = [
    'NPSN',
    'NAMA_SEKOLAH',
    'KEPALA_SEKOLAH',
    'ALAMAT',
    'LOGO_URL',
    'TAGLINE',
    'WARNA_UTAMA',
    'WARNA_SEKUNDER'
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
    .setFontWeight('bold');
}
/**
 * ==========================================================
 * SETUP HEADERS
 * ==========================================================
 */
function setupMasterHeaders_(
  sheet,
  headers
) {
  if (!sheet) return;
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
    .setFontWeight('bold');
  sheet.setFrozenRows(1);
}
/**
 * ==========================================================
 * DATABASE TEST
 * ==========================================================
 */
function testDatabase(
  npsn
) {
  const context =
    getSchoolContext(npsn);
  const info =
    getSchoolDatabaseInfo_(
      context
    );
  return {
    success: true,
    npsn:
      context.npsn,
    sekolah:
      context.namaSekolah,
    database:
      info
  };
}
function initializeMasterDataSheets_(
  spreadsheet
) {
  const definitions = {
    CONFIG: [
      'NPSN',
      'NAMA_SEKOLAH',
      'KEPALA_SEKOLAH',
      'ALAMAT',
      'LOGO_URL',
      'TAGLINE',
      'WARNA_UTAMA',
      'WARNA_SEKUNDER',
      'TAHUN_AJARAN_AKTIF'
    ],
    GURU: [
      'NIP',
      'NAMA',
      'NIK',
      'NUPTK',
      'JENIS_KELAMIN',
      'TEMPAT_LAHIR',
      'TANGGAL_LAHIR',
      'PANGKAT_GOLONGAN',
      'JABATAN',
      'MAPEL',
      'EMAIL',
      'NO_HP',
      'STATUS'
    ],
    KARYAWAN: [
      'NIP',
      'NAMA',
      'NIK',
      'JENIS_KELAMIN',
      'TEMPAT_LAHIR',
      'TANGGAL_LAHIR',
      'JABATAN',
      'BIDANG_TUGAS',
      'EMAIL',
      'NO_HP',
      'STATUS'
    ],
    SISWA: [
      'NISN',
      'NIS',
      'NAMA',
      'JENIS_KELAMIN',
      'TEMPAT_LAHIR',
      'TANGGAL_LAHIR',
      'KELAS',
      'ROMBEL',
      'NAMA_AYAH',
      'NAMA_IBU',
      'NO_HP_ORANG_TUA',
      'ALAMAT',
      'STATUS'
    ],
    KELAS: [
      'KODE_KELAS',
      'NAMA_KELAS',
      'TINGKAT',
      'JURUSAN',
      'ROMBEL',
      'NIP_WALI_KELAS',
      'NAMA_WALI_KELAS',
      'TAHUN_AJARAN',
      'STATUS'
    ]
  };
  Object.keys(
    definitions
  ).forEach(
    function(sheetName) {
      let sheet =
        spreadsheet.getSheetByName(
          sheetName
        );
      if (!sheet) {
        sheet =
          spreadsheet.insertSheet(
            sheetName
          );
      }
      setupHeaders_(
        sheet,
        definitions[
          sheetName
        ]
      );
    }
  );
  return true;
}
/**
 * ==========================================================
 * SETUP HEADERS
 * ==========================================================
 *
 * Membuat / memperbarui header sebuah sheet.
 *
 * Fungsi ini digunakan oleh:
 * - initializeSchoolDatabase_()
 * - initializeMasterDataSheets_()
 *
 */
function setupHeaders_(sheet, headers) {
  if (!sheet) {
    throw new Error(
      'Sheet untuk setupHeaders_ tidak ditemukan.'
    );
  }
  if (!headers || !headers.length) {
    throw new Error(
      'Daftar header kosong.'
    );
  }
  /*
   * Pastikan jumlah kolom mencukupi.
   */
  const requiredColumns =
    headers.length;
  const currentColumns =
    sheet.getMaxColumns();
  if (
    currentColumns <
    requiredColumns
  ) {
    sheet.insertColumnsAfter(
      currentColumns,
      requiredColumns - currentColumns
    );
  }
  /*
   * Tulis header.
   */
  sheet
    .getRange(
      1,
      1,
      1,
      requiredColumns
    )
    .setValues([
      headers
    ]);
  /*
   * Format header.
   */
  sheet
    .getRange(
      1,
      1,
      1,
      requiredColumns
    )
    .setFontWeight(
      'bold'
    );
  /*
   * Bekukan baris pertama.
   */
  sheet.setFrozenRows(1);
}
function syncSchoolConfig(npsn) {
  const school =
    getSchoolByNpsn_(npsn);
  if (!school) {
    throw new Error(
      'Sekolah dengan NPSN ' + npsn + ' tidak ditemukan.'
    );
  }
  if (!school.SPREADSHEET_ID) {
    throw new Error(
      'Spreadsheet sekolah belum tersedia.'
    );
  }
  const ss =
    SpreadsheetApp.openById(
      school.SPREADSHEET_ID
    );
  let sheet =
    ss.getSheetByName('CONFIG');
  if (!sheet) {
    sheet =
      ss.insertSheet('CONFIG');
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
    'TAHUN_AJARAN_AKTIF'
  ];
  setupHeaders_(
    sheet,
    headers
  );
  sheet
    .getRange(
      2,
      1,
      1,
      headers.length
    )
    .setValues([[
      school.NPSN || '',
      school.NAMA_SEKOLAH || '',
      school.KEPALA_SEKOLAH || '',
      school.ALAMAT || '',
      school.LOGO_URL || '',
      school.TAGLINE || '',
      school.WARNA_UTAMA || '#0B3D2E',
      school.WARNA_SEKUNDER || '#2E7D32',
      ''
    ]]);
  return {
    success: true,
    npsn: school.NPSN,
    namaSekolah: school.NAMA_SEKOLAH,
    spreadsheetId: ss.getId()
  };
}
function testSyncConfigSekolahA() {
  return syncSchoolConfig(
    '20312345'
  );
}

function initializeTransactionSheets_(
  spreadsheet
) {

  const SYSTEM_HEADERS = [
    'TRANSACTION_ID',
    'TIMESTAMP',
    'NPSN',
    'USER_ID',
    'EMAIL',
    'NIP',
    'NAMA_USER',
    'ROLE'

  ];


  const definitions = {

    TRX_PRESENSI: [

      ...SYSTEM_HEADERS,

      'TANGGAL',
      'KELAS',
      'NISN',
      'NAMA_SISWA',
      'STATUS',
      'KETERANGAN'

    ],


    TRX_PRESTASI: [

      ...SYSTEM_HEADERS,

      'JENIS_PRESTASI',
      'TINGKAT',
      'NAMA_KEGIATAN',
      'URAIAN',
      'NAMA_SISWA',
      'NISN',
      'BUKTI_FISIK'

    ],


    TRX_AGENDA_GURU: [

      ...SYSTEM_HEADERS,

      'TANGGAL',
      'KELAS',
      'SESI',
      'TUJUAN_PEMBELAJARAN',
      'MATERI_PEMBELAJARAN',
      'DPL',
      'PENGALAMAN_BELAJAR',
      'PRINSIP_PEMBELAJARAN',
      'MURID_TIDAK_MENGIKUTI_KBM',
      'BUKTI_FISIK'

    ],


    TRX_SBI: [

      ...SYSTEM_HEADERS,

      'INDIKATOR',
      'SUBINDIKATOR',
      'URAIAN_KEGIATAN',
      'HAMBATAN',
      'SOLUSI',
      'KARAKTER',
      'BUKTI_FISIK'

    ],


    TRX_PARKIR: [

      ...SYSTEM_HEADERS,

      'TANGGAL',
      'KENDALA',
      'SOLUSI',
      'UPLOAD_FOTO_PARKIR'

    ],


    TRX_KEBERSIHAN: [

      ...SYSTEM_HEADERS,

      'TANGGAL',
      'KENDALA',
      'SOLUSI',
      'BUKTI_FISIK'

    ],


    TRX_KEAMANAN: [

      ...SYSTEM_HEADERS,

      'TANGGAL',
      'KENDALA',
      'SOLUSI',
      'BUKTI_FISIK'

    ],


    TRX_KERJA: [

      ...SYSTEM_HEADERS,

      'TANGGAL_PELAKSANAAN',
      'SESI',
      'BIDANG_TUGAS',
      'TARGET_PEKERJAAN',
      'URAIAN_PEKERJAAN',
      'KENDALA',
      'TINDAK_LANJUT',
      'REFLEKSI',
      'BUKTI_FISIK'

    ]

  };


  Object.keys(
    definitions
  ).forEach(
    function(sheetName) {

      let sheet =
        spreadsheet.getSheetByName(
          sheetName
        );


      if (!sheet) {

        sheet =
          spreadsheet.insertSheet(
            sheetName
          );

      }


      setupHeaders_(
        sheet,
        definitions[
          sheetName
        ]
      );

    }
  );


  return true;

}

/**
 * ==========================================================
 * MIGRASI TRANSACTION_ID
 * ==========================================================
 */

function addTransactionIdHeader_(
  spreadsheet
) {

  const sheets =
    spreadsheet
      .getSheets();


  sheets.forEach(
    function(sheet) {

      const sheetName =
        sheet.getName();


      /*
       * Hanya sheet TRX_*
       */

      if (
        !sheetName.startsWith(
          'TRX_'
        )
      ) {

        return;

      }


      const lastColumn =
        sheet.getLastColumn();


      if (
        lastColumn < 1
      ) {

        return;

      }


      const headers =
        sheet
          .getRange(
            1,
            1,
            1,
            lastColumn
          )
          .getValues()[0]
          .map(
            function(header) {

              return String(
                header || ''
              ).trim();

            }
          );


      /*
       * Jika sudah ada, jangan lakukan apa-apa.
       */

      if (
        headers.includes(
          'TRANSACTION_ID'
        )
      ) {

        return;

      }


      /*
       * Tambahkan kolom baru di paling depan.
       */

      sheet.insertColumnBefore(
        1
      );


      sheet
        .getRange(
          1,
          1
        )
        .setValue(
          'TRANSACTION_ID'
        );


      sheet
        .getRange(
          1,
          1
        )
        .setFontWeight(
          'bold'
        );


      sheet.setFrozenRows(
        1
      );

    }
  );


  return true;

}


function fillMissingTransactionIds_(
  spreadsheet
) {

  const sheets =
    spreadsheet
      .getSheets();


  sheets.forEach(
    function(sheet) {

      const sheetName =
        sheet.getName();


      if (
        !sheetName.startsWith(
          'TRX_'
        )
      ) {

        return;

      }


      const lastRow =
        sheet.getLastRow();


      const lastColumn =
        sheet.getLastColumn();


      if (
        lastRow < 2 ||
        lastColumn < 1
      ) {

        return;

      }


      const headers =
        sheet
          .getRange(
            1,
            1,
            1,
            lastColumn
          )
          .getValues()[0];


      const idColumn =
        headers.findIndex(
          function(header) {

            return String(
              header
            ).trim() ===
            'TRANSACTION_ID';

          }
        );


      if (
        idColumn === -1
      ) {

        return;

      }


      const range =
        sheet.getRange(
          2,
          idColumn + 1,
          lastRow - 1,
          1
        );


      const values =
        range.getValues();


      let changed =
        false;


      values.forEach(
        function(row) {

          if (
            !row[0]
          ) {

            row[0] =
              generateTransactionId_();

            changed =
              true;

          }

        }
      );


      if (changed) {

        range.setValues(
          values
        );

      }

    }
  );


  return true;

}