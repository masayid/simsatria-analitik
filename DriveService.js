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
