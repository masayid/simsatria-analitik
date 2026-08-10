/************************************************************
 * SIM SATRIA CORE
 * TRANSACTION SERVICE
 *
 * FASE 4
 ************************************************************/
const TRANSACTION_CONFIG = {
  TIMESTAMP_FORMAT:
    'yyyy-MM-dd HH:mm:ss'
};
/**
 * ==========================================================
 * GET TRANSACTION SHEET
 * ==========================================================
 */
function getTransactionSheet_(
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
      'Sheet transaksi "' +
      sheetName +
      '" tidak ditemukan.'
    );
  }
  return sheet;
}
/**
 * ==========================================================
 * READ TRANSACTION TABLE
 * ==========================================================
 */
function readTransactionTable_(
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
      function(row, rowIndex) {
        const obj = {
          _rowNumber:
            rowIndex + 2
        };
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
 * CREATE TRANSACTION
 * ==========================================================
 */
function createTransaction_(
  options
) {
  if (!options) {
    throw new Error(
      'Parameter transaksi tidak tersedia.'
    );
  }
  const {
    sheetName,
    data,
    permission
  } = options;
  if (!sheetName) {
    throw new Error(
      'Nama sheet transaksi wajib diisi.'
    );
  }
  if (!data) {
    throw new Error(
      'Data transaksi wajib diisi.'
    );
  }
  /*
   * AUTHENTICATION
   */
  const user =
    getCurrentUserContext();
  /*
   * PERMISSION
   */
  if (permission) {
    requirePermission(
      permission
    );
  }
  /*
   * SCHOOL CONTEXT
   */
  const context =
    user.school;
  /*
   * SHEET SEKOLAH
   */
  const sheet =
    getTransactionSheet_(
      context,
      sheetName
    );
  /*
   * TIMESTAMP SERVER
   */
  const timestamp =
    new Date();
  /*
   * DATA SISTEM
   *
   * Data ini tidak boleh berasal
   * dari frontend.
   */
  const systemData = {
  TRANSACTION_ID:
    generateTransactionId_(),
  TIMESTAMP:
    timestamp,
  NPSN:
    user.npsn,
  USER_ID:
    user.userId,
  EMAIL:
    user.email,
  NIP:
    user.nip,
  NAMA_USER:
    user.nama,
  ROLE:
    user.role
};
  /*
   * GABUNGKAN SYSTEM DATA
   * + DATA TRANSAKSI
   */
  const payload =
    Object.assign(
      {},
      systemData,
      data
    );
  /*
   * HEADER
   */
  const lastColumn =
    sheet.getLastColumn();
  if (
    lastColumn < 1
  ) {
    throw new Error(
      'Header sheet transaksi belum tersedia.'
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
      .getValues()[0]
      .map(
        function(header) {
          return String(
            header
          ).trim();
        }
      );
  /*
   * BENTUK BARIS
   */
  const row =
    headers.map(
      function(header) {
        return payload.hasOwnProperty(
          header
        )
          ? payload[header]
          : '';
      }
    );
  /*
   * SIMPAN
   */
  sheet.appendRow(
    row
  );
  /*
   * LOG
   */
  writeAuditLog_({
    action:
      'CREATE',
    module:
      sheetName,
    description:
      'Membuat transaksi baru'
  });
  return {
    success: true,
    sheetName:
      sheetName,
    timestamp:
      timestamp,
    npsn:
      user.npsn,
    userId:
      user.userId
  };
}
/**
 * ==========================================================
 * READ TRANSACTIONS
 * ==========================================================
 */
function getTransactions_(
  options
) {
  if (!options) {
    throw new Error(
      'Parameter query transaksi tidak tersedia.'
    );
  }
  const {
    sheetName,
    permission
  } = options;
  const user =
    getCurrentUserContext();
  if (permission) {
    requirePermission(
      permission
    );
  }
  const sheet =
    getTransactionSheet_(
      user.school,
      sheetName
    );
  return readTransactionTable_(
    sheet
  );
}
/**
 * ==========================================================
 * UPDATE TRANSACTION
 * ==========================================================
 */
function updateTransaction_(
  options
) {
  if (!options) {
    throw new Error(
      'Parameter update tidak tersedia.'
    );
  }
  const {
    sheetName,
    rowNumber,
    data,
    permission
  } = options;
  const user =
    getCurrentUserContext();
  if (permission) {
    requirePermission(
      permission
    );
  }
  if (
    !Number.isInteger(
      rowNumber
    ) ||
    rowNumber < 2
  ) {
    throw new Error(
      'Nomor baris transaksi tidak valid.'
    );
  }
  const sheet =
    getTransactionSheet_(
      user.school,
      sheetName
    );
  const lastColumn =
    sheet.getLastColumn();
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
            header
          ).trim();
        }
      );
  const currentRow =
    sheet
      .getRange(
        rowNumber,
        1,
        1,
        lastColumn
      )
      .getValues()[0];
  headers.forEach(
    function(header, index) {
      if (
        data.hasOwnProperty(
          header
        )
      ) {
        currentRow[index] =
          data[header];
      }
    }
  );
  sheet
    .getRange(
      rowNumber,
      1,
      1,
      lastColumn
    )
    .setValues([
      currentRow
    ]);
  writeAuditLog_({
    action:
      'UPDATE',
    module:
      sheetName,
    description:
      'Memperbarui transaksi baris ' +
      rowNumber
  });
  return {
    success: true,
    sheetName:
      sheetName,
    rowNumber:
      rowNumber
  };
}
/**
 * ==========================================================
 * INACTIVE TRANSACTION
 * ==========================================================
 *
 * Kita tidak langsung menghapus histori transaksi.
 */
function deactivateTransaction_(
  options
) {
  if (!options) {
    throw new Error(
      'Parameter tidak tersedia.'
    );
  }
  const {
    sheetName,
    rowNumber,
    statusColumn,
    permission
  } = options;
  const user =
    getCurrentUserContext();
  if (permission) {
    requirePermission(
      permission
    );
  }
  const sheet =
    getTransactionSheet_(
      user.school,
      sheetName
    );
  const headers =
    sheet
      .getRange(
        1,
        1,
        1,
        sheet.getLastColumn()
      )
      .getValues()[0];
  const index =
    headers.findIndex(
      function(header) {
        return String(
          header
        ).trim() ===
        statusColumn;
      }
    );
  if (
    index === -1
  ) {
    throw new Error(
      'Kolom status "' +
      statusColumn +
      '" tidak ditemukan.'
    );
  }
  sheet
    .getRange(
      rowNumber,
      index + 1
    )
    .setValue(
      'INACTIVE'
    );
  writeAuditLog_({
    action:
      'DEACTIVATE',
    module:
      sheetName,
    description:
      'Menonaktifkan transaksi baris ' +
      rowNumber
  });
  return {
    success: true,
    rowNumber:
      rowNumber
  };
}
/**
 * ==========================================================
 * AUDIT LOG
 * ==========================================================
 */
function writeAuditLog_(
  data
) {
  try {
    const user =
      getCurrentUserContext();
    const context =
      user.school;
    const sheet =
      getTransactionSheet_(
        context,
        'LOG'
      );
    sheet.appendRow([
      new Date(),
      user.npsn,
      user.userId,
      user.email,
      user.nip,
      user.nama,
      user.role,
      data.action || '',
      data.module || '',
      data.description || ''
    ]);
  } catch (error) {
    console.error(
      'Audit log gagal: ' +
      error.message
    );
  }
}
function testCreateTransaction() {
  return createTransaction_({
    sheetName:
      'TRX_PARKIR',
    permission:
      'INPUT_MONITORING',
    data: {
      TANGGAL:
        new Date(),
      KENDALA:
        'Test transaksi FASE 4',
      SOLUSI:
        'Transaksi berhasil',
      UPLOAD_FOTO_PARKIR:
        ''
    }
  });
}
function debugCurrentUser() {
  const user =
    getCurrentUserContext();
  Logger.log(
    JSON.stringify(
      user,
      null,
      2
    )
  );
  return user;
}
function generateTransactionId_() {
  return 'TX-' +
    Utilities.getUuid()
      .replace(
        /-/g,
        ''
      )
      .substring(
        0,
        16
      )
      .toUpperCase();
}