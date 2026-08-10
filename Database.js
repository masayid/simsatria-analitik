/**
 * DATABASE SERVICEs
 * Selalu bekerja pada Spreadsheet sekolah dari School Context.
 */
function normalizeHeader_(v) {
  return String(v || '').trim().toUpperCase();
}
function getSheetHeaders_(sheet) {
  const lastColumn = sheet.getLastColumn();
  if (!lastColumn) return [];
  return sheet
    .getRange(1, 1, 1, lastColumn)
    .getValues()[0]
    .map(normalizeHeader_);
}
function setupHeaders_(sheet, headers) {
  if (!sheet) {
    throw new Error('Sheet tidak tersedia.');
  }
  headers = headers.map(normalizeHeader_);
  const current = getSheetHeaders_(sheet);
  if (!current.length) {
    sheet
      .getRange(1, 1, 1, headers.length)
      .setValues([headers]);
    return headers;
  }
  const merged = current.slice();
  headers.forEach(h => {
    if (!merged.includes(h)) merged.push(h);
  });
  if (merged.length !== current.length) {
    sheet
      .getRange(1, 1, 1, merged.length)
      .setValues([merged]);
  }
  return merged;
}
function ensureTransactionSheet_(sheetName, businessHeaders) {
  const ss = getSchoolSpreadsheet_();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  const systemHeaders = [
    'TRANSACTION_ID',
    'TIMESTAMP',
    'NPSN',
    'USER_ID',
    'EMAIL',
    'NIP',
    'NAMA_USER',
    'ROLE'
  ];
  return setupHeaders_(
    sheet,
    systemHeaders.concat(businessHeaders || [])
  );
}
function initializeSchoolTransactionSheets() {
  requirePermission('MANAGE_KELAS');
  const modules = {
    TRX_PRESENSI: [
      'TANGGAL',
      'KELAS',
      'NISN',
      'NAMA_SISWA',
      'STATUS',
      'KETERANGAN'
    ],
    TRX_PARKIR: [
      'TANGGAL',
      'KENDALA',
      'SOLUSI',
      'UPLOAD_FOTO_PARKIR'
    ],
    TRX_PRESTASI: [
      'TANGGAL',
      'NAMA_SISWA',
      'JENIS',
      'TINGKAT',
      'KETERANGAN'
    ],
    TRX_AGENDA_GURU: [
      'TANGGAL',
      'SESI',
      'KELAS',
      'TUJUAN_PEMBELAJARAN',
      'MATERI_PEMBELAJARAN',
      'DPL',
      'PENGALAMAN_BELAJAR',
      'PRINSIP_PEMBELAJARAN',
      'REKAP_MURID_TIDAK_IKUT',
      'BUKTI_FISIK'
    ],
    TRX_SBI: [
      'INDIKATOR',
      'SUBINDIKATOR',
      'URAIAN_KEGIATAN',
      'HAMBATAN',
      'SOLUSI',
      'KARAKTER',
      'BUKTI_FISIK'
    ],
    TRX_KEBERSIHAN: [
      'TANGGAL',
      'KENDALA',
      'SOLUSI',
      'BUKTI_FISIK'
    ],
    TRX_KEAMANAN: [
      'TANGGAL',
      'KENDALA',
      'SOLUSI',
      'BUKTI_FISIK'
    ],
    TRX_KERJA: [
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
  Object.keys(modules).forEach(name => {
    ensureTransactionSheet_(name, modules[name]);
  });
  ensureLogSheet_();
  return {
    success: true,
    school: getSchoolContext().namaSekolah,
    npsn: getSchoolContext().npsn
  };
}
function ensureLogSheet_() {
  const ss = getSchoolSpreadsheet_();
  let sh = ss.getSheetByName('LOG');
  if (!sh) sh = ss.insertSheet('LOG');
  setupHeaders_(sh, [
    'TIMESTAMP',
    'NPSN',
    'USER_ID',
    'EMAIL',
    'NIP',
    'NAMA_USER',
    'ROLE',
    'ACTION',
    'MODULE',
    'DESCRIPTION',
    'TRANSACTION_ID'
  ]);
  return sh;
}
function setupDatabaseSekolahSaya() {
  const context =
    getCurrentUserContext();
  requirePermission(
    'MANAGE_KELAS'
  );
  const ss =
    SpreadsheetApp.openById(
      context.school.spreadsheetId
    );
  // =====================================================
  // MASTER DATA
  // =====================================================
  const masterSheets = {
    CONFIG: [
      'KEY',
      'VALUE',
      'KETERANGAN'
    ],
    GURU: [
      'NIP',
      'NAMA',
      'EMAIL',
      'NO_HP',
      'STATUS'
    ],
    SISWA: [
      'NISN',
      'NIS',
      'NAMA',
      'JK',
      'KELAS',
      'STATUS'
    ],
    KARYAWAN: [
      'NIP',
      'NAMA',
      'JABATAN',
      'EMAIL',
      'NO_HP',
      'STATUS'
    ],
    KELAS: [
      'KELAS',
      'TINGKAT',
      'JURUSAN',
      'WALI_KELAS',
      'STATUS'
    ]
  };
  // =====================================================
  // TRANSACTION
  // =====================================================
  const transactionSheets = {
    TRX_PRESENSI: [
      'TANGGAL',
      'KELAS',
      'NISN',
      'NAMA_SISWA',
      'STATUS',
      'KETERANGAN'
    ],
    TRX_PARKIR: [
      'TANGGAL',
      'KENDALA',
      'SOLUSI',
      'UPLOAD_FOTO_PARKIR'
    ],
    TRX_PRESTASI: [
      'TANGGAL',
      'NAMA_SISWA',
      'JENIS',
      'TINGKAT',
      'KETERANGAN'
    ],
    TRX_AGENDA_GURU: [
      'TANGGAL',
      'SESI',
      'KELAS',
      'TUJUAN_PEMBELAJARAN',
      'MATERI_PEMBELAJARAN',
      'DPL',
      'PENGALAMAN_BELAJAR',
      'PRINSIP_PEMBELAJARAN',
      'REKAP_MURID_TIDAK_IKUT',
      'BUKTI_FISIK'
    ],
    TRX_SBI: [
      'INDIKATOR',
      'SUBINDIKATOR',
      'URAIAN_KEGIATAN',
      'HAMBATAN',
      'SOLUSI',
      'KARAKTER',
      'BUKTI_FISIK'
    ],
    TRX_KEBERSIHAN: [
      'TANGGAL',
      'KENDALA',
      'SOLUSI',
      'BUKTI_FISIK'
    ],
    TRX_KEAMANAN: [
      'TANGGAL',
      'KENDALA',
      'SOLUSI',
      'BUKTI_FISIK'
    ],
    TRX_KERJA: [
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
  // =====================================================
  // SYSTEM HEADER UNTUK TRANSACTION
  // =====================================================
  const transactionSystemHeaders = [
    'TRANSACTION_ID',
    'TIMESTAMP',
    'NPSN',
    'USER_ID',
    'EMAIL',
    'NIP',
    'NAMA_USER',
    'ROLE'
  ];
  const createdMaster = [];
  const createdTransaction = [];
  // =====================================================
  // 1. BUAT MASTER SHEET
  // =====================================================
  Object.keys(masterSheets)
    .forEach(function(sheetName) {
      let sheet =
        ss.getSheetByName(
          sheetName
        );
      if (!sheet) {
        sheet =
          ss.insertSheet(
            sheetName
          );
        createdMaster.push(
          sheetName
        );
      }
      setupHeaders_(
        sheet,
        masterSheets[sheetName]
      );
    });
  // =====================================================
  // 2. BUAT TRANSACTION SHEET
  // =====================================================
  Object.keys(transactionSheets)
    .forEach(function(sheetName) {
      let sheet =
        ss.getSheetByName(
          sheetName
        );
      if (!sheet) {
        sheet =
          ss.insertSheet(
            sheetName
          );
        createdTransaction.push(
          sheetName
        );
      }
      setupHeaders_(
        sheet,
        transactionSystemHeaders
          .concat(
            transactionSheets[sheetName]
          )
      );
    });
  // =====================================================
  // 3. BUAT LOG
  // =====================================================
  let log =
    ss.getSheetByName(
      'LOG'
    );
  if (!log) {
    log =
      ss.insertSheet(
        'LOG'
      );
  }
  setupHeaders_(
    log,
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
      'DESCRIPTION',
      'TRANSACTION_ID'
    ]
  );
  // =====================================================
  // 4. CONFIG DEFAULT
  // =====================================================
  const config =
    ss.getSheetByName(
      'CONFIG'
    );
  const configValues = [
    [
      'NPSN',
      context.npsn,
      'NPSN sekolah'
    ],
    [
      'NAMA_SEKOLAH',
      context.school.namaSekolah,
      'Nama sekolah'
    ],
    [
      'SPREADSHEET_ID',
      context.school.spreadsheetId,
      'ID Spreadsheet sekolah'
    ],
    [
      'DRIVE_FOLDER_ID',
      context.school.driveFolderId,
      'ID folder Drive sekolah'
    ],
    [
      'STATUS',
      'ACTIVE',
      'Status sekolah'
    ],
    [
      'VERSI_DATABASE',
      '1.0',
      'Versi struktur database'
    ]
  ];
  /*
   * Hanya isi CONFIG jika masih kosong.
   * Tidak menimpa konfigurasi yang sudah ada.
   */
  if (
    config.getLastRow() <= 1
  ) {
    config
      .getRange(
        2,
        1,
        configValues.length,
        3
      )
      .setValues(
        configValues
      );
  }
  // =====================================================
  // 5. RAPIAKAN HEADER
  // =====================================================
  Object.keys(masterSheets)
    .concat(
      Object.keys(transactionSheets)
    )
    .concat([
      'LOG'
    ])
    .forEach(function(sheetName) {
      const sheet =
        ss.getSheetByName(
          sheetName
        );
      if (!sheet) return;
      sheet
        .setFrozenRows(
          1
        );
      const lastColumn =
        sheet.getLastColumn();
      if (
        lastColumn > 0
      ) {
        sheet
          .getRange(
            1,
            1,
            1,
            lastColumn
          )
          .setFontWeight(
            'bold'
          );
      }
    });
  // =====================================================
  // 6. HASIL
  // =====================================================
  return {
    success:
      true,
    email:
      context.email,
    npsn:
      context.npsn,
    sekolah:
      context.school.namaSekolah,
    spreadsheet:
      ss.getName(),
    spreadsheetId:
      ss.getId(),
    createdMaster:
      createdMaster,
    createdTransaction:
      createdTransaction,
    message:
      'Database Sekolah berhasil dibuat lengkap.'
  };
}
