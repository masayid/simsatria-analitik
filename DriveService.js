/**
 * DRIVE SERVICE
 * Drive selalu mengikuti Drive Folder sekolah dari School Context.
 */
function getSchoolDriveFolder_() {
  const c = getCurrentUserContext();
  const folderId = String(c.school.driveFolderId || '').trim();
  if (!folderId) {
    throw new Error('DRIVE_FOLDER_ID sekolah belum dikonfigurasi.');
  }
  return DriveApp.getFolderById(folderId);
}
function getSchoolModuleFolder_(moduleName) {
  const name = String(moduleName || '').trim().toUpperCase();
  if (!name) {
    throw new Error('Nama modul wajib diisi.');
  }
  const root = getSchoolDriveFolder_();
  const folders = root.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  }
  return root.createFolder(name);
}
function testSchoolDriveAccess() {
  const c = getCurrentUserContext();
  const folder = getSchoolDriveFolder_();
  return {
    success: true,
    email: c.email,
    npsn: c.npsn,
    sekolah: c.school.namaSekolah,
    folderId: folder.getId(),
    folderName: folder.getName()
  };
}
/**
 * Upload base64 dari frontend.
 * dataUrl: data:<mime>;base64,...
 */
function uploadFileToSchoolDrive(dataUrl, fileName, moduleName) {
  const c = getCurrentUserContext();
  requirePermission('INPUT_MONITORING');
  if (!dataUrl || !fileName) {
    throw new Error('Data file dan nama file wajib diisi.');
  }
  const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Format data file tidak valid.');
  }
  const mimeType = match[1];
  const bytes = Utilities.base64Decode(match[2]);
  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const folder = getSchoolModuleFolder_(moduleName || 'GENERAL');
  const file = folder.createFile(blob);
  return {
    success: true,
    npsn: c.npsn,
    school: c.school.namaSekolah,
    fileId: file.getId(),
    fileName: file.getName(),
    url: file.getUrl()
  };
}
function setupDriveSekolahSaya() {
  const context =
    getCurrentUserContext();
  requirePermission(
    'MANAGE_KELAS'
  );
  // =====================================================
  // LOCK
  // Mencegah dua proses setup berjalan bersamaan
  // =====================================================
  const lock =
    LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    // ===================================================
    // ROOT FOLDER SEKOLAH
    // ===================================================
    const rootFolder =
      getSchoolDriveFolder_();
    // ===================================================
    // FOLDER STANDARD
    // ===================================================
    const moduleFolders = [
      'PRESENSI',
      'AGENDA',
      'PRESTASI',
      'SBI',
      'PARKIR',
      'KEBERSIHAN',
      'KEAMANAN',
      'KERJA',
      'UMUM'
    ];
    const existing = [];
    const created = [];
    const duplicates = [];
    // ===================================================
    // CEK SATU PER SATU
    // ===================================================
    moduleFolders.forEach(
      function(folderName) {
        const folders =
          rootFolder.getFoldersByName(
            folderName
          );
        const found = [];
        while (
          folders.hasNext()
        ) {
          const folder =
            folders.next();
          found.push({
            id:
              folder.getId(),
            name:
              folder.getName(),
            url:
              folder.getUrl()
          });
        }
        // ===============================================
        // TIDAK ADA
        // ===============================================
        if (
          found.length === 0
        ) {
          const newFolder =
            rootFolder.createFolder(
              folderName
            );
          created.push({
            name:
              folderName,
            id:
              newFolder.getId(),
            url:
              newFolder.getUrl()
          });
          return;
        }
        // ===============================================
        // SATU FOLDER
        // ===============================================
        if (
          found.length === 1
        ) {
          existing.push({
            name:
              folderName,
            id:
              found[0].id,
            url:
              found[0].url
          });
          return;
        }
        // ===============================================
        // LEBIH DARI SATU
        // ===============================================
        duplicates.push({
          name:
            folderName,
          count:
            found.length,
          folders:
            found
        });
        /*
         * PENTING:
         * Jika duplicate ditemukan, kita TIDAK
         * membuat folder baru dan TIDAK menghapus
         * folder yang sudah ada.
         */
      }
    );
    // ===================================================
    // TENTUKAN STATUS
    // ===================================================
    let status;
    if (
      duplicates.length > 0
    ) {
      status =
        'DUPLICATE_FOUND';
    }
    else if (
      created.length > 0
    ) {
      status =
        'COMPLETED_MISSING';
    }
    else {
      status =
        'ALREADY_COMPLETE';
    }
    // ===================================================
    // MESSAGE
    // ===================================================
    let message;
    if (
      status ===
      'DUPLICATE_FOUND'
    ) {
      message =
        'Ditemukan folder yang memiliki nama ganda. ' +
        'Tidak ada folder duplicate yang dihapus. ' +
        'Periksa daftar duplicates sebelum melakukan cleanup.';
    }
    else if (
      status ===
      'COMPLETED_MISSING'
    ) {
      message =
        created.length +
        ' folder baru dibuat. ' +
        existing.length +
        ' folder yang sudah ada dipertahankan.';
    }
    else {
      message =
        'Semua folder SIM SATRIA sudah tersedia. ' +
        'Tidak ada folder baru yang dibuat.';
    }
    // ===================================================
    // RETURN
    // ===================================================
    return {
      success:
        status !== 'DUPLICATE_FOUND',
      status:
        status,
      email:
        context.email,
      npsn:
        context.npsn,
      sekolah:
        context.school.namaSekolah,
      rootFolderId:
        rootFolder.getId(),
      rootFolderName:
        rootFolder.getName(),
      created:
        created,
      existing:
        existing,
      duplicates:
        duplicates,
      totalRequired:
        moduleFolders.length,
      totalCreated:
        created.length,
      totalExisting:
        existing.length,
      totalDuplicateTypes:
        duplicates.length,
      message:
        message
    };
  }
  finally {
    lock.releaseLock();
  }
}
function getDriveSetupMessage_(
  status,
  existing,
  created
) {
  if (
    status ===
    'CREATED_ALL'
  ) {
    return (
      'Semua folder SIM SATRIA berhasil dibuat.'
    );
  }
  if (
    status ===
    'COMPLETED_MISSING'
  ) {
    return (
      'Setup selesai. ' +
      created.length +
      ' folder baru dibuat dan ' +
      existing.length +
      ' folder yang sudah ada dipertahankan.'
    );
  }
  return (
    'Semua folder SIM SATRIA sudah tersedia. ' +
    'Tidak ada folder baru yang dibuat.'
  );
}
function auditDriveSekolahSaya() {
  const context =
    getCurrentUserContext();
  requirePermission(
    'MANAGE_KELAS'
  );
  const rootFolder =
    getSchoolDriveFolder_();
  const moduleFolders = [
    'PRESENSI',
    'AGENDA',
    'PRESTASI',
    'SBI',
    'PARKIR',
    'KEBERSIHAN',
    'KEAMANAN',
    'KERJA',
    'UMUM'
  ];
  const result = [];
  moduleFolders.forEach(
    function(folderName) {
      const folders =
        rootFolder.getFoldersByName(
          folderName
        );
      const list = [];
      while (
        folders.hasNext()
      ) {
        const folder =
          folders.next();
        list.push({
          id:
            folder.getId(),
          name:
            folder.getName(),
          url:
            folder.getUrl(),
          files:
            countFilesInFolder_(
              folder
            )
        });
      }
      result.push({
        name:
          folderName,
        count:
          list.length,
        folders:
          list
      });
    }
  );
  return {
    success:
      true,
    npsn:
      context.npsn,
    sekolah:
      context.school.namaSekolah,
    rootFolderId:
      rootFolder.getId(),
    rootFolderName:
      rootFolder.getName(),
    folders:
      result
  };
}
function countFilesInFolder_(folder) {
  let count = 0;
  const files =
    folder.getFiles();
  while (
    files.hasNext()
  ) {
    files.next();
    count++;
  }
  return count;
}
