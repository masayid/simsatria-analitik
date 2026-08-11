/**
 * ============================================================
 * SIM SATRIA
 * PRESENSI PER KELAS
 * FASE 5.3
 * ============================================================
 *
 * ARSITEKTUR MULTI-SCHOOL
 *
 * USER
 *   ↓
 * AUTH
 *   ↓
 * getCurrentUserContext()
 *   ↓
 * NPSN
 *   ↓
 * SCHOOL CONTEXT
 *   ↓
 * SPREADSHEET SEKOLAH
 *   ↓
 * ┌───────────────┐
 * │ KELAS         │
 * │ SISWA         │
 * │ TRX_PRESENSI  │
 * │ LOG           │
 * └───────────────┘
 *
 * Tidak ada Spreadsheet ID hard-code.
 */
/* ============================================================
   KONFIGURASI
   ============================================================ */
const PRESENSI_CONFIG = {
  SHEET_SISWA:
    'SISWA',
  SHEET_KELAS:
    'KELAS',
  SHEET_TRANSAKSI:
    'TRX_PRESENSI',
  SHEET_LOG:
    'LOG',
  STATUS_PRESENSI: [
    'HADIR',
    'IZIN',
    'SAKIT',
    'ALPA'
  ]
};
/* ============================================================
   LOAD AWAL PRESENSI
   ============================================================
   Dipanggil ketika menu Presensi Per Kelas dibuka.
   ============================================================ */
function loadPresensiPerkelas() {
  const context =
    getCurrentUserContext();
  // ----------------------------------------------------------
  // VALIDASI SCHOOL CONTEXT
  // ----------------------------------------------------------
  if (
    !context ||
    !context.school ||
    !context.school.spreadsheetId
  ) {
    throw new Error(
      'School Context tidak valid. ' +
      'Spreadsheet sekolah tidak ditemukan.'
    );
  }
  const spreadsheetId =
    String(
      context.school.spreadsheetId
    ).trim();
  if (!spreadsheetId) {
    throw new Error(
      'SPREADSHEET_ID sekolah tidak tersedia.'
    );
  }
  // ----------------------------------------------------------
  // BUKA SPREADSHEET SEKOLAH AKTIF
  // ----------------------------------------------------------
  const ss =
    SpreadsheetApp.openById(
      spreadsheetId
    );
  // ----------------------------------------------------------
  // AMBIL KELAS
  // ----------------------------------------------------------
  const kelas =
    getKelasPresensi_(
      ss
    );
  // ----------------------------------------------------------
  // RETURN SCHOOL CONTEXT + KELAS
  // ----------------------------------------------------------
  return {
    success:
      true,
    email:
      context.email || '',
    userId:
      context.userId || '',
    nama:
      context.nama || '',
    role:
      context.role || '',
    nip:
      context.nip || '',
    npsn:
      context.npsn || '',
    sekolah:
      context.school.namaSekolah || '',
    spreadsheetId:
      spreadsheetId,
    kelas:
      kelas
  };
}
/* ============================================================
   GET KELAS
   ============================================================ */
function getKelasPresensi_(
  ss
) {
  const sheet =
    ss.getSheetByName(
      PRESENSI_CONFIG.SHEET_KELAS
    );
  if (!sheet) {
    throw new Error(
      'Sheet KELAS tidak ditemukan pada ' +
      'Spreadsheet sekolah.'
    );
  }
  const lastRow =
    sheet.getLastRow();
  const lastColumn =
    sheet.getLastColumn();
  if (
    lastRow < 2 ||
    lastColumn < 1
  ) {
    return [];
  }
  const values =
    sheet
      .getRange(
        1,
        1,
        lastRow,
        lastColumn
      )
      .getValues();
  const headers =
    normalizeHeaders_(
      values[0]
    );
  // ----------------------------------------------------------
  // CARI KOLOM
  // ----------------------------------------------------------
  const kelasIndex =
    findHeaderIndex_(
      headers,
      [
        'KELAS',
        'NAMA_KELAS',
        'ROMBEL'
      ]
    );
  if (
    kelasIndex === -1
  ) {
    throw new Error(
      'Kolom KELAS tidak ditemukan pada sheet KELAS.'
    );
  }
  const statusIndex =
    findHeaderIndex_(
      headers,
      [
        'STATUS'
      ]
    );
  const hasil = [];
  const seen = {};
  // ----------------------------------------------------------
  // BACA DATA KELAS
  // ----------------------------------------------------------
  for (
    let i = 1;
    i < values.length;
    i++
  ) {
    const row =
      values[i];
    const kelas =
      String(
        row[kelasIndex] || ''
      )
      .trim();
    if (!kelas) {
      continue;
    }
    // --------------------------------------------------------
    // STATUS
    //
    // Jika STATUS kosong → tetap dianggap aktif.
    //
    // Jika STATUS berisi → hanya ACTIVE / AKTIF
    // --------------------------------------------------------
    if (
      statusIndex > -1
    ) {
      const status =
        String(
          row[statusIndex] || ''
        )
        .trim()
        .toUpperCase();
      if (
        status &&
        status !== 'ACTIVE' &&
        status !== 'AKTIF'
      ) {
        continue;
      }
    }
    const key =
      kelas
        .toUpperCase();
    if (
      !seen[key]
    ) {
      seen[key] =
        true;
      hasil.push(
        kelas
      );
    }
  }
  // ----------------------------------------------------------
  // SORT
  // ----------------------------------------------------------
  hasil.sort(
    function(a, b) {
      return String(a)
        .localeCompare(
          String(b),
          'id',
          {
            numeric: true,
            sensitivity: 'base'
          }
        );
    }
  );
  return hasil;
}
/* ============================================================
   GET SISWA PER KELAS
   ============================================================
   Dipanggil tombol TAMPILKAN.
   ============================================================ */
function getSiswaPresensiPerkelas(
  tanggal,
  kelas
) {
  // ----------------------------------------------------------
  // VALIDASI INPUT
  // ----------------------------------------------------------
  tanggal =
    String(
      tanggal || ''
    ).trim();
  kelas =
    String(
      kelas || ''
    ).trim();
  if (!tanggal) {
    throw new Error(
      'Tanggal harus dipilih.'
    );
  }
  if (!kelas) {
    throw new Error(
      'Kelas harus dipilih.'
    );
  }
  // ----------------------------------------------------------
  // SCHOOL CONTEXT
  // ----------------------------------------------------------
  const context =
    getCurrentUserContext();
  if (
    !context ||
    !context.school ||
    !context.school.spreadsheetId
  ) {
    throw new Error(
      'School Context tidak valid.'
    );
  }
  // ----------------------------------------------------------
  // SPREADSHEET SEKOLAH AKTIF
  // ----------------------------------------------------------
  const ss =
    SpreadsheetApp.openById(
      context.school.spreadsheetId
    );
  // ----------------------------------------------------------
  // SHEET SISWA
  // ----------------------------------------------------------
  const sheet =
    ss.getSheetByName(
      PRESENSI_CONFIG.SHEET_SISWA
    );
  if (!sheet) {
    throw new Error(
      'Sheet SISWA tidak ditemukan pada ' +
      'Spreadsheet sekolah.'
    );
  }
  const lastRow =
    sheet.getLastRow();
  const lastColumn =
    sheet.getLastColumn();
  if (
    lastRow < 2 ||
    lastColumn < 1
  ) {
    return {
      success:
        true,
      tanggal:
        tanggal,
      kelas:
        kelas,
      npsn:
        context.npsn || '',
      sekolah:
        context.school.namaSekolah || '',
      siswa:
        []
    };
  }
  const values =
    sheet
      .getRange(
        1,
        1,
        lastRow,
        lastColumn
      )
      .getValues();
  const headers =
    normalizeHeaders_(
      values[0]
    );
  // ----------------------------------------------------------
  // CARI KOLOM
  // ----------------------------------------------------------
  const nisnIndex =
    findHeaderIndex_(
      headers,
      [
        'NISN'
      ]
    );
  const nisIndex =
    findHeaderIndex_(
      headers,
      [
        'NIS'
      ]
    );
  const namaIndex =
    findHeaderIndex_(
      headers,
      [
        'NAMA',
        'NAMA_SISWA'
      ]
    );
  const kelasIndex =
    findHeaderIndex_(
      headers,
      [
        'KELAS',
        'ROMBEL'
      ]
    );
  const statusIndex =
    findHeaderIndex_(
      headers,
      [
        'STATUS'
      ]
    );
  if (
    namaIndex === -1
  ) {
    throw new Error(
      'Kolom NAMA tidak ditemukan pada sheet SISWA.'
    );
  }
  if (
    kelasIndex === -1
  ) {
    throw new Error(
      'Kolom KELAS tidak ditemukan pada sheet SISWA.'
    );
  }
  const hasil = [];
  // ----------------------------------------------------------
  // FILTER SISWA BERDASARKAN KELAS
  // ----------------------------------------------------------
  for (
    let i = 1;
    i < values.length;
    i++
  ) {
    const row =
      values[i];
    const rowKelas =
      String(
        row[kelasIndex] || ''
      )
      .trim();
    // --------------------------------------------------------
    // KELAS TIDAK SESUAI
    // --------------------------------------------------------
    if (
      rowKelas.toUpperCase() !==
      kelas.toUpperCase()
    ) {
      continue;
    }
    // --------------------------------------------------------
    // STATUS SISWA
    //
    // Kosong → tetap dianggap aktif.
    // ACTIVE / AKTIF → ditampilkan.
    // Selain itu → tidak ditampilkan.
    // --------------------------------------------------------
    if (
      statusIndex > -1
    ) {
      const status =
        String(
          row[statusIndex] || ''
        )
        .trim()
        .toUpperCase();
      if (
        status &&
        status !== 'ACTIVE' &&
        status !== 'AKTIF'
      ) {
        continue;
      }
    }
    // --------------------------------------------------------
    // DATA SISWA
    // --------------------------------------------------------
    hasil.push({
      nisn:
        nisnIndex > -1
          ? String(
              row[nisnIndex] || ''
            ).trim()
          : '',
      nis:
        nisIndex > -1
          ? String(
              row[nisIndex] || ''
            ).trim()
          : '',
      nama:
        String(
          row[namaIndex] || ''
        ).trim(),
      kelas:
        rowKelas,
      status:
        'HADIR',
      keterangan:
        ''
    });
  }
  // ----------------------------------------------------------
  // SORT NAMA
  // ----------------------------------------------------------
  hasil.sort(
    function(a, b) {
      return String(
        a.nama || ''
      )
      .localeCompare(
        String(
          b.nama || ''
        ),
        'id',
        {
          sensitivity:
            'base'
        }
      );
    }
  );
  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------
  return {
    success:
      true,
    tanggal:
      tanggal,
    kelas:
      kelas,
    npsn:
      context.npsn || '',
    sekolah:
      context.school.namaSekolah || '',
    siswa:
      hasil
  };
}
/* ============================================================
   CEK PRESENSI YANG SUDAH ADA
   ============================================================
   Digunakan untuk menampilkan kembali status yang sebelumnya
   sudah disimpan.
   ============================================================ */
function cekPresensiPerkelas(
  tanggal,
  kelas
) {
  tanggal =
    String(
      tanggal || ''
    ).trim();
  kelas =
    String(
      kelas || ''
    ).trim();
  if (!tanggal || !kelas) {
    return [];
  }
  // ----------------------------------------------------------
  // SCHOOL CONTEXT
  // ----------------------------------------------------------
  const context =
    getCurrentUserContext();
  if (
    !context ||
    !context.school ||
    !context.school.spreadsheetId
  ) {
    throw new Error(
      'School Context tidak valid.'
    );
  }
  // ----------------------------------------------------------
  // SPREADSHEET SEKOLAH
  // ----------------------------------------------------------
  const ss =
    SpreadsheetApp.openById(
      context.school.spreadsheetId
    );
  const sheet =
    ss.getSheetByName(
      PRESENSI_CONFIG.SHEET_TRANSAKSI
    );
  if (!sheet) {
    throw new Error(
      'Sheet TRX_PRESENSI tidak ditemukan pada ' +
      'Spreadsheet sekolah.'
    );
  }
  const lastRow =
    sheet.getLastRow();
  const lastColumn =
    sheet.getLastColumn();
  if (
    lastRow < 2 ||
    lastColumn < 1
  ) {
    return [];
  }
  const values =
    sheet
      .getRange(
        1,
        1,
        lastRow,
        lastColumn
      )
      .getValues();
  const headers =
    normalizeHeaders_(
      values[0]
    );
  const tanggalIndex =
    findHeaderIndex_(
      headers,
      [
        'TANGGAL'
      ]
    );
  const kelasIndex =
    findHeaderIndex_(
      headers,
      [
        'KELAS'
      ]
    );
  const nisnIndex =
    findHeaderIndex_(
      headers,
      [
        'NISN'
      ]
    );
  const statusIndex =
    findHeaderIndex_(
      headers,
      [
        'STATUS'
      ]
    );
  if (
    tanggalIndex === -1 ||
    kelasIndex === -1 ||
    nisnIndex === -1 ||
    statusIndex === -1
  ) {
    return [];
  }
  const hasil = [];
  // ----------------------------------------------------------
  // SCAN TRANSAKSI
  // ----------------------------------------------------------
  for (
    let i = 1;
    i < values.length;
    i++
  ) {
    const row =
      values[i];
    const rowTanggal =
      normalizeDateString_(
        row[tanggalIndex]
      );
    const rowKelas =
      String(
        row[kelasIndex] || ''
      )
      .trim();
    if (
      rowTanggal !==
      tanggal
    ) {
      continue;
    }
    if (
      rowKelas.toUpperCase() !==
      kelas.toUpperCase()
    ) {
      continue;
    }
    hasil.push({
      nisn:
        String(
          row[nisnIndex] || ''
        ).trim(),
      status:
        String(
          row[statusIndex] || ''
        )
        .trim()
        .toUpperCase()
    });
  }
  return hasil;
}
/* ============================================================
   SIMPAN PRESENSI
   ============================================================
   FASE 5.3:
   Menulis langsung ke TRX_PRESENSI.
   Integrasi penuh dengan TransactionService dapat dilakukan
   pada FASE 5.4.
   ============================================================ */
function simpanPresensiPerkelas(
  payload
) {
  // ----------------------------------------------------------
  // VALIDASI PAYLOAD
  // ----------------------------------------------------------
  if (!payload) {
    throw new Error(
      'Data presensi tidak ditemukan.'
    );
  }
  const tanggal =
    String(
      payload.tanggal || ''
    ).trim();
  const kelas =
    String(
      payload.kelas || ''
    ).trim();
  const data =
    payload.data;
  if (!tanggal) {
    throw new Error(
      'Tanggal belum dipilih.'
    );
  }
  if (!kelas) {
    throw new Error(
      'Kelas belum dipilih.'
    );
  }
  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    throw new Error(
      'Tidak ada siswa yang akan disimpan.'
    );
  }
  // ----------------------------------------------------------
  // SCHOOL CONTEXT
  // ----------------------------------------------------------
  const context =
    getCurrentUserContext();
  if (
    !context ||
    !context.school ||
    !context.school.spreadsheetId
  ) {
    throw new Error(
      'School Context tidak valid.'
    );
  }
  // ----------------------------------------------------------
  // SPREADSHEET SEKOLAH AKTIF
  // ----------------------------------------------------------
  const ss =
    SpreadsheetApp.openById(
      context.school.spreadsheetId
    );
  const sheet =
    ss.getSheetByName(
      PRESENSI_CONFIG.SHEET_TRANSAKSI
    );
  if (!sheet) {
    throw new Error(
      'Sheet TRX_PRESENSI tidak ditemukan pada ' +
      'Spreadsheet sekolah.'
    );
  }
  // ----------------------------------------------------------
  // HEADER
  // ----------------------------------------------------------
  const lastColumn =
    sheet.getLastColumn();
  if (lastColumn < 1) {
    throw new Error(
      'TRX_PRESENSI belum memiliki header.'
    );
  }
  const headers =
    normalizeHeaders_(
      sheet
        .getRange(
          1,
          1,
          1,
          lastColumn
        )
        .getValues()[0]
    );
  // ----------------------------------------------------------
  // HEADER WAJIB
  // ----------------------------------------------------------
  const requiredHeaders = [
    'TRANSACTION_ID',
    'TIMESTAMP',
    'NPSN',
    'USER_ID',
    'EMAIL',
    'NIP',
    'NAMA_USER',
    'ROLE',
    'TANGGAL',
    'KELAS',
    'NISN',
    'NAMA_SISWA',
    'STATUS',
    'KETERANGAN'
  ];
  const missingHeaders =
    requiredHeaders.filter(
      function(header) {
        return (
          headers.indexOf(
            header
          ) === -1
        );
      }
    );
  if (
    missingHeaders.length > 0
  ) {
    throw new Error(
      'Header TRX_PRESENSI belum lengkap: ' +
      missingHeaders.join(', ')
    );
  }
  // ----------------------------------------------------------
  // MAPPING KOLOM
  // ----------------------------------------------------------
  const col = {};
  headers.forEach(
    function(header, index) {
      col[header] =
        index;
    }
  );
  // ----------------------------------------------------------
  // TRANSACTION ID
  // ----------------------------------------------------------
  const transactionId =
    createPresensiTransactionId_(
      context.npsn
    );
  const timestamp =
    new Date();
  const rows = [];
  // ----------------------------------------------------------
  // VALIDASI & BUILD ROW
  // ----------------------------------------------------------
  data.forEach(
    function(item) {
      if (!item) {
        return;
      }
      const nisn =
        String(
          item.nisn || ''
        ).trim();
      const nama =
        String(
          item.nama || ''
        ).trim();
      const status =
        String(
          item.status ||
          'HADIR'
        )
        .trim()
        .toUpperCase();
      const keterangan =
        String(
          item.keterangan || ''
        ).trim();
      // ------------------------------------------------------
      // VALIDASI
      // ------------------------------------------------------
      if (!nama) {
        throw new Error(
          'Terdapat siswa tanpa nama.'
        );
      }
      if (
        !PRESENSI_CONFIG.STATUS_PRESENSI
          .includes(status)
      ) {
        throw new Error(
          'Status presensi tidak valid untuk ' +
          nama +
          ': ' +
          status
        );
      }
      // ------------------------------------------------------
      // BUAT ROW
      // ------------------------------------------------------
      const row =
        new Array(
          headers.length
        )
        .fill('');
      row[col.TRANSACTION_ID] =
        transactionId;
      row[col.TIMESTAMP] =
        timestamp;
      row[col.NPSN] =
        context.npsn || '';
      row[col.USER_ID] =
        context.userId || '';
      row[col.EMAIL] =
        context.email || '';
      row[col.NIP] =
        context.nip || '';
      row[col.NAMA_USER] =
        context.nama || '';
      row[col.ROLE] =
        context.role || '';
      row[col.TANGGAL] =
        tanggal;
      row[col.KELAS] =
        kelas;
      row[col.NISN] =
        nisn;
      row[col.NAMA_SISWA] =
        nama;
      row[col.STATUS] =
        status;
      row[col.KETERANGAN] =
        keterangan;
      rows.push(
        row
      );
    }
  );
  if (
    rows.length === 0
  ) {
    throw new Error(
      'Tidak ada data presensi yang valid.'
    );
  }
  // ----------------------------------------------------------
  // LOCK
  // ----------------------------------------------------------
  //
  // Mencegah dua guru menulis bersamaan secara bersamaan.
  //
  const lock =
    LockService
      .getScriptLock();
  lock.waitLock(
    30000
  );
  try {
    // --------------------------------------------------------
    // TULIS SEKALIGUS
    // --------------------------------------------------------
    const startRow =
      sheet.getLastRow() + 1;
    sheet
      .getRange(
        startRow,
        1,
        rows.length,
        headers.length
      )
      .setValues(
        rows
      );
    // --------------------------------------------------------
    // LOG
    // --------------------------------------------------------
    tulisLogPresensiPerkelas_({
      context:
        context,
      transactionId:
        transactionId,
      tanggal:
        tanggal,
      kelas:
        kelas,
      jumlah:
        rows.length
    });
  }
  finally {
    lock.releaseLock();
  }
  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------
  return {
    success:
      true,
    transactionId:
      transactionId,
    npsn:
      context.npsn || '',
    sekolah:
      context.school.namaSekolah || '',
    spreadsheetId:
      context.school.spreadsheetId || '',
    tanggal:
      tanggal,
    kelas:
      kelas,
    jumlah:
      rows.length,
    message:
      'Presensi berhasil disimpan.'
  };
}
/* ============================================================
   CREATE TRANSACTION ID
   ============================================================ */
function createPresensiTransactionId_(
  npsn
) {
  const timezone =
    Session.getScriptTimeZone() ||
    'Asia/Jakarta';
  const waktu =
    Utilities.formatDate(
      new Date(),
      timezone,
      'yyyyMMddHHmmss'
    );
  const random =
    Utilities.getUuid()
      .replace(
        /-/g,
        ''
      )
      .substring(
        0,
        8
      )
      .toUpperCase();
  return (
    'PRS-' +
    String(
      npsn || 'UNKNOWN'
    ) +
    '-' +
    waktu +
    '-' +
    random
  );
}
/* ============================================================
   LOG
   ============================================================ */
function tulisLogPresensiPerkelas_(
  data
) {
  try {
    if (
      !data ||
      !data.context ||
      !data.context.school ||
      !data.context.school.spreadsheetId
    ) {
      return;
    }
    const ss =
      SpreadsheetApp.openById(
        data.context
          .school
          .spreadsheetId
      );
    const sheet =
      ss.getSheetByName(
        PRESENSI_CONFIG.SHEET_LOG
      );
    if (!sheet) {
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
      normalizeHeaders_(
        sheet
          .getRange(
            1,
            1,
            1,
            lastColumn
          )
          .getValues()[0]
      );
    const row =
      new Array(
        headers.length
      )
      .fill('');
    const values = {
      TIMESTAMP:
        new Date(),
      NPSN:
        data.context.npsn || '',
      USER_ID:
        data.context.userId || '',
      EMAIL:
        data.context.email || '',
      NIP:
        data.context.nip || '',
      NAMA_USER:
        data.context.nama || '',
      ROLE:
        data.context.role || '',
      ACTION:
        'CREATE',
      MODULE:
        'PRESENSI_PERKELAS',
      DESCRIPTION:
        'Simpan presensi ' +
        data.kelas +
        ' tanggal ' +
        data.tanggal +
        ' (' +
        data.jumlah +
        ' siswa)',
      TRANSACTION_ID:
        data.transactionId || ''
    };
    headers.forEach(
      function(header, index) {
        if (
          Object.prototype
            .hasOwnProperty
            .call(
              values,
              header
            )
        ) {
          row[index] =
            values[header];
        }
      }
    );
    sheet
      .getRange(
        sheet.getLastRow() + 1,
        1,
        1,
        row.length
      )
      .setValues([
        row
      ]);
  }
  catch (error) {
    /*
     * Jangan menggagalkan penyimpanan
     * presensi hanya karena LOG gagal.
     */
    console.error(
      'LOG PRESENSI ERROR:',
      error
    );
  }
}
/* ============================================================
   HELPER NORMALIZE HEADER
   ============================================================ */
function normalizeHeaders_(
  headers
) {
  return headers.map(
    function(header) {
      return String(
        header || ''
      )
      .trim()
      .toUpperCase()
      .replace(
        /\s+/g,
        '_'
      );
    }
  );
}
/* ============================================================
   HELPER FIND HEADER
   ============================================================ */
function findHeaderIndex_(
  headers,
  names
) {
  for (
    let i = 0;
    i < names.length;
    i++
  ) {
    const target =
      String(
        names[i] || ''
      )
      .trim()
      .toUpperCase()
      .replace(
        /\s+/g,
        '_'
      );
    const index =
      headers.indexOf(
        target
      );
    if (
      index > -1
    ) {
      return index;
    }
  }
  return -1;
}
/* ============================================================
   NORMALIZE DATE
   ============================================================ */
function normalizeDateString_(
  value
) {
  if (
    value instanceof Date
  ) {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone() ||
        'Asia/Jakarta',
      'yyyy-MM-dd'
    );
  }
  const text =
    String(
      value || ''
    ).trim();
  if (!text) {
    return '';
  }
  // yyyy-MM-dd
  if (
    /^\d{4}-\d{2}-\d{2}$/
      .test(text)
  ) {
    return text;
  }
  const date =
    new Date(
      text
    );
  if (
    isNaN(
      date.getTime()
    )
  ) {
    return text;
  }
  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone() ||
      'Asia/Jakarta',
    'yyyy-MM-dd'
  );
}
/* ============================================================
   TEST 1
   ============================================================
   Tes School Context + KELAS.
   Jalankan dari Apps Script Editor.
   ============================================================ */
function testLoadPresensiPerkelas() {
  const result =
    loadPresensiPerkelas();
  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
  return result;
}
/* ============================================================
   TEST 2
   ============================================================
   Tes pengambilan siswa per kelas.
   ============================================================ */
function testGetSiswaPresensiPerkelas() {
  const tanggal =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() ||
        'Asia/Jakarta',
      'yyyy-MM-dd'
    );
  /*
   * GANTI XI-A sesuai kelas yang benar-benar
   * ada di sekolah yang sedang diuji.
   */
  const kelas =
    'XI-A';
  const result =
    getSiswaPresensiPerkelas(
      tanggal,
      kelas
    );
  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
  return result;
}
/* ============================================================
   TEST 3
   ============================================================
   Tes cek transaksi presensi.
   ============================================================ */
function testCekPresensiPerkelas() {
  const tanggal =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() ||
        'Asia/Jakarta',
      'yyyy-MM-dd'
    );
  const kelas =
    'XI-A';
  const result =
    cekPresensiPerkelas(
      tanggal,
      kelas
    );
  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
  return result;
}
/* ============================================================
   TEST 4
   ============================================================
   Tes penyimpanan satu siswa.
   JANGAN dijalankan berulang kali tanpa sengaja karena
   akan menambah transaksi.
   ============================================================ */
function testSimpanPresensiPerkelas() {
  const tanggal =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() ||
        'Asia/Jakarta',
      'yyyy-MM-dd'
    );
  const kelas =
    'XI-A';
  const payload = {
    tanggal:
      tanggal,
    kelas:
      kelas,
    data: [
      {
        nisn:
          'TEST-NISN-001',
        nama:
          'TEST SISWA PRESENSI',
        status:
          'HADIR',
        keterangan:
          'TEST FASE 5.3'
      }
    ]
  };
  const result =
    simpanPresensiPerkelas(
      payload
    );
  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
  return result;
}
/**
 * ============================================================
 * SIM SATRIA
 * PRESENSI PERKELAS
 * MULTI SCHOOL
 * ============================================================
 *
 * Mengambil daftar kelas dari Spreadsheet sekolah
 * berdasarkan School Context akun yang sedang login.
 */
function getKelasPresensiPerkelas() {
  try {
    // ========================================================
    // 1. AMBIL SCHOOL CONTEXT
    // ========================================================
    const context =
      getCurrentUserContext();
    if (!context) {
      throw new Error(
        'School Context tidak ditemukan.'
      );
    }
    // ========================================================
    // 2. AMBIL SPREADSHEET ID SEKOLAH AKTIF
    // ========================================================
    let spreadsheetId = '';
    /*
     * Struktur context yang digunakan SIM SATRIA:
     *
     * context.school.spreadsheetId
     */
    if (
      context.school &&
      context.school.spreadsheetId
    ) {
      spreadsheetId =
        String(
          context.school.spreadsheetId
        ).trim();
    }
    if (!spreadsheetId) {
      throw new Error(
        'Spreadsheet sekolah belum ditemukan pada School Context.'
      );
    }
    // ========================================================
    // 3. BUKA SPREADSHEET SEKOLAH AKTIF
    // ========================================================
    const ss =
      SpreadsheetApp.openById(
        spreadsheetId
      );
    // ========================================================
    // 4. CARI SHEET KELAS
    // ========================================================
    const sheet =
      ss.getSheetByName('KELAS');
    if (!sheet) {
      throw new Error(
        'Sheet "KELAS" tidak ditemukan pada Spreadsheet sekolah.'
      );
    }
    // ========================================================
    // 5. AMBIL DATA
    // ========================================================
    const lastRow =
      sheet.getLastRow();
    const lastColumn =
      sheet.getLastColumn();
    if (
      lastRow < 2 ||
      lastColumn < 1
    ) {
      return {
        success:
          true,
        kelas:
          [],
        spreadsheetId:
          spreadsheetId,
        spreadsheetName:
          ss.getName(),
        message:
          'Sheet KELAS belum memiliki data.'
      };
    }
    const values =
      sheet
        .getRange(
          1,
          1,
          lastRow,
          lastColumn
        )
        .getDisplayValues();
    // ========================================================
    // 6. HEADER
    // ========================================================
    const headers =
      values[0].map(
        function(h) {
          return String(
            h || ''
          )
          .trim()
          .toLowerCase();
        }
      );
    // ========================================================
    // 7. CARI KOLOM KELAS
    // ========================================================
    const kandidatHeader = [
      'kelas',
      'nama kelas',
      'nama_kelas',
      'rombel',
      'nama rombel',
      'nama_rombel'
    ];
    let kelasColumn =
      -1;
    for (
      let i = 0;
      i < kandidatHeader.length;
      i++
    ) {
      const index =
        headers.indexOf(
          kandidatHeader[i]
        );
      if (index !== -1) {
        kelasColumn =
          index;
        break;
      }
    }
    // ========================================================
    // 8. JIKA HEADER KELAS TIDAK DITEMUKAN
    // ========================================================
    if (kelasColumn === -1) {
      /*
       * Fallback:
       * kolom pertama dianggap kolom kelas.
       *
       * Ini membuat sistem tetap kompatibel
       * dengan sheet KELAS sederhana:
       *
       * A
       * X
       * XI
       * XII
       */
      kelasColumn =
        0;
    }
    // ========================================================
    // 9. AMBIL KELAS
    // ========================================================
    const kelasMap =
      {};
    for (
      let r = 1;
      r < values.length;
      r++
    ) {
      const namaKelas =
        String(
          values[r][kelasColumn] || ''
        ).trim();
      if (!namaKelas) {
        continue;
      }
      /*
       * Abaikan header yang mungkin ikut terbaca
       */
      if (
        namaKelas.toLowerCase() ===
        'kelas'
      ) {
        continue;
      }
      kelasMap[
        namaKelas
      ] = true;
    }
    // ========================================================
    // 10. SORT
    // ========================================================
    const kelas =
      Object.keys(
        kelasMap
      );
    kelas.sort(
      compareKelasPresensi_
    );
    // ========================================================
    // 11. RETURN
    // ========================================================
    return {
      success:
        true,
      kelas:
        kelas,
      npsn:
        context.npsn ||
        (
          context.school
            ? context.school.npsn
            : ''
        ) ||
        '',
      sekolah:
        context.school &&
        context.school.namaSekolah
          ? context.school.namaSekolah
          : '',
      spreadsheetId:
        spreadsheetId,
      spreadsheetName:
        ss.getName(),
      jumlah:
        kelas.length
    };
  }
  catch (error) {
    return {
      success:
        false,
      kelas:
        [],
      error:
        error &&
        error.message
          ? error.message
          : String(error)
    };
  }
}
/**
 * ============================================================
 * SORT KELAS
 * ============================================================
 */
function compareKelasPresensi_(
  a,
  b
) {
  const aa =
    String(a)
      .trim()
      .toUpperCase();
  const bb =
    String(b)
      .trim()
      .toUpperCase();
  /*
   * Prioritas:
   * X → XI → XII
   * kemudian angka rombel
   */
  const urutan =
    {
      'X': 10,
      'XI': 11,
      'XII': 12,
      'XIII': 13
    };
  function parseKelas(
    value
  ) {
    const match =
      value.match(
        /^(XIII|XII|XI|X)(?:\s*[-.]?\s*(\d+))?/i
      );
    if (!match) {
      return [
        999,
        999,
        value
      ];
    }
    const tingkat =
      urutan[
        match[1].toUpperCase()
      ] || 999;
    const rombel =
      match[2]
        ? Number(match[2])
        : 0;
    return [
      tingkat,
      rombel,
      value
    ];
  }
  const pa =
    parseKelas(aa);
  const pb =
    parseKelas(bb);
  if (
    pa[0] !== pb[0]
  ) {
    return pa[0] - pb[0];
  }
  if (
    pa[1] !== pb[1]
  ) {
    return pa[1] - pb[1];
  }
  return String(
    pa[2]
  ).localeCompare(
    String(pb[2])
  );
}
function testKelasPresensiPerkelas() {
  const result =
    getKelasPresensiPerkelas();
  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
  return result;
}
function getPresensiPerkelasData(
  tanggal,
  kelas
) {
  try {
    /* =====================================================
       VALIDASI
       ===================================================== */
    if (!tanggal) {
      throw new Error(
        'Tanggal belum dipilih.'
      );
    }
    if (!kelas) {
      throw new Error(
        'Kelas belum dipilih.'
      );
    }
    /* =====================================================
       SCHOOL CONTEXT
       ===================================================== */
    const context =
      getCurrentUserContext();
    if (!context) {
      throw new Error(
        'School Context tidak ditemukan.'
      );
    }
    const spreadsheetId =
      String(
        context.school &&
        context.school.spreadsheetId
          ? context.school.spreadsheetId
          : ''
      ).trim();
    if (!spreadsheetId) {
      throw new Error(
        'Spreadsheet sekolah aktif tidak ditemukan.'
      );
    }
    /* =====================================================
       SPREADSHEET SEKOLAH AKTIF
       ===================================================== */
    const ss =
      SpreadsheetApp.openById(
        spreadsheetId
      );
    /* =====================================================
       SHEET SISWA
       ===================================================== */
    const sheetSiswa =
      ss.getSheetByName(
        'SISWA'
      );
    if (!sheetSiswa) {
      throw new Error(
        'Sheet "SISWA" tidak ditemukan pada Spreadsheet sekolah.'
      );
    }
    const lastRow =
      sheetSiswa.getLastRow();
    const lastColumn =
      sheetSiswa.getLastColumn();
    if (
      lastRow < 2 ||
      lastColumn < 1
    ) {
      return {
        success: true,
        tanggal: tanggal,
        kelas: kelas,
        data: [],
        sekolah:
          context.school.namaSekolah ||
          '',
        npsn:
          context.school.npsn ||
          '',
        spreadsheetName:
          ss.getName()
      };
    }
    /* =====================================================
       DATA SISWA
       ===================================================== */
    const values =
      sheetSiswa
        .getRange(
          1,
          1,
          lastRow,
          lastColumn
        )
        .getDisplayValues();
    const headers =
      values[0].map(
        function(h) {
          return String(
            h || ''
          )
          .trim()
          .toLowerCase();
        }
      );
    /* =====================================================
       CARI KOLOM
       ===================================================== */
    const kelasIndex =
      PP_findHeader_(
        headers,
        [
          'kelas',
          'nama kelas',
          'nama_kelas',
          'rombel'
        ]
      );
    const namaIndex =
      PP_findHeader_(
        headers,
        [
          'nama',
          'nama siswa',
          'nama_siswa'
        ]
      );
    const nisnIndex =
      PP_findHeader_(
        headers,
        [
          'nisn'
        ]
      );
    if (kelasIndex === -1) {
      throw new Error(
        'Kolom Kelas pada sheet SISWA tidak ditemukan.'
      );
    }
    if (namaIndex === -1) {
      throw new Error(
        'Kolom Nama pada sheet SISWA tidak ditemukan.'
      );
    }
    /* =====================================================
       FILTER KELAS
       ===================================================== */
    const targetKelas =
      String(
        kelas
      )
      .trim()
      .toLowerCase();
    const data =
      [];
    for (
      let i = 1;
      i < values.length;
      i++
    ) {
      const row =
        values[i];
      const rowKelas =
        String(
          row[kelasIndex] || ''
        )
        .trim()
        .toLowerCase();
      if (
        rowKelas !==
        targetKelas
      ) {
        continue;
      }
      data.push({
        nisn:
          nisnIndex >= 0
            ? String(
                row[nisnIndex] || ''
              ).trim()
            : '',
        nama:
          String(
            row[namaIndex] || ''
          ).trim(),
        kelas:
          String(
            row[kelasIndex] || ''
          ).trim(),
        status:
          'HADIR'
      });
    }
    /* =====================================================
       RETURN
       ===================================================== */
    return {
      success: true,
      tanggal:
        tanggal,
      kelas:
        kelas,
      data:
        data,
      jumlah:
        data.length,
      sekolah:
        context.school.namaSekolah ||
        '',
      npsn:
        context.school.npsn ||
        '',
      spreadsheetId:
        spreadsheetId,
      spreadsheetName:
        ss.getName()
    };
  }
  catch (error) {
    return {
      success: false,
      data: [],
      error:
        error &&
        error.message
          ? error.message
          : String(error)
    };
  }
}
/**
 * ============================================================
 * SIM SATRIA
 * FASE 5.3
 * PRESENSI PER KELAS
 *
 * DATABASE:
 * TRX_PRESENSI
 *
 * HEADER RESMI:
 * TRANSACTION_ID
 * TIMESTAMP
 * NPSN
 * USER_ID
 * EMAIL
 * NIP
 * NAMA_USER
 * ROLE
 * TANGGAL
 * KELAS
 * NISN
 * NAMA_SISWA
 * STATUS
 * KETERANGAN
 *
 * MULTI SCHOOL SAFE
 * ============================================================
 */
function simpanPresensiPerkelas(
  tanggal,
  kelas,
  data
) {
  const log = {
    success: false,
    startedAt: new Date().toISOString(),
    finishedAt: '',
    step: '',
    school: {},
    user: {},
    database: {},
    data: {
      jumlahDikirim: 0,
      jumlahValid: 0,
      inserted: 0,
      updated: 0
    },
    message: '',
    error: ''
  };
  try {
    /* ======================================================
       1. VALIDASI INPUT
       ====================================================== */
    log.step =
      'VALIDASI INPUT';
    console.log(
      '[PRESENSI] STEP 1 - Validasi input'
    );
    tanggal =
      String(
        tanggal || ''
      ).trim();
    kelas =
      String(
        kelas || ''
      ).trim();
    if (!tanggal) {
      throw new Error(
        'Tanggal belum dipilih.'
      );
    }
    if (!kelas) {
      throw new Error(
        'Kelas belum dipilih.'
      );
    }
    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      throw new Error(
        'Data presensi kosong.'
      );
    }
    log.data.jumlahDikirim =
      data.length;
    /* ======================================================
       2. SCHOOL CONTEXT
       ====================================================== */
    log.step =
      'MENGAMBIL SCHOOL CONTEXT';
    console.log(
      '[PRESENSI] STEP 2 - School Context'
    );
    const context =
      getCurrentUserContext();
    if (!context) {
      throw new Error(
        'School Context tidak ditemukan.'
      );
    }
    /* ======================================================
       3. IDENTITAS SEKOLAH
       ====================================================== */
    log.step =
      'MEMBACA IDENTITAS SEKOLAH';
    const school =
      context.school ||
      {};
    const npsn =
      String(
        school.npsn ||
        context.npsn ||
        ''
      ).trim();
    const namaSekolah =
      String(
        school.namaSekolah ||
        school.nama ||
        context.sekolah ||
        ''
      ).trim();
    const spreadsheetId =
      String(
        school.spreadsheetId ||
        context.spreadsheetId ||
        ''
      ).trim();
    log.school = {
      npsn:
        npsn,
      namaSekolah:
        namaSekolah,
      spreadsheetId:
        spreadsheetId
    };
    console.log(
      '[PRESENSI] SCHOOL:',
      JSON.stringify(
        log.school
      )
    );
    if (!spreadsheetId) {
      throw new Error(
        'Spreadsheet sekolah aktif tidak ditemukan.'
      );
    }
    /* ======================================================
       4. IDENTITAS USER
       ====================================================== */
    log.step =
      'MEMBACA IDENTITAS USER';
    const user =
      context.user ||
      {};
    const userId =
      String(
        user.userId ||
        user.id ||
        context.userId ||
        ''
      ).trim();
    const email =
      String(
        user.email ||
        context.email ||
        ''
      ).trim();
    const nip =
      String(
        user.nip ||
        context.nip ||
        ''
      ).trim();
    const namaUser =
      String(
        user.nama ||
        user.name ||
        context.nama ||
        ''
      ).trim();
    const role =
      String(
        user.role ||
        context.role ||
        ''
      ).trim();
    log.user = {
      userId:
        userId,
      email:
        email,
      nip:
        nip,
      nama:
        namaUser,
      role:
        role
    };
    console.log(
      '[PRESENSI] USER:',
      JSON.stringify(
        log.user
      )
    );
    if (!userId) {
      throw new Error(
        'USER_ID tidak dapat diperoleh dari identitas login.'
      );
    }
    if (!email) {
      throw new Error(
        'EMAIL tidak dapat diperoleh dari identitas login.'
      );
    }
    /* ======================================================
       5. BUKA DATABASE SEKOLAH AKTIF
       ====================================================== */
    log.step =
      'MEMBUKA DATABASE SEKOLAH';
    const ss =
      SpreadsheetApp.openById(
        spreadsheetId
      );
    log.database = {
      spreadsheetId:
        spreadsheetId,
      spreadsheetName:
        ss.getName(),
      sheetName:
        'TRX_PRESENSI'
    };
    console.log(
      '[PRESENSI] DATABASE:',
      JSON.stringify(
        log.database
      )
    );
    /* ======================================================
       6. CARI TRX_PRESENSI
       ====================================================== */
    log.step =
      'MENCARI TRX_PRESENSI';
    const sheet =
      ss.getSheetByName(
        'TRX_PRESENSI'
      );
    /*
     * TIDAK MEMBUAT SHEET BARU.
     */
    if (!sheet) {
      throw new Error(
        'Sheet "TRX_PRESENSI" tidak ditemukan pada Spreadsheet sekolah.'
      );
    }
    /* ======================================================
       7. VALIDASI HEADER
       ====================================================== */
    log.step =
      'MEMERIKSA HEADER';
    const lastColumn =
      sheet.getLastColumn();
    const lastRow =
      sheet.getLastRow();
    if (
      lastColumn === 0
    ) {
      throw new Error(
        'TRX_PRESENSI tidak memiliki header.'
      );
    }
    const headers =
      sheet
        .getRange(
          1,
          1,
          1,
          lastColumn
        )
        .getDisplayValues()[0]
        .map(
          function(header) {
            return String(
              header || ''
            )
            .trim();
          }
        );
    console.log(
      '[PRESENSI] HEADERS:',
      JSON.stringify(
        headers
      )
    );
    /* ======================================================
       8. HEADER RESMI
       ====================================================== */
    const requiredHeaders = [
      'TRANSACTION_ID',
      'TIMESTAMP',
      'NPSN',
      'USER_ID',
      'EMAIL',
      'NIP',
      'NAMA_USER',
      'ROLE',
      'TANGGAL',
      'KELAS',
      'NISN',
      'NAMA_SISWA',
      'STATUS',
      'KETERANGAN'
    ];
    const col = {};
    headers.forEach(
      function(header, index) {
        col[
          header
            .toUpperCase()
            .trim()
        ] =
          index + 1;
      }
    );
    const missingHeaders =
      requiredHeaders.filter(
        function(header) {
          return !col[
            header
          ];
        }
      );
    if (
      missingHeaders.length > 0
    ) {
      throw new Error(
        'Header TRX_PRESENSI belum lengkap: ' +
        missingHeaders.join(
          ', '
        )
      );
    }
    /* ======================================================
       9. BACA DATA LAMA
       ====================================================== */
    log.step =
      'MEMERIKSA DATA LAMA';
    const existingRows =
      lastRow >= 2
        ? sheet
            .getRange(
              2,
              1,
              lastRow - 1,
              headers.length
            )
            .getDisplayValues()
        : [];
    console.log(
      '[PRESENSI] DATA LAMA:',
      existingRows.length
    );
    /* ======================================================
       10. PROSES DATA
       ====================================================== */
    log.step =
      'MENYIMPAN DATA';
    const now =
      new Date();
    const transactionIds =
      [];
    const allowedStatus = [
      'HADIR',
      'IZIN',
      'SAKIT',
      'ALPA'
    ];
    data.forEach(
      function(item, index) {
        const nisn =
          String(
            item.nisn ||
            ''
          ).trim();
        const namaSiswa =
          String(
            item.nama ||
            item.namaSiswa ||
            ''
          ).trim();
        const status =
          String(
            item.status ||
            'HADIR'
          )
          .trim()
          .toUpperCase();
        const keterangan =
          String(
            item.keterangan ||
            ''
          ).trim();
        /*
         * Nama siswa wajib ada.
         */
        if (!namaSiswa) {
          console.log(
            '[PRESENSI] SKIP:',
            index + 1,
            'Nama siswa kosong.'
          );
          return;
        }
        if (
          !allowedStatus.includes(
            status
          )
        ) {
          throw new Error(
            'Status tidak valid untuk siswa ' +
            namaSiswa +
            ': ' +
            status
          );
        }
        log.data.jumlahValid++;
        /* ==================================================
           CARI DATA LAMA
           ================================================== */
        let existingIndex =
          -1;
        for (
          let i = 0;
          i < existingRows.length;
          i++
        ) {
          const row =
            existingRows[i];
          const oldTanggal =
            String(
              row[
                col.TANGGAL - 1
              ] ||
              ''
            ).trim();
          const oldKelas =
            String(
              row[
                col.KELAS - 1
              ] ||
              ''
            ).trim();
          const oldNisn =
            String(
              row[
                col.NISN - 1
              ] ||
              ''
            ).trim();
          /*
           * Identitas utama:
           * tanggal + kelas + NISN
           */
          if (
            oldTanggal ===
              tanggal &&
            oldKelas ===
              kelas &&
            oldNisn ===
              nisn &&
            nisn !== ''
          ) {
            existingIndex =
              i;
            break;
          }
        }
        /* ==================================================
           TRANSACTION ID
           ================================================== */
        const transactionId =
          'PP-' +
          Utilities.formatDate(
            now,
            Session.getScriptTimeZone(),
            'yyyyMMdd-HHmmss'
          ) +
          '-' +
          Utilities
            .getUuid()
            .substring(
              0,
              8
            )
            .toUpperCase();
        transactionIds.push(
          transactionId
        );
        /* ==================================================
           BUAT ROW
           ================================================== */
        const row =
          new Array(
            headers.length
          ).fill('');
        row[
          col.TRANSACTION_ID - 1
        ] =
          transactionId;
        row[
          col.TIMESTAMP - 1
        ] =
          now;
        row[
          col.NPSN - 1
        ] =
          npsn;
        row[
          col.USER_ID - 1
        ] =
          userId;
        row[
          col.EMAIL - 1
        ] =
          email;
        row[
          col.NIP - 1
        ] =
          nip;
        row[
          col.NAMA_USER - 1
        ] =
          namaUser;
        row[
          col.ROLE - 1
        ] =
          role;
        row[
          col.TANGGAL - 1
        ] =
          tanggal;
        row[
          col.KELAS - 1
        ] =
          kelas;
        row[
          col.NISN - 1
        ] =
          nisn;
        row[
          col.NAMA_SISWA - 1
        ] =
          namaSiswa;
        row[
          col.STATUS - 1
        ] =
          status;
        row[
          col.KETERANGAN - 1
        ] =
          keterangan;
        /* ==================================================
           UPDATE
           ================================================== */
        if (
          existingIndex >= 0
        ) {
          sheet
            .getRange(
              existingIndex + 2,
              1,
              1,
              headers.length
            )
            .setValues([
              row
            ]);
          log.data.updated++;
          console.log(
            '[PRESENSI] UPDATE:',
            namaSiswa,
            nisn,
            status
          );
        }
        /* ==================================================
           INSERT
           ================================================== */
        else {
          const targetRow =
            sheet.getLastRow() + 1;
          sheet
            .getRange(
              targetRow,
              1,
              1,
              headers.length
            )
            .setValues([
              row
            ]);
          log.data.inserted++;
          console.log(
            '[PRESENSI] INSERT:',
            namaSiswa,
            nisn,
            status
          );
        }
      }
    );
    /* ======================================================
       11. SELESAI
       ====================================================== */
log.step =
  'MENULIS LOG';
/* ======================================================
   TULIS LOG TRANSAKSI
   ====================================================== */
const logTransactionId =
  'PPB-' +
  Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyyMMdd-HHmmss'
  ) +
  '-' +
  Utilities
    .getUuid()
    .substring(
      0,
      8
    )
    .toUpperCase();
const logResult =
  writePresensiLog_(
    spreadsheetId,
    {
      /* ==============================
         IDENTITAS SEKOLAH
         ============================== */
      npsn:
        npsn,
      /* ==============================
         IDENTITAS USER
         ============================== */
      userId:
        userId,
      email:
        email,
      nip:
        nip,
      namaUser:
        namaUser,
      role:
        role,
      /* ==============================
         LOG ACTION
         ============================== */
      action:
        'SIMPAN',
      /* ==============================
         LOG MODULE
         ============================== */
      module:
        'PRESENSI_PERKELAS',
      /* ==============================
         LOG DESCRIPTION
         ============================== */
      description:
        'Presensi kelas ' +
        kelas +
        ' tanggal ' +
        tanggal +
        '. Jumlah siswa: ' +
        log.data.jumlahValid +
        ', INSERT: ' +
        log.data.inserted +
        ', UPDATE: ' +
        log.data.updated,
      /* ==============================
         TRANSACTION ID
         ============================== */
      transactionId:
        logTransactionId
    }
  );
log.logDatabase =
  logResult;
log.logDatabase =
  logResult;
    log.step =
      'SELESAI';
    log.success =
      true;
    log.message =
      'Presensi berhasil disimpan.';
    log.finishedAt =
      new Date().toISOString();
    console.log(
      '[PRESENSI] SELESAI'
    );
    console.log(
      JSON.stringify(
        log,
        null,
        2
      )
    );
    return {
      success:
        true,
      message:
        'Presensi kelas ' +
        kelas +
        ' tanggal ' +
        tanggal +
        ' berhasil disimpan.',
      sekolah:
        namaSekolah,
      npsn:
        npsn,
      userId:
        userId,
      email:
        email,
      nip:
        nip,
      namaUser:
        namaUser,
      role:
        role,
      spreadsheetId:
        spreadsheetId,
      spreadsheetName:
        ss.getName(),
      sheetName:
        'TRX_PRESENSI',
      tanggal:
        tanggal,
      kelas:
        kelas,
      jumlahData:
        log.data.jumlahValid,
      inserted:
        log.data.inserted,
      updated:
        log.data.updated,
      transactionIds:
        transactionIds,
      log:
        log
    };
  }
  catch (error) {
    log.success =
      false;
    log.error =
      error &&
      error.message
        ? error.message
        : String(error);
    log.finishedAt =
      new Date().toISOString();
    console.error(
      '[PRESENSI] ERROR:',
      log.error
    );
    console.error(
      '[PRESENSI] LOG:',
      JSON.stringify(
        log,
        null,
        2
      )
    );
    return {
      success:
        false,
      error:
        log.error,
      log:
        log
    };
  }
}
/* =========================================================
   HELPER HEADER
   ========================================================= */
function PP_findHeader_(
  headers,
  candidates
) {
  for (
    let i = 0;
    i < candidates.length;
    i++
  ) {
    const index =
      headers.indexOf(
        candidates[i]
      );
    if (index !== -1) {
      return index;
    }
  }
  return -1;
}
/**
 * ============================================================
 * LOG PRESENSI PER KELAS
 * ============================================================
 *
 * Log disimpan pada Spreadsheet sekolah aktif.
 *
 * Jika sheet LOG belum ada:
 * dibuat otomatis.
 *
 * Jika sudah ada:
 * dipertahankan dan ditambahkan baris baru.
 *
 * ============================================================
 */
/**
 * ============================================================
 * SIM SATRIA
 * GLOBAL LOG TRANSACTION
 *
 * HEADER RESMI:
 *
 * TIMESTAMP
 * NPSN
 * USER_ID
 * EMAIL
 * NIP
 * NAMA_USER
 * ROLE
 * ACTION
 * MODULE
 * DESCRIPTION
 * TRANSACTION_ID
 * ============================================================
 */
function writePresensiLog_(
  spreadsheetId,
  logData
) {
  try {
    console.log(
      '[LOG] Mulai menulis LOG.'
    );
    /* ======================================================
       OPEN DATABASE SEKOLAH AKTIF
       ====================================================== */
    const ss =
      SpreadsheetApp.openById(
        spreadsheetId
      );
    /* ======================================================
       AMBIL SHEET LOG
       ====================================================== */
    let sheet =
      ss.getSheetByName(
        'LOG'
      );
    /* ======================================================
       HEADER RESMI LOG
       ====================================================== */
    const LOG_HEADERS = [
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
    ];
    /* ======================================================
       JIKA LOG BELUM ADA
       ====================================================== */
    if (!sheet) {
      console.log(
        '[LOG] Sheet LOG belum ada. Membuat LOG.'
      );
      sheet =
        ss.insertSheet(
          'LOG'
        );
      sheet
        .getRange(
          1,
          1,
          1,
          LOG_HEADERS.length
        )
        .setValues([
          LOG_HEADERS
        ]);
      sheet.setFrozenRows(
        1
      );
    }
    /* ======================================================
       JIKA SHEET SUDAH ADA TETAPI KOSONG
       ====================================================== */
    if (
      sheet.getLastRow() === 0
    ) {
      sheet
        .getRange(
          1,
          1,
          1,
          LOG_HEADERS.length
        )
        .setValues([
          LOG_HEADERS
        ]);
    }
    /* ======================================================
       DATA LOG
       ====================================================== */
    const row = [
      /* 01 TIMESTAMP */
      new Date(),
      /* 02 NPSN */
      logData.npsn ||
        '',
      /* 03 USER_ID */
      logData.userId ||
        '',
      /* 04 EMAIL */
      logData.email ||
        '',
      /* 05 NIP */
      logData.nip ||
        '',
      /* 06 NAMA_USER */
      logData.namaUser ||
        '',
      /* 07 ROLE */
      logData.role ||
        '',
      /* 08 ACTION */
      logData.action ||
        'SIMPAN',
      /* 09 MODULE */
      logData.module ||
        'PRESENSI_PERKELAS',
      /* 10 DESCRIPTION */
      logData.description ||
        '',
      /* 11 TRANSACTION_ID */
      logData.transactionId ||
        ''
    ];
    /* ======================================================
       TULIS LOG
       ====================================================== */
    const targetRow =
      sheet.getLastRow() + 1;
    sheet
      .getRange(
        targetRow,
        1,
        1,
        LOG_HEADERS.length
      )
      .setValues([
        row
      ]);
    /* ======================================================
       FORMAT
       ====================================================== */
    sheet
      .getRange(
        1,
        1,
        1,
        LOG_HEADERS.length
      )
      .setFontWeight(
        'bold'
      );
    sheet.setFrozenRows(
      1
    );
    /* ======================================================
       RETURN
       ====================================================== */
    console.log(
      '[LOG] Berhasil ditulis pada baris:',
      targetRow
    );
    console.log(
      '[LOG] TRANSACTION_ID:',
      logData.transactionId
    );
    return {
      success:
        true,
      sheet:
        'LOG',
      row:
        targetRow,
      transactionId:
        logData.transactionId ||
        ''
    };
  }
  catch (error) {
    console.error(
      '[LOG] Gagal menulis LOG:',
      error
    );
    return {
      success:
        false,
      error:
        error &&
        error.message
          ? error.message
          : String(error)
    };
  }
}
function testLogPresensiPerkelas() {
  console.log(
    '========================================'
  );
  console.log(
    '[TEST PRESENSI] FUNGSI TERPANGGIL'
  );
  console.log(
    '[TEST PRESENSI] WAKTU:',
    new Date()
  );
  console.log(
    '[TEST PRESENSI] USER:',
    Session.getActiveUser().getEmail()
  );
  console.log(
    '[TEST PRESENSI] SELESAI'
  );
  console.log(
    '========================================'
  );
  return {
    success: true,
    message: 'TEST LOG PRESENSI BERHASIL',
    email:
      Session.getActiveUser().getEmail(),
    timestamp:
      new Date().toISOString()
  };
}