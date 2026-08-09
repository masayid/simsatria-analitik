/************************************************************
 * SIM SATRIA CORE
 * DRIVE SERVICE
 *
 * File : DriveService.gs
 ************************************************************/


/**
 * ==========================================================
 * GET SCHOOL ROOT FOLDER
 * ==========================================================
 */

function getSchoolDrive_(
  context
) {

  if (!context) {

    throw new Error(
      'School Context tidak tersedia.'
    );

  }


  if (!context.driveFolderId) {

    throw new Error(
      'Drive Folder ID sekolah kosong.'
    );

  }


  try {

    return DriveApp.getFolderById(
      context.driveFolderId
    );

  } catch (error) {

    throw new Error(
      'Folder Drive sekolah tidak dapat dibuka: ' +
      error.message
    );

  }

}


/**
 * ==========================================================
 * DRIVE INFO
 * ==========================================================
 */

function getSchoolDriveInfo_(
  context
) {

  const folder =
    getSchoolDrive_(
      context
    );


  return {

    connected:
      true,

    name:
      folder.getName(),

    id:
      folder.getId(),

    url:
      folder.getUrl()

  };

}


/**
 * ==========================================================
 * INITIALIZE SCHOOL DRIVE
 * ==========================================================
 */

function initializeSchoolDrive_(
  rootFolder
) {

  const folders = [

    'PROFIL',

    'PRESENSI',

    'PRESTASI',

    'AGENDA',

    'SBI',

    'MONITORING',

    'DOKUMENTASI',

    'LAINNYA'

  ];


  folders.forEach(
    function(folderName) {

      const exists =
        rootFolder
          .getFoldersByName(
            folderName
          );

      if (!exists.hasNext()) {

        rootFolder.createFolder(
          folderName
        );

      }

    }
  );

}


/**
 * ==========================================================
 * GET SUBFOLDER
 * ==========================================================
 */

function getSchoolSubFolder_(
  context,
  folderName
) {

  const root =
    getSchoolDrive_(
      context
    );


  const folders =
    root.getFoldersByName(
      folderName
    );


  if (folders.hasNext()) {

    return folders.next();

  }


  return root.createFolder(
    folderName
  );

}


/**
 * ==========================================================
 * DRIVE TEST
 * ==========================================================
 */

function testDrive(
  npsn
) {

  const context =
    getSchoolContext(npsn);


  const info =
    getSchoolDriveInfo_(
      context
    );


  return {

    success: true,

    npsn:
      context.npsn,

    sekolah:
      context.namaSekolah,

    drive:
      info

  };

}