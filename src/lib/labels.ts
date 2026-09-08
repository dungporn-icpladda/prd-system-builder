export type PfStatus = "draft" | "pending" | "approved" | "rejected" | "archived";
export type AppRole = "admin" | "sales" | "product" | "qc" | "production" | "warehouse" | "manager";

export const PF_STATUS_LABEL: Record<PfStatus, string> = {
  draft: "ฉบับร่าง",
  pending: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  rejected: "ไม่อนุมัติ",
  archived: "จัดเก็บ",
};

export const PF_STATUS_ORDER: PfStatus[] = ["draft", "pending", "approved", "rejected", "archived"];

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "ผู้ดูแลระบบ",
  sales: "ฝ่ายขาย / CS",
  product: "ฝ่ายผลิตภัณฑ์ / R&D",
  qc: "ฝ่าย QC / QA",
  production: "ฝ่ายผลิต",
  warehouse: "คลังสินค้า",
  manager: "ผู้จัดการ / ผู้อนุมัติ",
};

export const ALL_ROLES: AppRole[] = [
  "admin",
  "sales",
  "product",
  "qc",
  "production",
  "warehouse",
  "manager",
];

export const RECORD_STATUS_LABEL: Record<string, string> = {
  active: "ใช้งาน",
  inactive: "ปิดใช้งาน",
};

export const ACTION_LABEL: Record<string, string> = {
  create: "สร้าง",
  update: "แก้ไข",
  delete: "ลบ",
  submit: "ส่งขออนุมัติ",
  approve: "อนุมัติ",
  reject: "ไม่อนุมัติ",
  archive: "จัดเก็บ",
  new_version: "สร้างเวอร์ชันใหม่",
  upload: "แนบไฟล์",
};

export function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("th-TH", { dateStyle: "medium" });
}

export function num(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return Number(value).toLocaleString("th-TH");
}
