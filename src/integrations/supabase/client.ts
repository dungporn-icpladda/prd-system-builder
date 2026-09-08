import type { AppRole, PfStatus } from "@/lib/labels";

export type LocalUser = {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
  };
  app_metadata: Record<string, unknown>;
  aud: "authenticated";
  created_at: string;
};

export type LocalSession = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  expires_at: number;
  user: LocalUser;
};

type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "USER_UPDATED";
type RecordStatus = "active" | "inactive";
type JsonValue = unknown;

type LocalUserRecord = LocalUser & {
  password: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  department: string | null;
  created_at: string;
  updated_at: string;
};

type UserRoleRow = {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
};

type CustomerRow = {
  id: string;
  customer_code: string;
  customer_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: RecordStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type ProductRow = {
  id: string;
  customer_id: string;
  product_code: string;
  product_name: string;
  category: string | null;
  description: string | null;
  status: RecordStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type PackagingFormatRow = {
  id: string;
  packaging_code: string;
  customer_id: string;
  product_id: string;
  version: number;
  is_active_version: boolean;
  packaging_type: string | null;
  unit_per_pack: number | null;
  pack_per_carton: number | null;
  carton_per_pallet: number | null;
  net_weight: number | null;
  gross_weight: number | null;
  dimension_width: number | null;
  dimension_length: number | null;
  dimension_height: number | null;
  material: string | null;
  label_requirement: string | null;
  barcode: string | null;
  qr_code: string | null;
  special_instruction: string | null;
  status: PfStatus;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

type AttachmentRow = {
  id: string;
  packaging_format_id: string;
  file_name: string;
  file_type: string | null;
  file_url: string;
  storage_path: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
};

type ApprovalLogRow = {
  id: string;
  packaging_format_id: string;
  action: string;
  comment: string | null;
  action_by: string | null;
  action_at: string;
};

type AuditLogRow = {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  before_value: JsonValue | null;
  after_value: JsonValue | null;
  note: string | null;
  action_by: string | null;
  action_at: string;
};

type Tables = {
  profiles: ProfileRow[];
  user_roles: UserRoleRow[];
  customers: CustomerRow[];
  products: ProductRow[];
  packaging_formats: PackagingFormatRow[];
  attachments: AttachmentRow[];
  approval_logs: ApprovalLogRow[];
  audit_logs: AuditLogRow[];
};

type PackagingFormatResultRow = PackagingFormatRow & {
  products?: { product_name: string } | null;
  customers?: { customer_name: string } | null;
};

type TableRows = {
  profiles: ProfileRow;
  user_roles: UserRoleRow;
  customers: CustomerRow;
  products: ProductRow;
  packaging_formats: PackagingFormatResultRow;
  attachments: AttachmentRow;
  approval_logs: ApprovalLogRow;
  audit_logs: AuditLogRow;
};

type TableName = keyof Tables;
type LooseAny = ReturnType<typeof JSON.parse>;
type AnyRow = {
  id?: string;
  user_id?: string;
  role?: AppRole;
  email?: string | null;
  full_name?: string | null;
  department?: string | null;
  customer_code?: string;
  customer_name?: string;
  contact_name?: string | null;
  phone?: string | null;
  address?: string | null;
  customer_id?: string;
  product_code?: string;
  product_name?: string;
  category?: string | null;
  description?: string | null;
  packaging_format_id?: string;
  packaging_code?: string;
  product_id?: string;
  version?: number;
  is_active_version?: boolean;
  packaging_type?: string | null;
  unit_per_pack?: number | null;
  pack_per_carton?: number | null;
  carton_per_pallet?: number | null;
  net_weight?: number | null;
  gross_weight?: number | null;
  dimension_width?: number | null;
  dimension_length?: number | null;
  dimension_height?: number | null;
  material?: string | null;
  label_requirement?: string | null;
  barcode?: string | null;
  qr_code?: string | null;
  special_instruction?: string | null;
  status?: RecordStatus | PfStatus;
  created_by?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  file_name?: string;
  file_type?: string | null;
  file_url?: string;
  storage_path?: string | null;
  uploaded_by?: string | null;
  uploaded_at?: string;
  action?: string;
  comment?: string | null;
  action_by?: string | null;
  action_at?: string;
  entity_type?: string;
  entity_id?: string | null;
  before_value?: JsonValue | null;
  after_value?: JsonValue | null;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
  products?: { product_name: string } | null;
  customers?: { customer_name: string } | null;
  [key: string]: unknown;
};
type QueryResult<T = LooseAny> = {
  data: T;
  error: Error | null;
  count?: number | null;
};
type SelectOptions = {
  count?: "exact" | "planned" | "estimated";
  head?: boolean;
};

type LocalState = {
  version: 1;
  sessionUserId: string | null;
  users: LocalUserRecord[];
  tables: Tables;
};

const STORAGE_KEY = "prd-system-builder:local-storage:v1";
const SESSION_DAYS = 365;
const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
const DEMO_EMAIL = "admin@local.test";
const DEMO_PASSWORD = "password";

const authListeners = new Set<(event: AuthChangeEvent, session: LocalSession | null) => void>();
let memoryState: LocalState | null = null;

function nowIso() {
  return new Date().toISOString();
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 864e5).toISOString();
}

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function storage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function createUser(params: {
  id?: string;
  email: string;
  password: string;
  fullName?: string;
}): LocalUserRecord {
  const created_at = nowIso();
  return {
    id: params.id ?? randomId(),
    email: params.email.trim().toLowerCase(),
    password: params.password,
    user_metadata: { full_name: params.fullName || params.email.split("@")[0] || params.email },
    app_metadata: {},
    aud: "authenticated",
    created_at,
  };
}

function publicUser(user: LocalUserRecord): LocalUser {
  return {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
    app_metadata: user.app_metadata,
    aud: user.aud,
    created_at: user.created_at,
  };
}

function sessionFor(user: LocalUserRecord): LocalSession {
  return {
    access_token: `local-token-${user.id}`,
    refresh_token: `local-refresh-${user.id}`,
    token_type: "bearer",
    expires_in: SESSION_DAYS * 86400,
    expires_at: Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400,
    user: publicUser(user),
  };
}

function createInitialState(): LocalState {
  const demoUser = createUser({
    id: DEMO_USER_ID,
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    fullName: "Local Admin",
  });
  const created = daysAgo(30);
  const recent = daysAgo(2);

  return {
    version: 1,
    sessionUserId: null,
    users: [demoUser],
    tables: {
      profiles: [
        {
          id: demoUser.id,
          full_name: "Local Admin",
          email: demoUser.email,
          department: "ระบบทดสอบ",
          created_at: demoUser.created_at,
          updated_at: demoUser.created_at,
        },
      ],
      user_roles: [
        { id: randomId(), user_id: demoUser.id, role: "admin", created_at: demoUser.created_at },
      ],
      customers: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          customer_code: "CUS-001",
          customer_name: "บริษัท สยามฟู้ดส์ จำกัด",
          contact_name: "คุณสมชาย ใจดี",
          phone: "02-111-2222",
          email: "somchai@siamfoods.co.th",
          address: "123 ถ.พระราม 9 เขตห้วยขวาง กรุงเทพฯ 10310",
          status: "active",
          created_by: demoUser.id,
          created_at: created,
          updated_at: created,
        },
        {
          id: "22222222-2222-4222-8222-222222222222",
          customer_code: "CUS-002",
          customer_name: "บริษัท ไทยเบฟเวอเรจ แพ็ค จำกัด",
          contact_name: "คุณมาลี สุขใจ",
          phone: "02-333-4444",
          email: "malee@thaibevpack.co.th",
          address: "88 นิคมอุตสาหกรรมบางปู สมุทรปราการ 10280",
          status: "active",
          created_by: demoUser.id,
          created_at: daysAgo(25),
          updated_at: daysAgo(25),
        },
        {
          id: "33333333-3333-4333-8333-333333333333",
          customer_code: "CUS-003",
          customer_name: "บริษัท กรีนเฮิร์บ คอสเมติก จำกัด",
          contact_name: "คุณอนันต์ วงศ์ทอง",
          phone: "038-555-666",
          email: "anan@greenherb.co.th",
          address: "45 หมู่ 4 ต.บ้านฉาง จ.ระยอง 21130",
          status: "active",
          created_by: demoUser.id,
          created_at: daysAgo(20),
          updated_at: daysAgo(20),
        },
      ],
      products: [
        {
          id: "aaaaaaa1-1111-4111-8111-111111111111",
          customer_id: "11111111-1111-4111-8111-111111111111",
          product_code: "SKU-1001",
          product_name: "ขนมข้าวเกรียบกุ้ง 60 กรัม",
          category: "อาหารว่าง",
          description: "ข้าวเกรียบกุ้งบรรจุซองฟอยล์",
          status: "active",
          created_by: demoUser.id,
          created_at: created,
          updated_at: created,
        },
        {
          id: "aaaaaaa2-2222-4222-8222-222222222222",
          customer_id: "11111111-1111-4111-8111-111111111111",
          product_code: "SKU-1002",
          product_name: "น้ำพริกเผาสูตรดั้งเดิม 200 กรัม",
          category: "เครื่องปรุง",
          description: "บรรจุขวดแก้วพร้อมฝาล็อก",
          status: "active",
          created_by: demoUser.id,
          created_at: daysAgo(24),
          updated_at: daysAgo(24),
        },
        {
          id: "bbbbbbb1-1111-4111-8111-111111111111",
          customer_id: "22222222-2222-4222-8222-222222222222",
          product_code: "SKU-2001",
          product_name: "น้ำผลไม้รวม 250 มล.",
          category: "เครื่องดื่ม",
          description: "บรรจุกล่อง UHT",
          status: "active",
          created_by: demoUser.id,
          created_at: daysAgo(22),
          updated_at: daysAgo(22),
        },
        {
          id: "ccccccc1-1111-4111-8111-111111111111",
          customer_id: "33333333-3333-4333-8333-333333333333",
          product_code: "SKU-3001",
          product_name: "เซรั่มบำรุงผิวหน้า 30 มล.",
          category: "เครื่องสำอาง",
          description: "ขวดปั๊มพร้อมกล่องกระดาษ",
          status: "active",
          created_by: demoUser.id,
          created_at: daysAgo(18),
          updated_at: daysAgo(18),
        },
      ],
      packaging_formats: [
        {
          id: "ddddddd1-1111-4111-8111-111111111111",
          packaging_code: "PKG-0001",
          customer_id: "11111111-1111-4111-8111-111111111111",
          product_id: "aaaaaaa1-1111-4111-8111-111111111111",
          version: 1,
          is_active_version: true,
          packaging_type: "ซองฟอยล์ + กล่องกระดาษลูกฟูก",
          unit_per_pack: 12,
          pack_per_carton: 24,
          carton_per_pallet: 40,
          net_weight: 60,
          gross_weight: 780,
          dimension_width: 300,
          dimension_length: 400,
          dimension_height: 250,
          material: "ฟอยล์ลามิเนต / กระดาษลูกฟูก 3 ชั้น",
          label_requirement: "ฉลากไทย-อังกฤษ ระบุ อย. และวันหมดอายุ",
          barcode: "8850001000012",
          qr_code: null,
          special_instruction: "เก็บในที่แห้ง หลีกเลี่ยงแสงแดด",
          status: "approved",
          created_by: demoUser.id,
          approved_by: demoUser.id,
          approved_at: daysAgo(10),
          created_at: created,
          updated_at: daysAgo(10),
        },
        {
          id: "ddddddd2-2222-4222-8222-222222222222",
          packaging_code: "PKG-0002",
          customer_id: "11111111-1111-4111-8111-111111111111",
          product_id: "aaaaaaa2-2222-4222-8222-222222222222",
          version: 1,
          is_active_version: true,
          packaging_type: "ขวดแก้ว + ลังกระดาษ",
          unit_per_pack: 6,
          pack_per_carton: 12,
          carton_per_pallet: 32,
          net_weight: 200,
          gross_weight: 2600,
          dimension_width: 250,
          dimension_length: 350,
          dimension_height: 220,
          material: "แก้วใส ฝาโลหะ",
          label_requirement: "ฉลากรอบขวด ระบุส่วนผสมและ อย.",
          barcode: "8850001000029",
          qr_code: null,
          special_instruction: "ห้ามวางซ้อนเกิน 5 ชั้น",
          status: "pending",
          created_by: demoUser.id,
          approved_by: null,
          approved_at: null,
          created_at: daysAgo(12),
          updated_at: daysAgo(5),
        },
        {
          id: "ddddddd3-3333-4333-8333-333333333333",
          packaging_code: "PKG-0003",
          customer_id: "22222222-2222-4222-8222-222222222222",
          product_id: "bbbbbbb1-1111-4111-8111-111111111111",
          version: 1,
          is_active_version: true,
          packaging_type: "กล่อง UHT + ฟิล์มหด",
          unit_per_pack: 24,
          pack_per_carton: 4,
          carton_per_pallet: 48,
          net_weight: 250,
          gross_weight: 6200,
          dimension_width: 320,
          dimension_length: 420,
          dimension_height: 260,
          material: "กล่องกระดาษ UHT / ฟิล์ม PE",
          label_requirement: "พิมพ์วันที่ผลิตด้วยหมึกเลเซอร์",
          barcode: "8850002000013",
          qr_code: null,
          special_instruction: "ควบคุมอุณหภูมิไม่เกิน 30°C",
          status: "draft",
          created_by: demoUser.id,
          approved_by: null,
          approved_at: null,
          created_at: daysAgo(10),
          updated_at: recent,
        },
        {
          id: "ddddddd4-4444-4444-8444-444444444444",
          packaging_code: "PKG-0004",
          customer_id: "33333333-3333-4333-8333-333333333333",
          product_id: "ccccccc1-1111-4111-8111-111111111111",
          version: 1,
          is_active_version: true,
          packaging_type: "ขวดปั๊ม + กล่องพิมพ์ 4 สี",
          unit_per_pack: 1,
          pack_per_carton: 48,
          carton_per_pallet: 60,
          net_weight: 30,
          gross_weight: 2400,
          dimension_width: 280,
          dimension_length: 380,
          dimension_height: 200,
          material: "ขวด PET / กระดาษอาร์ตการ์ด 350 แกรม",
          label_requirement: "ฉลากภาษาอังกฤษ พร้อม QR Code ตรวจสอบของแท้",
          barcode: "8850003000014",
          qr_code: null,
          special_instruction: "ต้องมีซีลกันปลอมที่ฝากล่อง",
          status: "rejected",
          created_by: demoUser.id,
          approved_by: null,
          approved_at: null,
          created_at: daysAgo(8),
          updated_at: daysAgo(1),
        },
      ],
      attachments: [],
      approval_logs: [],
      audit_logs: [],
    },
  };
}

function normalizeState(value: Partial<LocalState> | null): LocalState {
  const initial = createInitialState();
  if (!value || !value.tables) return initial;

  return {
    version: 1,
    sessionUserId: value.sessionUserId ?? null,
    users: Array.isArray(value.users) && value.users.length > 0 ? value.users : initial.users,
    tables: {
      profiles: Array.isArray(value.tables.profiles)
        ? value.tables.profiles
        : initial.tables.profiles,
      user_roles: Array.isArray(value.tables.user_roles)
        ? value.tables.user_roles
        : initial.tables.user_roles,
      customers: Array.isArray(value.tables.customers)
        ? value.tables.customers
        : initial.tables.customers,
      products: Array.isArray(value.tables.products)
        ? value.tables.products
        : initial.tables.products,
      packaging_formats: Array.isArray(value.tables.packaging_formats)
        ? value.tables.packaging_formats
        : initial.tables.packaging_formats,
      attachments: Array.isArray(value.tables.attachments)
        ? value.tables.attachments
        : initial.tables.attachments,
      approval_logs: Array.isArray(value.tables.approval_logs)
        ? value.tables.approval_logs
        : initial.tables.approval_logs,
      audit_logs: Array.isArray(value.tables.audit_logs)
        ? value.tables.audit_logs
        : initial.tables.audit_logs,
    },
  };
}

function loadState(): LocalState {
  const localStorage = storage();
  if (!localStorage) {
    memoryState ??= createInitialState();
    return memoryState;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = createInitialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return normalizeState(JSON.parse(raw) as Partial<LocalState>);
  } catch {
    const initial = createInitialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function saveState(state: LocalState) {
  const localStorage = storage();
  if (!localStorage) {
    memoryState = state;
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentSession(state = loadState()) {
  const user = state.users.find((item) => item.id === state.sessionUserId);
  return user ? sessionFor(user) : null;
}

function notifyAuth(event: AuthChangeEvent, session: LocalSession | null) {
  authListeners.forEach((listener) => listener(event, session));
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function sameValue(left: unknown, right: unknown) {
  return String(left ?? "") === String(right ?? "");
}

function compareValues(left: unknown, right: unknown) {
  if (left == null && right == null) return 0;
  if (left == null) return -1;
  if (right == null) return 1;
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right), "th");
}

function assertUnique(table: TableName, row: AnyRow, rows: AnyRow[]) {
  if (table === "customers") {
    const duplicate = rows.some(
      (item) => item.id !== row.id && sameValue(item.customer_code, row.customer_code),
    );
    if (duplicate) throw new Error("รหัสลูกค้าซ้ำ");
  }

  if (table === "products") {
    const duplicate = rows.some(
      (item) => item.id !== row.id && sameValue(item.product_code, row.product_code),
    );
    if (duplicate) throw new Error("รหัสสินค้าซ้ำ");
  }

  if (table === "packaging_formats") {
    const duplicate = rows.some(
      (item) =>
        item.id !== row.id &&
        sameValue(item.packaging_code, row.packaging_code) &&
        sameValue(item.version, row.version),
    );
    if (duplicate) throw new Error("รหัสรูปแบบการบรรจุและเวอร์ชันซ้ำ");
  }
}

function rowForInsert(table: TableName, payload: AnyRow): AnyRow {
  const time = nowIso();
  const currentUserId = loadState().sessionUserId;

  if (table === "customers") {
    return {
      id: payload.id ?? randomId(),
      customer_code: payload.customer_code ?? "",
      customer_name: payload.customer_name ?? "",
      contact_name: payload.contact_name ?? null,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
      address: payload.address ?? null,
      status: payload.status ?? "active",
      created_by: payload.created_by ?? currentUserId,
      created_at: payload.created_at ?? time,
      updated_at: payload.updated_at ?? time,
    };
  }

  if (table === "products") {
    return {
      id: payload.id ?? randomId(),
      customer_id: payload.customer_id ?? "",
      product_code: payload.product_code ?? "",
      product_name: payload.product_name ?? "",
      category: payload.category ?? null,
      description: payload.description ?? null,
      status: payload.status ?? "active",
      created_by: payload.created_by ?? currentUserId,
      created_at: payload.created_at ?? time,
      updated_at: payload.updated_at ?? time,
    };
  }

  if (table === "packaging_formats") {
    return {
      id: payload.id ?? randomId(),
      packaging_code: payload.packaging_code ?? "",
      customer_id: payload.customer_id ?? "",
      product_id: payload.product_id ?? "",
      version: payload.version ?? 1,
      is_active_version: payload.is_active_version ?? true,
      packaging_type: payload.packaging_type ?? null,
      unit_per_pack: payload.unit_per_pack ?? null,
      pack_per_carton: payload.pack_per_carton ?? null,
      carton_per_pallet: payload.carton_per_pallet ?? null,
      net_weight: payload.net_weight ?? null,
      gross_weight: payload.gross_weight ?? null,
      dimension_width: payload.dimension_width ?? null,
      dimension_length: payload.dimension_length ?? null,
      dimension_height: payload.dimension_height ?? null,
      material: payload.material ?? null,
      label_requirement: payload.label_requirement ?? null,
      barcode: payload.barcode ?? null,
      qr_code: payload.qr_code ?? null,
      special_instruction: payload.special_instruction ?? null,
      status: payload.status ?? "draft",
      created_by: payload.created_by ?? currentUserId,
      approved_by: payload.approved_by ?? null,
      approved_at: payload.approved_at ?? null,
      created_at: payload.created_at ?? time,
      updated_at: payload.updated_at ?? time,
    };
  }

  if (table === "profiles") {
    return {
      id: payload.id ?? randomId(),
      full_name: payload.full_name ?? null,
      email: payload.email ?? null,
      department: payload.department ?? null,
      created_at: payload.created_at ?? time,
      updated_at: payload.updated_at ?? time,
    };
  }

  if (table === "user_roles") {
    return {
      id: payload.id ?? randomId(),
      user_id: payload.user_id ?? currentUserId ?? "",
      role: payload.role ?? "sales",
      created_at: payload.created_at ?? time,
    };
  }

  if (table === "attachments") {
    return {
      id: payload.id ?? randomId(),
      packaging_format_id: payload.packaging_format_id ?? "",
      file_name: payload.file_name ?? "",
      file_type: payload.file_type ?? null,
      file_url: payload.file_url ?? "",
      storage_path: payload.storage_path ?? null,
      uploaded_by: payload.uploaded_by ?? currentUserId,
      uploaded_at: payload.uploaded_at ?? time,
    };
  }

  if (table === "approval_logs") {
    return {
      id: payload.id ?? randomId(),
      packaging_format_id: payload.packaging_format_id ?? "",
      action: payload.action ?? "",
      comment: payload.comment ?? null,
      action_by: payload.action_by ?? currentUserId,
      action_at: payload.action_at ?? time,
    };
  }

  return {
    id: payload.id ?? randomId(),
    entity_type: payload.entity_type ?? "",
    entity_id: payload.entity_id ?? null,
    action: payload.action ?? "",
    before_value: payload.before_value ?? null,
    after_value: payload.after_value ?? null,
    note: payload.note ?? null,
    action_by: payload.action_by ?? currentUserId,
    action_at: payload.action_at ?? time,
  };
}

function withRelations(state: LocalState, table: TableName, row: AnyRow) {
  if (table !== "packaging_formats") return { ...row };

  const product = state.tables.products.find((item) => item.id === row.product_id);
  const customer = state.tables.customers.find((item) => item.id === row.customer_id);

  return {
    ...row,
    products: product ? { product_name: product.product_name } : null,
    customers: customer ? { customer_name: customer.customer_name } : null,
  };
}

class LocalQueryBuilder<Row extends object, Result = Row[]> implements PromiseLike<
  QueryResult<Result>
> {
  private filters: Array<{ column: string; value: unknown }> = [];
  private operation: "select" | "insert" | "update" = "select";
  private orderBy: { column: string; ascending: boolean } | null = null;
  private payload: Partial<Row> | Array<Partial<Row>> | null = null;
  private selectOptions: SelectOptions | undefined;
  private wantsSingle = false;

  constructor(private readonly table: TableName) {}

  select(_columns = "*", options?: SelectOptions) {
    this.selectOptions = options;
    return this;
  }

  insert(payload: Partial<Row> | Array<Partial<Row>>) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: Partial<Row>) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  single() {
    this.wantsSingle = true;
    return this as unknown as LocalQueryBuilder<Row, Row>;
  }

  then<TResult1 = QueryResult<Result>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<Result>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private matches(row: Row) {
    const indexedRow = row as Record<string, unknown>;
    return this.filters.every((filter) => sameValue(indexedRow[filter.column], filter.value));
  }

  private execute(): Promise<QueryResult<Result>> {
    try {
      const state = loadState();
      const tableRows = state.tables[this.table] as unknown as Row[];
      let rows: Row[] = [];

      if (this.operation === "insert") {
        const payloads = Array.isArray(this.payload) ? this.payload : [this.payload ?? {}];
        rows = payloads.map((payload) => rowForInsert(this.table, payload as AnyRow) as Row);
        rows.forEach((row) =>
          assertUnique(this.table, row as AnyRow, tableRows as unknown as AnyRow[]),
        );
        tableRows.push(...rows);
        saveState(state);
      } else if (this.operation === "update") {
        const payload = (this.payload ?? {}) as AnyRow;
        rows = tableRows
          .filter((row) => this.matches(row))
          .map((row) => {
            const updated = { ...row, ...payload };
            if ("updated_at" in updated) updated.updated_at = nowIso();
            assertUnique(this.table, updated, tableRows as unknown as AnyRow[]);
            Object.assign(row, updated);
            return row;
          });
        saveState(state);
      } else {
        rows = tableRows.filter((row) => this.matches(row));
      }

      if (this.orderBy) {
        rows = [...rows].sort((left, right) => {
          const leftRow = left as Record<string, unknown>;
          const rightRow = right as Record<string, unknown>;
          const result = compareValues(
            leftRow[this.orderBy!.column],
            rightRow[this.orderBy!.column],
          );
          return this.orderBy!.ascending ? result : -result;
        });
      }

      const hydratedRows = rows.map(
        (row) => withRelations(state, this.table, row as AnyRow) as Row,
      );
      const count = hydratedRows.length;

      if (this.selectOptions?.head)
        return Promise.resolve({ data: null as Result, error: null, count });

      if (this.wantsSingle) {
        const first = hydratedRows[0];
        if (!first)
          return Promise.resolve({ data: null as Result, error: new Error("ไม่พบข้อมูล"), count });
        return Promise.resolve({ data: first as unknown as Result, error: null, count });
      }

      return Promise.resolve({
        data: hydratedRows as Result,
        error: null,
        count: this.selectOptions?.count ? count : null,
      });
    } catch (error) {
      return Promise.resolve({ data: null as Result, error: toError(error), count: null });
    }
  }
}

function localSignIn(user: LocalUserRecord) {
  const state = loadState();
  state.sessionUserId = user.id;
  saveState(state);
  const session = sessionFor(user);
  notifyAuth("SIGNED_IN", session);
  return session;
}

export const supabase = {
  from<T extends TableName>(table: T) {
    return new LocalQueryBuilder<TableRows[T]>(table);
  },
  auth: {
    async getSession() {
      return { data: { session: currentSession() }, error: null };
    },
    async getUser() {
      const session = currentSession();
      return { data: { user: session?.user ?? null }, error: null };
    },
    async signInWithPassword(params: { email: string; password: string }) {
      const state = loadState();
      const email = params.email.trim().toLowerCase();
      const user = state.users.find(
        (item) => item.email === email && item.password === params.password,
      );
      if (!user) {
        return {
          data: { user: null, session: null },
          error: new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง"),
        };
      }

      const session = localSignIn(user);
      return { data: { user: session.user, session }, error: null };
    },
    async signUp(params: {
      email: string;
      password: string;
      options?: { data?: { full_name?: string } };
    }) {
      const state = loadState();
      const email = params.email.trim().toLowerCase();
      if (state.users.some((item) => item.email === email)) {
        return {
          data: { user: null, session: null },
          error: new Error("อีเมลนี้ถูกใช้งานแล้ว"),
        };
      }

      const fullName = params.options?.data?.full_name;
      const user = createUser({
        email,
        password: params.password,
        ...(fullName ? { fullName } : {}),
      });
      const firstRealUser = !state.users.some((item) => item.id !== DEMO_USER_ID);
      state.users.push(user);
      state.tables.profiles.push({
        id: user.id,
        full_name: user.user_metadata.full_name ?? null,
        email: user.email,
        department: null,
        created_at: user.created_at,
        updated_at: user.created_at,
      });
      state.tables.user_roles.push({
        id: randomId(),
        user_id: user.id,
        role: firstRealUser ? "admin" : "sales",
        created_at: user.created_at,
      });
      state.sessionUserId = user.id;
      saveState(state);

      const session = sessionFor(user);
      notifyAuth("SIGNED_IN", session);
      return { data: { user: session.user, session }, error: null };
    },
    async signOut() {
      const state = loadState();
      state.sessionUserId = null;
      saveState(state);
      notifyAuth("SIGNED_OUT", null);
      return { error: null };
    },
    async setSession(session: Partial<LocalSession>) {
      const state = loadState();
      const email = session.user?.email?.trim().toLowerCase() || DEMO_EMAIL;
      let user = state.users.find((item) => item.email === email);

      if (!user) {
        const fullName = session.user?.user_metadata?.full_name;
        user = createUser({
          ...(session.user?.id ? { id: session.user.id } : {}),
          email,
          password: randomId(),
          ...(fullName ? { fullName } : {}),
        });
        state.users.push(user);
        state.tables.profiles.push({
          id: user.id,
          full_name: user.user_metadata.full_name ?? null,
          email: user.email,
          department: null,
          created_at: user.created_at,
          updated_at: user.created_at,
        });
        state.tables.user_roles.push({
          id: randomId(),
          user_id: user.id,
          role: "sales",
          created_at: user.created_at,
        });
        saveState(state);
      }

      const nextSession = localSignIn(user);
      return { data: { user: nextSession.user, session: nextSession }, error: null };
    },
    onAuthStateChange(callback: (event: AuthChangeEvent, session: LocalSession | null) => void) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
  },
};

export const localStorageCredentials = {
  demoEmail: DEMO_EMAIL,
  demoPassword: DEMO_PASSWORD,
};
