-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin','sales','product','qc','production','warehouse','manager');
CREATE TYPE public.record_status AS ENUM ('active','inactive');
CREATE TYPE public.pf_status AS ENUM ('draft','pending','approved','rejected','archived');

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  department text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = ANY(_roles));
$$;

CREATE POLICY "roles_select" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE first_user boolean;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email);
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO first_user;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, CASE WHEN first_user THEN 'admin'::public.app_role ELSE 'sales'::public.app_role END);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- CUSTOMERS
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  contact_name text,
  phone text,
  email text,
  address text,
  status public.record_status NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_select" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "customers_write" ON public.customers FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','sales']::public.app_role[]));
CREATE POLICY "customers_update" ON public.customers FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','sales']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','sales']::public.app_role[]));
CREATE POLICY "customers_delete" ON public.customers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  product_code text NOT NULL UNIQUE,
  product_name text NOT NULL,
  category text,
  description text,
  status public.record_status NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products_insert" ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','sales','product']::public.app_role[]));
CREATE POLICY "products_update" ON public.products FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','sales','product']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','sales','product']::public.app_role[]));
CREATE POLICY "products_delete" ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PACKAGING FORMATS
CREATE TABLE public.packaging_formats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  packaging_code text NOT NULL,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  is_active_version boolean NOT NULL DEFAULT true,
  packaging_type text,
  unit_per_pack integer,
  pack_per_carton integer,
  carton_per_pallet integer,
  net_weight numeric,
  gross_weight numeric,
  dimension_width numeric,
  dimension_length numeric,
  dimension_height numeric,
  material text,
  label_requirement text,
  barcode text,
  qr_code text,
  special_instruction text,
  status public.pf_status NOT NULL DEFAULT 'draft',
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (packaging_code, version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packaging_formats TO authenticated;
GRANT ALL ON public.packaging_formats TO service_role;
ALTER TABLE public.packaging_formats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_select" ON public.packaging_formats FOR SELECT TO authenticated USING (true);
CREATE POLICY "pf_insert" ON public.packaging_formats FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','sales','product']::public.app_role[]));
CREATE POLICY "pf_update" ON public.packaging_formats FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','sales','product','manager','qc']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','sales','product','manager','qc']::public.app_role[]));
CREATE POLICY "pf_delete" ON public.packaging_formats FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER pf_updated BEFORE UPDATE ON public.packaging_formats FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Approved records are immutable except for status transitions
CREATE OR REPLACE FUNCTION public.protect_approved_packaging()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF OLD.status = 'approved' THEN
    IF (to_jsonb(NEW) - 'status' - 'updated_at' - 'is_active_version' - 'approved_by' - 'approved_at')
       IS DISTINCT FROM
       (to_jsonb(OLD) - 'status' - 'updated_at' - 'is_active_version' - 'approved_by' - 'approved_at') THEN
      RAISE EXCEPTION 'ข้อมูลที่อนุมัติแล้วไม่สามารถแก้ไขได้ กรุณาสร้างเวอร์ชันใหม่';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER pf_protect BEFORE UPDATE ON public.packaging_formats FOR EACH ROW EXECUTE FUNCTION public.protect_approved_packaging();

-- ATTACHMENTS
CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  packaging_format_id uuid NOT NULL REFERENCES public.packaging_formats(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text,
  file_url text NOT NULL,
  storage_path text,
  uploaded_by uuid,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.attachments TO authenticated;
GRANT ALL ON public.attachments TO service_role;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "att_select" ON public.attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "att_insert" ON public.attachments FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','sales','product']::public.app_role[]));
CREATE POLICY "att_delete" ON public.attachments FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','sales','product']::public.app_role[]));

-- APPROVAL LOGS
CREATE TABLE public.approval_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  packaging_format_id uuid NOT NULL REFERENCES public.packaging_formats(id) ON DELETE CASCADE,
  action text NOT NULL,
  comment text,
  action_by uuid,
  action_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.approval_logs TO authenticated;
GRANT ALL ON public.approval_logs TO service_role;
ALTER TABLE public.approval_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apl_select" ON public.approval_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "apl_insert" ON public.approval_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  before_value jsonb,
  after_value jsonb,
  note text,
  action_by uuid,
  action_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aud_select" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "aud_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX idx_products_customer ON public.products(customer_id);
CREATE INDEX idx_pf_customer ON public.packaging_formats(customer_id);
CREATE INDEX idx_pf_product ON public.packaging_formats(product_id);
CREATE INDEX idx_pf_status ON public.packaging_formats(status);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);

-- DEMO DATA
INSERT INTO public.customers (id, customer_code, customer_name, contact_name, phone, email, address) VALUES
 ('11111111-1111-4111-8111-111111111111','CUS-001','บริษัท สยามฟู้ดส์ จำกัด','คุณสมชาย ใจดี','02-111-2222','somchai@siamfoods.co.th','123 ถ.พระราม 9 เขตห้วยขวาง กรุงเทพฯ 10310'),
 ('22222222-2222-4222-8222-222222222222','CUS-002','บริษัท ไทยเบฟเวอเรจ แพ็ค จำกัด','คุณมาลี สุขใจ','02-333-4444','malee@thaibevpack.co.th','88 นิคมอุตสาหกรรมบางปู สมุทรปราการ 10280'),
 ('33333333-3333-4333-8333-333333333333','CUS-003','บริษัท กรีนเฮิร์บ คอสเมติก จำกัด','คุณอนันต์ วงศ์ทอง','038-555-666','anan@greenherb.co.th','45 หมู่ 4 ต.บ้านฉาง จ.ระยอง 21130');

INSERT INTO public.products (id, customer_id, product_code, product_name, category, description) VALUES
 ('aaaaaaa1-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','SKU-1001','ขนมข้าวเกรียบกุ้ง 60 กรัม','อาหารว่าง','ข้าวเกรียบกุ้งบรรจุซองฟอยล์'),
 ('aaaaaaa2-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','SKU-1002','น้ำพริกเผาสูตรดั้งเดิม 200 กรัม','เครื่องปรุง','บรรจุขวดแก้วพร้อมฝาล็อก'),
 ('bbbbbbb1-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','SKU-2001','น้ำผลไม้รวม 250 มล.','เครื่องดื่ม','บรรจุกล่อง UHT'),
 ('ccccccc1-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333','SKU-3001','เซรั่มบำรุงผิวหน้า 30 มล.','เครื่องสำอาง','ขวดปั๊มพร้อมกล่องกระดาษ');

INSERT INTO public.packaging_formats
 (packaging_code, customer_id, product_id, version, is_active_version, packaging_type, unit_per_pack, pack_per_carton, carton_per_pallet, net_weight, gross_weight, dimension_width, dimension_length, dimension_height, material, label_requirement, barcode, special_instruction, status, approved_at)
VALUES
 ('PKG-0001','11111111-1111-4111-8111-111111111111','aaaaaaa1-1111-4111-8111-111111111111',1,true,'ซองฟอยล์ + กล่องกระดาษลูกฟูก',12,24,40,60,780,300,400,250,'ฟอยล์ลามิเนต / กระดาษลูกฟูก 3 ชั้น','ฉลากไทย-อังกฤษ ระบุ อย. และวันหมดอายุ','8850001000012','เก็บในที่แห้ง หลีกเลี่ยงแสงแดด','approved', now() - interval '10 days'),
 ('PKG-0002','11111111-1111-4111-8111-111111111111','aaaaaaa2-2222-4222-8222-222222222222',1,true,'ขวดแก้ว + ลังกระดาษ',6,12,32,200,2600,250,350,220,'แก้วใส ฝาโลหะ','ฉลากรอบขวด ระบุส่วนผสมและ อย.','8850001000029','ห้ามวางซ้อนเกิน 5 ชั้น','pending',NULL),
 ('PKG-0003','22222222-2222-4222-8222-222222222222','bbbbbbb1-1111-4111-8111-111111111111',1,true,'กล่อง UHT + ฟิล์มหด',24,4,48,250,6200,320,420,260,'กล่องกระดาษ UHT / ฟิล์ม PE','พิมพ์วันที่ผลิตด้วยหมึกเลเซอร์','8850002000013','ควบคุมอุณหภูมิไม่เกิน 30°C','draft',NULL),
 ('PKG-0004','33333333-3333-4333-8333-333333333333','ccccccc1-1111-4111-8111-111111111111',1,true,'ขวดปั๊ม + กล่องพิมพ์ 4 สี',1,48,60,30,2400,280,380,200,'ขวด PET / กระดาษอาร์ตการ์ด 350 แกรม','ฉลากภาษาอังกฤษ พร้อม QR Code ตรวจสอบของแท้','8850003000014','ต้องมีซีลกันปลอมที่ฝากล่อง','rejected',NULL);