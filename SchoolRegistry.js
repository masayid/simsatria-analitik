/*
 * SCHOOL REGISTRY
 */
function getMasterSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("MASTER_SPREADSHEET_ID");
  if (!id) throw new Error("MASTER_SPREADSHEET_ID belum dikonfigurasi pada Script Properties.");
  try { return SpreadsheetApp.openById(id); }
  catch (e) { return createLocalMasterRegistryProxy_(); }
}
function createLocalMasterRegistryProxy_() {
  return { getSheetByName: function(name) {
    const n=String(name||"").trim().toUpperCase();
    if(n==="ADMIN_SEKOLAH") return createLocalRegistrySheet_("ADMIN");
    if(n==="SCHOOLS") return createLocalRegistrySheet_("SCHOOLS");
    return null;
  }};
}
function createLocalRegistrySheet_(type) {
  const props=PropertiesService.getScriptProperties(), prefix=type==="ADMIN"?MASTER_AUTH_REGISTRY.ADMIN_PREFIX:MASTER_AUTH_REGISTRY.SCHOOL_PREFIX;
  const rows=[]; const all=props.getProperties();
  Object.keys(all).forEach(k=>{if(k.indexOf(prefix)!==0)return;try{rows.push(JSON.parse(all[k]));}catch(e){}});
  const headers=type==="ADMIN"?["USER_ID","EMAIL","NIP","NAMA","NPSN","ROLE","STATUS"]:["NPSN","NAMA_SEKOLAH","STATUS","SPREADSHEET_ID","DRIVE_FOLDER_ID","ALAMAT","LOGO_URL","TAGLINE","WARNA_UTAMA","WARNA_SEKUNDER"];
  const values=[headers]; rows.forEach(r=>values.push(headers.map(h=>r[h]===undefined?"":r[h])));
  return {getDataRange:()=>({getValues:()=>values}),getLastRow:()=>values.length,getLastColumn:()=>headers.length,getName:()=>type==="ADMIN"?"ADMIN_SEKOLAH":"SCHOOLS"};
}
function setMasterSpreadsheetId(id){id=String(id||"").trim();if(!id)throw new Error("ID Spreadsheet Master wajib diisi.");SpreadsheetApp.openById(id);PropertiesService.getScriptProperties().setProperty("MASTER_SPREADSHEET_ID",id);return{success:true,spreadsheetId:id};}
function getSchoolByNpsn(npsn){const school=getSchoolByNpsnAuth_(npsn);if(!school)throw new Error("Sekolah tidak ditemukan.");return school;}
