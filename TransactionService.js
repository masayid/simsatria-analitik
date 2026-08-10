/**
 * TRANSACTION SERVICE
 * Semua transaksi:
 * User Context -> Permission -> School Spreadsheet -> Transaction ID -> LOG
 */
function generateTransactionId_() {
  const now = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || 'Asia/Jakarta',
    'yyyyMMddHHmmss'
  );
  const random = Utilities.getUuid()
    .replace(/-/g, '')
    .substring(0, 12)
    .toUpperCase();
  return 'TX-' + now + '-' + random;
}
function createTransaction_(options) {
  if (!options) {
    throw new Error('Parameter transaksi kosong.');
  }
  const sheetName = String(options.sheetName || '').trim();
  const permission = String(options.permission || '').trim();
  const data = options.data || {};
  if (!sheetName) {
    throw new Error('sheetName wajib diisi.');
  }
  if (permission) requirePermission(permission);
  const context = getCurrentUserContext();
  const ss = getSchoolSpreadsheet_();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(
      'Sheet transaksi "' + sheetName +
      '" tidak ditemukan pada Spreadsheet sekolah.'
    );
  }
  const transactionId = generateTransactionId_();
  const timestamp = new Date();
  const headers = setupHeaders_(sheet, [
    'TRANSACTION_ID',
    'TIMESTAMP',
    'NPSN',
    'USER_ID',
    'EMAIL',
    'NIP',
    'NAMA_USER',
    'ROLE'
  ]);
  const rowObject = Object.assign({}, data, {
    TRANSACTION_ID: transactionId,
    TIMESTAMP: timestamp,
    NPSN: context.npsn,
    USER_ID: context.userId,
    EMAIL: context.email,
    NIP: context.nip,
    NAMA_USER: context.nama,
    ROLE: context.role
  });
  const row = headers.map(h =>
    Object.prototype.hasOwnProperty.call(rowObject, h)
      ? rowObject[h]
      : ''
  );
  sheet
    .getRange(sheet.getLastRow() + 1, 1, 1, headers.length)
    .setValues([row]);
  writeAuditLog_({
    action: 'CREATE',
    module: sheetName,
    description: 'Membuat transaksi baru',
    transactionId: transactionId
  });
  return {
    success: true,
    transactionId: transactionId,
    npsn: context.npsn,
    email: context.email,
    school: context.school.namaSekolah,
    sheetName: sheetName
  };
}
function writeAuditLog_(entry) {
  const sh = ensureLogSheet_();
  const c = getCurrentUserContext();
  sh.appendRow([
    new Date(),
    c.npsn,
    c.userId,
    c.email,
    c.nip,
    c.nama,
    c.role,
    entry.action || '',
    entry.module || '',
    entry.description || '',
    entry.transactionId || ''
  ]);
}
function testTransactionEngineSekolahB() {
  return createTransaction_({
    sheetName: 'TRX_PARKIR',
    permission: 'INPUT_MONITORING',
    data: {
      TANGGAL: new Date(),
      KENDALA: 'TEST TRANSACTION ENGINE',
      SOLUSI: 'Transaction Engine multi-school berhasil',
      UPLOAD_FOTO_PARKIR: ''
    }
  });
}
function runTestTransaction() {
  try {
    return {
      success: true,
      result: testTransactionEngineSekolahB()
    };
  } catch (e) {
    return {
      success: false,
      error: e.message
    };
  }
}
