/**
 * PERMISSION
 * Role menentukan apa yang boleh dilakukan.
 * NPSN ditentukan AUTH/SCHOOL CONTEXT, bukan frontend.
 */
const ROLE_PERMISSIONS = {
  SUPERADMIN: ["*"],
  ADMIN_SEKOLAH: [
    "VIEW_DASHBOARD",
    "MANAGE_GURU",
    "MANAGE_KARYAWAN",
    "MANAGE_SISWA",
    "MANAGE_KELAS",
    "INPUT_MONITORING",
    "VIEW_MONITORING",
    "INPUT_PRESENSI",
    "VIEW_PRESENSI",
    "VIEW_ANALYTICS",
  ],
  GURU: [
    "VIEW_DASHBOARD",
    "INPUT_PRESENSI",
    "VIEW_PRESENSI",
    "INPUT_MONITORING",
    "VIEW_MONITORING",
  ],
  KARYAWAN: ["VIEW_DASHBOARD", "INPUT_MONITORING", "VIEW_MONITORING"],
};
function getRolePermissions_(role) {
  const r = String(role || "")
    .trim()
    .toUpperCase();
  return ROLE_PERMISSIONS[r] || [];
}
function requirePermission(permission) {
  const context = getCurrentUserContext();
  const role = context.role;
  const permissions = getRolePermissions_(role);
  if (permissions.includes("*") || permissions.includes(permission)) {
    return true;
  }
  throw new Error("Anda tidak memiliki izin untuk melakukan tindakan ini.");
}
function hasPermission(permission) {
  try {
    requirePermission(permission);
    return true;
  } catch (e) {
    return false;
  }
}
function getMyPermissions() {
  const c = getCurrentUserContext();
  return {
    success: true,
    role: c.role,
    permissions: getRolePermissions_(c.role),
  };
}
