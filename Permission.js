/************************************************************
 * SIM SATRIA
 * PERMISSION SERVICE
 ************************************************************/


const SATRIA_PERMISSIONS = {

  VIEW_DASHBOARD:
    'VIEW_DASHBOARD',

  MANAGE_GURU:
    'MANAGE_GURU',

  MANAGE_SISWA:
    'MANAGE_SISWA',

  MANAGE_KARYAWAN:
    'MANAGE_KARYAWAN',

  MANAGE_KELAS:
    'MANAGE_KELAS',

  INPUT_PRESENSI:
    'INPUT_PRESENSI',

  INPUT_AGENDA:
    'INPUT_AGENDA',

  INPUT_PRESTASI:
    'INPUT_PRESTASI',

  INPUT_SBI:
    'INPUT_SBI',

  INPUT_MONITORING:
    'INPUT_MONITORING',

  VIEW_ANALYTICS:
    'VIEW_ANALYTICS',

  MANAGE_SCHOOL:
    'MANAGE_SCHOOL',

  MANAGE_USERS:
    'MANAGE_USERS',

  MANAGE_SCHOOLS:
    'MANAGE_SCHOOLS'

};


const ROLE_PERMISSIONS = {

  SUPERADMIN: [

    'VIEW_DASHBOARD',
    'MANAGE_SCHOOLS',
    'MANAGE_USERS',
    'VIEW_ANALYTICS'

  ],


  ADMIN_SEKOLAH: [

    'VIEW_DASHBOARD',
    'MANAGE_GURU',
    'MANAGE_SISWA',
    'MANAGE_KARYAWAN',
    'MANAGE_KELAS',
    'MANAGE_SCHOOL',
    'MANAGE_USERS',
    'VIEW_ANALYTICS'

  ],


  KEPALA_SEKOLAH: [

    'VIEW_DASHBOARD',
    'VIEW_ANALYTICS'

  ],


  OPERATOR: [

    'VIEW_DASHBOARD',
    'MANAGE_GURU',
    'MANAGE_SISWA',
    'MANAGE_KARYAWAN',
    'MANAGE_KELAS'

  ],


  GURU: [

    'VIEW_DASHBOARD',
    'INPUT_PRESENSI',
    'INPUT_AGENDA',
    'INPUT_PRESTASI',
    'INPUT_SBI'

  ],


  KARYAWAN: [

    'VIEW_DASHBOARD',
    'INPUT_MONITORING'

  ]

};


/**
 * ==========================================================
 * CHECK PERMISSION
 * ==========================================================
 */

function hasPermission(
  permission
) {

  const context =
    getCurrentUserContext();


  const role =
    context.role;


  const permissions =
    ROLE_PERMISSIONS[
      role
    ] || [];


  return permissions
    .indexOf(
      permission
    ) !== -1;

}


/**
 * ==========================================================
 * REQUIRE PERMISSION
 * ==========================================================
 */

function requirePermission(
  permission
) {

  if (
    !hasPermission(
      permission
    )
  ) {

    throw new Error(
      'Anda tidak memiliki izin untuk melakukan tindakan ini.'
    );

  }


  return true;

}


/**
 * ==========================================================
 * GET USER PERMISSIONS
 * ==========================================================
 */

function getCurrentUserPermissions() {

  const context =
    getCurrentUserContext();


  return {

    role:
      context.role,

    permissions:
      ROLE_PERMISSIONS[
        context.role
      ] || []

  };

}