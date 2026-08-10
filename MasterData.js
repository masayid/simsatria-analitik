/************************************************************
 * SIM SATRIA CORE
 * MASTER DATA SERVICE
 *
 * FASE 3
 *
 * Master:
 * - CONFIG
 * - GURU
 * - KARYAWAN
 * - SISWA
 * - KELAS
 ************************************************************/
/**
 * ==========================================================
 * KONFIGURASI MASTER
 * ==========================================================
 */
const MASTER_DATA_CONFIG = {
  GURU: 'GURU',
  KARYAWAN: 'KARYAWAN',
  SISWA: 'SISWA',
  KELAS: 'KELAS',
  CONFIG: 'CONFIG'
};
/**
 * ==========================================================
 * GET MASTER SHEET
 * ==========================================================
 */
function getMasterDataSheet_(
  context,
  sheetName
) {
  if (!context) {
    throw new Error(
      'School Context tidak tersedia.'
    );
  }
  if (!context.spreadsheetId) {
    throw new Error(
      'Spreadsheet sekolah tidak tersedia.'
    );
  }
  const ss =
    SpreadsheetApp.openById(
      context.spreadsheetId
    );
  const sheet =
    ss.getSheetByName(
      sheetName
    );
  if (!sheet) {
    throw new Error(
      'Sheet ' +
      sheetName +
      ' tidak ditemukan.'
    );
  }
  return sheet;
}
/**
 * ==========================================================
 * NORMALIZE TEXT
 * ==========================================================
 */
function normalizeText_(
  value
) {
  return String(
    value || ''
  )
    .trim();
}
/**
 * ==========================================================
 * NORMALIZE EMAIL
 * ==========================================================
 */
function normalizeEmail_(
  value
) {
  return String(
    value || ''
  )
    .trim()
    .toLowerCase();
}
/**
 * ==========================================================
 * READ TABLE
 * ==========================================================
 */
function readMasterTable_(
  sheet
) {
  const values =
    sheet
      .getDataRange()
      .getValues();
  if (
    !values ||
    values.length < 2
  ) {
    return [];
  }
  const headers =
    values[0].map(
      function(header) {
        return String(
          header
        ).trim();
      }
    );
  return values
    .slice(1)
    .filter(
      function(row) {
        return row.some(
          function(value) {
            return String(
              value || ''
            ).trim() !== '';
          }
        );
      }
    )
    .map(
      function(row) {
        const obj = {};
        headers.forEach(
          function(header, index) {
            obj[header] =
              row[index];
          }
        );
        return obj;
      }
    );
}
/**
 * ==========================================================
 * GURU
 * ==========================================================
 */
function getGuruList() {
  const context =
    getCurrentUserContext();
  const sheet =
    getMasterDataSheet_(
      context.school,
      MASTER_DATA_CONFIG.GURU
    );
  return readMasterTable_(
    sheet
  );
}
function getGuruByNip(
  nip
) {
  const context =
    getCurrentUserContext();
  const normalizedNip =
    normalizeText_(
      nip
    );
  const sheet =
    getMasterDataSheet_(
      context.school,
      MASTER_DATA_CONFIG.GURU
    );
  const data =
    readMasterTable_(
      sheet
    );
  return data.find(
    function(row) {
      return normalizeText_(
        row.NIP
      ) === normalizedNip;
    }
  ) || null;
}
/**
 * ==========================================================
 * KARYAWAN
 * ==========================================================
 */
function getKaryawanList() {
  const context =
    getCurrentUserContext();
  const sheet =
    getMasterDataSheet_(
      context.school,
      MASTER_DATA_CONFIG.KARYAWAN
    );
  return readMasterTable_(
    sheet
  );
}
function getKaryawanByNip(
  nip
) {
  const context =
    getCurrentUserContext();
  const normalizedNip =
    normalizeText_(
      nip
    );
  const sheet =
    getMasterDataSheet_(
      context.school,
      MASTER_DATA_CONFIG.KARYAWAN
    );
  const data =
    readMasterTable_(
      sheet
    );
  return data.find(
    function(row) {
      return normalizeText_(
        row.NIP
      ) === normalizedNip;
    }
  ) || null;
}
/**
 * ==========================================================
 * SISWA
 * ==========================================================
 */
function getSiswaList() {
  const context =
    getCurrentUserContext();
  const sheet =
    getMasterDataSheet_(
      context.school,
      MASTER_DATA_CONFIG.SISWA
    );
  return readMasterTable_(
    sheet
  );
}
function getSiswaByNisn(
  nisn
) {
  const context =
    getCurrentUserContext();
  const normalizedNisn =
    normalizeText_(
      nisn
    );
  const sheet =
    getMasterDataSheet_(
      context.school,
      MASTER_DATA_CONFIG.SISWA
    );
  const data =
    readMasterTable_(
      sheet
    );
  return data.find(
    function(row) {
      return normalizeText_(
        row.NISN
      ) === normalizedNisn;
    }
  ) || null;
}
/**
 * ==========================================================
 * KELAS
 * ==========================================================
 */
function getKelasList() {
  const context =
    getCurrentUserContext();
  const sheet =
    getMasterDataSheet_(
      context.school,
      MASTER_DATA_CONFIG.KELAS
    );
  return readMasterTable_(
    sheet
  );
}
function getKelasByKode(
  kodeKelas
) {
  const context =
    getCurrentUserContext();
  const normalizedKode =
    normalizeText_(
      kodeKelas
    );
  const sheet =
    getMasterDataSheet_(
      context.school,
      MASTER_DATA_CONFIG.KELAS
    );
  const data =
    readMasterTable_(
      sheet
    );
  return data.find(
    function(row) {
      return normalizeText_(
        row.KODE_KELAS
      ) === normalizedKode;
    }
  ) || null;
}
/**
 * ==========================================================
 * SISWA BERDASARKAN KELAS
 * ==========================================================
 */
function getSiswaByKelas(
  kodeKelas
) {
  const context =
    getCurrentUserContext();
  const normalizedKode =
    normalizeText_(
      kodeKelas
    );
  const sheet =
    getMasterDataSheet_(
      context.school,
      MASTER_DATA_CONFIG.SISWA
    );
  const data =
    readMasterTable_(
      sheet
    );
  return data.filter(
    function(row) {
      return normalizeText_(
        row.KELAS
      ) === normalizedKode;
    }
  );
}
