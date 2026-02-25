-- ============================================================
-- TakuraBid — Complete Supabase Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================
-- CHANGES:
--   1. users.user_id is explicitly UUID
--   2. Added password TEXT column (plain text for dev — not for production)
--   3. RLS disabled on all tables (app uses anon key + server auth)
--   4. Rich sample reviews for all 10 drivers
--   5. Sample data uses default password 'password123'
-- ============================================================


-- ===================== CLEAN SLATE =====================
-- Drop existing tables from previous (broken) runs.
-- Order matters: drop child tables first to avoid FK conflicts.
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews       CASCADE;
DROP TABLE IF EXISTS messages      CASCADE;
DROP TABLE IF EXISTS jobs          CASCADE;
DROP TABLE IF EXISTS bids          CASCADE;
DROP TABLE IF EXISTS loads         CASCADE;
DROP TABLE IF EXISTS users         CASCADE;

-- Drop existing enums so they can be recreated cleanly.
DROP TYPE IF EXISTS user_role          CASCADE;
DROP TYPE IF EXISTS account_status     CASCADE;
DROP TYPE IF EXISTS payment_method     CASCADE;
DROP TYPE IF EXISTS availability_status CASCADE;
DROP TYPE IF EXISTS load_status        CASCADE;
DROP TYPE IF EXISTS bid_status         CASCADE;
DROP TYPE IF EXISTS job_status         CASCADE;
DROP TYPE IF EXISTS trip_type          CASCADE;
DROP TYPE IF EXISTS urgency_level      CASCADE;


-- ===================== ENUMS =====================

CREATE TYPE user_role          AS ENUM ('CLIENT', 'DRIVER');
CREATE TYPE account_status     AS ENUM ('Active', 'Suspended', 'Pending Verification', 'Deactivated');
CREATE TYPE payment_method     AS ENUM ('Bank Transfer', 'Mobile Money', 'Credit Card', 'EcoCash', 'PayPal');
CREATE TYPE availability_status AS ENUM ('Available', 'Unavailable');
CREATE TYPE load_status        AS ENUM ('In Bidding', 'Assigned', 'In Transit', 'Completed');
CREATE TYPE bid_status         AS ENUM ('Pending', 'Accepted', 'Rejected');
CREATE TYPE job_status         AS ENUM ('Pending', 'Active', 'In Transit', 'Completed');
CREATE TYPE trip_type          AS ENUM ('One Way', 'Round Trip');
CREATE TYPE urgency_level      AS ENUM ('Standard', 'Urgent');


-- ===================== TABLES =====================

-- 1. USERS
-- NOTE: user_id is explicitly UUID. The FK to auth.users(id) is added
-- at the very end AFTER sample data insertion.
CREATE TABLE users (
  user_id          UUID PRIMARY KEY,
  role             user_role NOT NULL,
  email            TEXT NOT NULL,
  password         TEXT NOT NULL DEFAULT 'password123',
  name             TEXT NOT NULL,
  phone            TEXT,
  city             TEXT,
  address          TEXT,

  -- Profile media
  profile_picture_url TEXT,
  company_logo_url    TEXT,

  -- Account
  account_status   account_status NOT NULL DEFAULT 'Pending Verification',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login       TIMESTAMPTZ,

  -- Client-specific (NULL for drivers)
  company_name          TEXT,
  payment_verified      BOOLEAN DEFAULT false,
  payment_method_type   payment_method,
  total_spent_usd       NUMERIC(12,2) DEFAULT 0,

  -- Driver-specific (NULL for clients)
  title                 TEXT,
  specialization        TEXT,
  bio                   TEXT,
  skill_tags            TEXT,
  total_earnings_usd    NUMERIC(12,2) DEFAULT 0,
  average_rating        NUMERIC(3,2) DEFAULT 0,
  total_kilometres      INTEGER DEFAULT 0,
  driver_ranking        TEXT,
  availability          availability_status DEFAULT 'Available',
  acceptance_rate_pct   NUMERIC(5,2) DEFAULT 0,
  profile_views         INTEGER DEFAULT 0,
  profile_clicks        INTEGER DEFAULT 0
);


-- 2. LOADS
CREATE TABLE loads (
  load_id           TEXT PRIMARY KEY,
  client_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  cargo_type        TEXT NOT NULL,
  weight_tons       NUMERIC(8,2) NOT NULL,
  origin_city       TEXT NOT NULL,
  destination_city  TEXT NOT NULL,
  distance_km       INTEGER NOT NULL,
  budget_usd        NUMERIC(12,2) NOT NULL,
  pickup_date       DATE NOT NULL,
  delivery_date     DATE NOT NULL,
  trip_type         trip_type NOT NULL DEFAULT 'One Way',
  urgency           urgency_level NOT NULL DEFAULT 'Standard',
  description       TEXT,
  requirements      TEXT[],
  status            load_status NOT NULL DEFAULT 'In Bidding',
  assigned_driver_id UUID REFERENCES users(user_id),
  bids_count        INTEGER DEFAULT 0,
  posted_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 3. BIDS
CREATE TABLE bids (
  bid_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id       TEXT NOT NULL REFERENCES loads(load_id) ON DELETE CASCADE,
  driver_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  amount_usd    NUMERIC(12,2) NOT NULL,
  message       TEXT,
  status        bid_status NOT NULL DEFAULT 'Pending',
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 4. JOBS
CREATE TABLE jobs (
  job_id          TEXT PRIMARY KEY,
  load_id         TEXT NOT NULL REFERENCES loads(load_id) ON DELETE CASCADE,
  driver_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rate_usd        NUMERIC(12,2) NOT NULL,
  status          job_status NOT NULL DEFAULT 'Pending',
  progress_pct    INTEGER DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ
);


-- 5. MESSAGES
CREATE TABLE messages (
  message_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  recipient_id  UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  "read"        BOOLEAN NOT NULL DEFAULT false,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 6. NOTIFICATIONS
CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'info',
  "read"          BOOLEAN NOT NULL DEFAULT false,
  reference_id    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 7. REVIEWS
CREATE TABLE reviews (
  review_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        TEXT NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
  reviewer_id   UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reviewee_id   UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rating        NUMERIC(2,1) NOT NULL CHECK (rating BETWEEN 0 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===================== INDEXES =====================

CREATE INDEX idx_loads_client       ON loads(client_id);
CREATE INDEX idx_loads_status       ON loads(status);
CREATE INDEX idx_loads_driver       ON loads(assigned_driver_id);
CREATE INDEX idx_bids_load          ON bids(load_id);
CREATE INDEX idx_bids_driver        ON bids(driver_id);
CREATE INDEX idx_jobs_driver        ON jobs(driver_id);
CREATE INDEX idx_jobs_client        ON jobs(client_id);
CREATE INDEX idx_jobs_load          ON jobs(load_id);
CREATE INDEX idx_messages_job       ON messages(job_id);
CREATE INDEX idx_messages_sender    ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_reviews_job        ON reviews(job_id);
CREATE INDEX idx_users_role         ON users(role);


-- ===================== ROW-LEVEL SECURITY =====================
-- RLS is DISABLED. The app uses the anon key with server-side session auth.
-- All access control is handled in application code, not DB policies.

ALTER TABLE users         DISABLE ROW LEVEL SECURITY;
ALTER TABLE loads         DISABLE ROW LEVEL SECURITY;
ALTER TABLE bids          DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs          DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages      DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       DISABLE ROW LEVEL SECURITY;


-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-set updated_at on users
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-update loads.bids_count
CREATE OR REPLACE FUNCTION update_bids_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE loads SET bids_count = bids_count + 1 WHERE load_id = NEW.load_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE loads SET bids_count = bids_count - 1 WHERE load_id = OLD.load_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bids_count ON bids;
CREATE TRIGGER trg_bids_count
  AFTER INSERT OR DELETE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_bids_count();


-- ============================================================
-- SAMPLE DATA
-- ============================================================
-- Using hardcoded UUIDs. No FK to auth.users yet, so these insert cleanly.
-- ============================================================


-- ===================== 10 DRIVERS =====================

INSERT INTO users (user_id, role, email, password, name, phone, city, address, account_status, company_name, payment_verified, payment_method_type, total_spent_usd, title, specialization, bio, skill_tags, total_earnings_usd, average_rating, total_kilometres, driver_ranking, availability, acceptance_rate_pct, profile_views, profile_clicks)
VALUES
('d0000001-0000-0000-0000-000000000001', 'DRIVER', 'tendai.m@takurabid.co.zw', 'password123', 'Tendai Mukamuri', '+263 77 123 4501', 'Harare', '12 Samora Machel Ave, Harare', 'Active', NULL, NULL, NULL, NULL,
 'Expert Heavy Equipment Transport', 'Professional Long-Distance Driver', 'Seasoned driver with 12 years of experience transporting heavy machinery across Zimbabwe and the SADC region. Specialising in flatbed and low-loader operations with a perfect safety record.',
 'Heavy Equipment,Long Distance,Flatbed Transport', 33200.00, 4.80, 78500, 'Top 5%', 'Available', 82.50, 2847, 892),

('d0000002-0000-0000-0000-000000000002', 'DRIVER', 'sarah.c@takurabid.co.zw', 'password123', 'Sarah Chikwanha', '+263 77 123 4502', 'Bulawayo', '8 Fort St, Bulawayo', 'Active', NULL, NULL, NULL, NULL,
 'Agricultural & Cold Chain Specialist', 'Refrigerated Transport Expert', 'Expert in temperature-controlled logistics for fresh produce, dairy, and pharmaceuticals. Operating a modern refrigerated fleet with real-time temperature monitoring.',
 'Agricultural Products,Cold Chain,Refrigerated Transport', 45100.00, 4.90, 62300, 'Top 3%', 'Available', 91.20, 3102, 1045),

('d0000003-0000-0000-0000-000000000003', 'DRIVER', 'james.m@takurabid.co.zw', 'password123', 'James Moyo', '+263 77 123 4503', 'Gweru', '45 Main St, Gweru', 'Active', NULL, NULL, NULL, NULL,
 'Construction & Mining Transport', 'Heavy-Duty Hauling Specialist', 'Dedicated to the construction and mining sectors with specialised equipment for oversized loads. Fully insured and compliant with all mining transport regulations.',
 'Construction Materials,Mining Transport,Oversized Loads', 28400.00, 4.70, 55200, 'Top 10%', 'Unavailable', 75.00, 1856, 623),

('d0000004-0000-0000-0000-000000000004', 'DRIVER', 'grace.m@takurabid.co.zw', 'password123', 'Grace Mapfumo', '+263 77 123 4504', 'Harare', '22 Enterprise Rd, Harare', 'Active', NULL, NULL, NULL, NULL,
 'General Freight & Cross-Border', 'Import/Export Logistics Driver', 'Experienced in cross-border freight between Zimbabwe, South Africa, Mozambique, and Zambia. Familiar with all border post procedures and customs documentation.',
 'General Freight,Cross-Border,Import/Export', 21700.00, 4.60, 92100, 'Top 15%', 'Available', 70.30, 1542, 487),

('d0000005-0000-0000-0000-000000000005', 'DRIVER', 'michael.t@takurabid.co.zw', 'password123', 'Michael Tafara', '+263 77 123 4505', 'Mutare', '10 Herbert Chitepo St, Mutare', 'Active', NULL, NULL, NULL, NULL,
 'Liquid & Chemical Transport', 'Certified Hazmat Driver', 'Specialising in the safe transport of fuel, chemicals, and industrial liquids. ADR certified with specialised tanker vehicles and full hazmat compliance.',
 'Liquid Transport,Fuel Delivery,Chemical Transport', 52300.00, 4.90, 48700, 'Top 2%', 'Available', 88.60, 3890, 1320),

('d0000006-0000-0000-0000-000000000006', 'DRIVER', 'patricia.n@takurabid.co.zw', 'password123', 'Patricia Nyoni', '+263 77 123 4506', 'Victoria Falls', '5 Livingstone Way, Victoria Falls', 'Active', NULL, NULL, NULL, NULL,
 'Express & Time-Sensitive Delivery', 'Urgent Cargo Specialist', 'Focused on express and same-day deliveries across Zimbabwe. Medical supply logistics certified with a track record of 99% on-time delivery for urgent shipments.',
 'Express Delivery,Time-Sensitive,Medical Supplies', 38600.00, 4.80, 41200, 'Top 5%', 'Available', 94.10, 2310, 876),

('d0000007-0000-0000-0000-000000000007', 'DRIVER', 'tatenda.g@takurabid.co.zw', 'password123', 'Tatenda Gumbo', '+263 77 123 4507', 'Masvingo', '18 Robertson St, Masvingo', 'Active', NULL, NULL, NULL, NULL,
 'Furniture & Fragile Goods Transport', 'Careful Handling Specialist', 'Expert in moving furniture, electronics, and fragile goods with custom padding and secure loading techniques. Fully insured for high-value items.',
 'Furniture,Electronics,Fragile Goods', 19800.00, 4.50, 35600, 'Top 20%', 'Available', 68.40, 1120, 345),

('d0000008-0000-0000-0000-000000000008', 'DRIVER', 'rumbidzai.c@takurabid.co.zw', 'password123', 'Rumbidzai Chirwa', '+263 77 123 4508', 'Chinhoyi', '3 Magamba Way, Chinhoyi', 'Active', NULL, NULL, NULL, NULL,
 'Agricultural Bulk Transport', 'Farm-to-Market Logistics', 'Specialising in bulk grain, tobacco, and cotton transport from farming regions to processing plants and markets. Deep knowledge of seasonal logistics patterns.',
 'Agricultural Products,Bulk Transport,Farm Logistics', 27500.00, 4.70, 58900, 'Top 12%', 'Available', 79.80, 1670, 512),

('d0000009-0000-0000-0000-000000000009', 'DRIVER', 'blessing.d@takurabid.co.zw', 'password123', 'Blessing Dube', '+263 77 123 4509', 'Bulawayo', '27 Queens Rd, Bulawayo', 'Active', NULL, NULL, NULL, NULL,
 'Vehicle & Machinery Transport', 'Car Carrier & Equipment Mover', 'Operating a multi-vehicle car carrier and flatbed fleet for vehicle dealerships and machinery companies. Licensed for oversized loads with pilot vehicle support.',
 'Vehicles,Machinery,Oversized Loads', 31200.00, 4.60, 43800, 'Top 8%', 'Unavailable', 72.50, 2050, 678),

('d0000010-0000-0000-0000-000000000010', 'DRIVER', 'farai.z@takurabid.co.zw', 'password123', 'Farai Zinyama', '+263 77 123 4510', 'Kariba', '14 Lakeside Dr, Kariba', 'Active', NULL, NULL, NULL, NULL,
 'Tourism & Hospitality Logistics', 'Safari Equipment Specialist', 'Providing logistics support to the tourism and hospitality sector including safari equipment, hotel supplies, and event logistics across resort destinations.',
 'Tourism Equipment,Hospitality,Event Logistics', 16400.00, 4.40, 29300, 'Top 25%', 'Available', 65.00, 980, 289);


-- ===================== 10 CLIENTS =====================

INSERT INTO users (user_id, role, email, password, name, phone, city, address, account_status, company_name, payment_verified, payment_method_type, total_spent_usd, title, specialization, bio, skill_tags, total_earnings_usd, average_rating, total_kilometres, driver_ranking, availability, acceptance_rate_pct, profile_views, profile_clicks)
VALUES
('c0000001-0000-0000-0000-000000000001', 'CLIENT', 'info@abcconstruction.co.zw', 'password123', 'Takudzwa Nhira', '+263 77 234 5601', 'Harare', '100 Borrowdale Rd, Harare', 'Active',
 'ABC Construction', true, 'Bank Transfer', 15420.00,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

('c0000002-0000-0000-0000-000000000002', 'CLIENT', 'logistics@farmfresh.co.zw', 'password123', 'Nyasha Mhandu', '+263 77 234 5602', 'Chinhoyi', '55 Independence Ave, Chinhoyi', 'Active',
 'Farm Fresh Zimbabwe', true, 'EcoCash', 22350.00,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

('c0000003-0000-0000-0000-000000000003', 'CLIENT', 'ops@safarilodge.co.zw', 'password123', 'Chipo Garwe', '+263 77 234 5603', 'Victoria Falls', '7 Park Way, Victoria Falls', 'Active',
 'Safari Lodge Group', true, 'Credit Card', 9870.00,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

('c0000004-0000-0000-0000-000000000004', 'CLIENT', 'supply@retailplus.co.zw', 'password123', 'Kudakwashe Banda', '+263 77 234 5604', 'Bulawayo', '33 Fife St, Bulawayo', 'Active',
 'Retail Plus Zimbabwe', true, 'Mobile Money', 31200.00,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

('c0000005-0000-0000-0000-000000000005', 'CLIENT', 'transport@zimmine.co.zw', 'password123', 'Simba Dzapasi', '+263 77 234 5605', 'Gweru', '12 Seventh St, Gweru', 'Active',
 'Zimbabwe Mining Corp', true, 'Bank Transfer', 48500.00,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

('c0000006-0000-0000-0000-000000000006', 'CLIENT', 'logistics@medisupply.co.zw', 'password123', 'Rudo Matema', '+263 77 234 5606', 'Harare', '88 Kwame Nkrumah Ave, Harare', 'Active',
 'MediSupply Zim', true, 'Credit Card', 7650.00,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

('c0000007-0000-0000-0000-000000000007', 'CLIENT', 'dispatch@graincorp.co.zw', 'password123', 'Tinotenda Chigumba', '+263 77 234 5607', 'Masvingo', '4 Hughes St, Masvingo', 'Active',
 'Grain Corp Holdings', false, 'Bank Transfer', 5200.00,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

('c0000008-0000-0000-0000-000000000008', 'CLIENT', 'orders@zimtourism.co.zw', 'password123', 'Tariro Mushonga', '+263 77 234 5608', 'Kariba', '9 Lake View Rd, Kariba', 'Active',
 'Zimtourism Supplies', true, 'EcoCash', 11300.00,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

('c0000009-0000-0000-0000-000000000009', 'CLIENT', 'fleet@steelworks.co.zw', 'password123', 'Tawanda Mvura', '+263 77 234 5609', 'Kwekwe', '21 Kadoma Rd, Kwekwe', 'Active',
 'SteelWorks Pvt Ltd', true, 'Bank Transfer', 36800.00,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),

('c0000010-0000-0000-0000-000000000010', 'CLIENT', 'shipping@greenleaf.co.zw', 'password123', 'Maidei Sithole', '+263 77 234 5610', 'Mutare', '15 Main St, Mutare', 'Active',
 'GreenLeaf Exports', true, 'PayPal', 18900.00,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


-- ===================== 20 LOADS =====================

INSERT INTO loads (load_id, client_id, title, cargo_type, weight_tons, origin_city, destination_city, distance_km, budget_usd, pickup_date, delivery_date, trip_type, urgency, description, requirements, status, assigned_driver_id, bids_count, posted_at)
VALUES
('LOAD001', 'c0000001-0000-0000-0000-000000000001', 'Building Materials Transport', 'Building Materials', 5.0, 'Harare', 'Bulawayo', 439, 850.00, '2026-02-25', '2026-02-27', 'One Way', 'Standard',
 'Transport of cement bags, steel reinforcement bars, and roofing sheets from Harare warehouse to Bulawayo construction site. Requires careful handling to avoid damage.',
 ARRAY['Flatbed Truck','Crane Loading','Insurance Required'], 'In Transit', 'd0000001-0000-0000-0000-000000000001', 4, now() - interval '3 days'),

('LOAD002', 'c0000005-0000-0000-0000-000000000005', 'Mining Equipment Haul', 'Mining Equipment', 12.0, 'Gweru', 'Bulawayo', 164, 2200.00, '2026-02-24', '2026-02-25', 'One Way', 'Urgent',
 'Urgent transport of underground drilling equipment and spare parts to Bulawayo mining depot. Oversized load requiring pilot vehicle escort.',
 ARRAY['Low-Loader','Pilot Vehicle','Insurance Required'], 'In Transit', 'd0000003-0000-0000-0000-000000000003', 6, now() - interval '2 days'),

('LOAD003', 'c0000004-0000-0000-0000-000000000004', 'Consumer Electronics Delivery', 'Consumer Goods', 2.5, 'Bulawayo', 'Victoria Falls', 440, 680.00, '2026-02-26', '2026-02-28', 'One Way', 'Standard',
 'Delivery of boxed electronics (TVs, laptops, appliances) to retail store. Temperature-controlled environment preferred. High-value cargo requiring tracking.',
 ARRAY['Covered Transport','GPS Tracking','Insurance Required'], 'In Transit', 'd0000007-0000-0000-0000-000000000007', 3, now() - interval '4 days'),

('LOAD004', 'c0000002-0000-0000-0000-000000000002', 'Fresh Produce Express', 'Agricultural Products', 8.0, 'Chinhoyi', 'Harare', 116, 420.00, '2026-02-18', '2026-02-18', 'One Way', 'Urgent',
 'Same-day delivery of fresh vegetables and fruits from Chinhoyi farms to Mbare Musika market. Cold chain required to maintain freshness.',
 ARRAY['Refrigerated Truck','Same-Day Delivery'], 'Completed', 'd0000002-0000-0000-0000-000000000002', 5, now() - interval '8 days'),

('LOAD005', 'c0000003-0000-0000-0000-000000000003', 'Safari Camp Supplies', 'Tourism Equipment', 4.0, 'Harare', 'Victoria Falls', 878, 1500.00, '2026-02-15', '2026-02-17', 'One Way', 'Standard',
 'Transport of tents, bedding, kitchen equipment, and generator for new safari camp setup near Victoria Falls.',
 ARRAY['Covered Transport','Careful Handling'], 'Completed', 'd0000006-0000-0000-0000-000000000006', 7, now() - interval '10 days'),

('LOAD006', 'c0000009-0000-0000-0000-000000000009', 'Steel Coils Delivery', 'Raw Materials', 15.0, 'Kwekwe', 'Harare', 213, 1800.00, '2026-02-12', '2026-02-13', 'One Way', 'Standard',
 'Heavy steel coils from SteelWorks factory to Harare industrial area. Requires flatbed with proper securing chains.',
 ARRAY['Flatbed Truck','Heavy Load Securing','Insurance Required'], 'Completed', 'd0000001-0000-0000-0000-000000000001', 4, now() - interval '14 days'),

('LOAD007', 'c0000010-0000-0000-0000-000000000010', 'Tobacco Export Shipment', 'Agricultural Products', 10.0, 'Mutare', 'Harare', 263, 950.00, '2026-02-10', '2026-02-11', 'One Way', 'Standard',
 'Baled tobacco from eastern highlands farms to Harare auction floors. Must be covered and dry transport.',
 ARRAY['Covered Transport','Moisture Protection'], 'Completed', 'd0000008-0000-0000-0000-000000000008', 3, now() - interval '16 days'),

('LOAD008', 'c0000006-0000-0000-0000-000000000006', 'Medical Supplies Urgent', 'Medical Supplies', 1.5, 'Harare', 'Masvingo', 292, 550.00, '2026-02-28', '2026-03-01', 'One Way', 'Urgent',
 'Urgent delivery of medical supplies including vaccines (cold chain), surgical instruments, and PPE to Masvingo Provincial Hospital.',
 ARRAY['Refrigerated Truck','Temperature Monitoring','Insurance Required'], 'Assigned', 'd0000006-0000-0000-0000-000000000006', 4, now() - interval '1 day'),

('LOAD009', 'c0000001-0000-0000-0000-000000000001', 'Concrete Blocks Haulage', 'Building Materials', 20.0, 'Harare', 'Gweru', 275, 1100.00, '2026-03-01', '2026-03-02', 'One Way', 'Standard',
 'Bulk delivery of concrete blocks and paving stones for new shopping mall construction in Gweru CBD.',
 ARRAY['Flatbed Truck','Heavy Load Securing'], 'Assigned', 'd0000003-0000-0000-0000-000000000003', 5, now() - interval '1 day'),

('LOAD010', 'c0000007-0000-0000-0000-000000000007', 'Grain Silo Transfer', 'Agricultural Products', 25.0, 'Masvingo', 'Harare', 292, 1350.00, '2026-03-02', '2026-03-03', 'One Way', 'Standard',
 'Bulk grain transport from GMB Masvingo depot to Harare processing plant. Requires covered bulk carrier.',
 ARRAY['Bulk Carrier','Covered Transport','Weighbridge Certificate'], 'Assigned', 'd0000008-0000-0000-0000-000000000008', 3, now() - interval '2 days'),

('LOAD011', 'c0000004-0000-0000-0000-000000000004', 'Retail Stock Replenishment', 'Consumer Goods', 3.5, 'Harare', 'Bulawayo', 439, 650.00, '2026-03-03', '2026-03-05', 'One Way', 'Standard',
 'Monthly stock replenishment for Retail Plus Bulawayo branch. Mixed load of clothing, household goods, and small electronics.',
 ARRAY['Covered Transport','GPS Tracking'], 'In Bidding', NULL, 2, now() - interval '12 hours'),

('LOAD012', 'c0000005-0000-0000-0000-000000000005', 'Drilling Rig Relocation', 'Mining Equipment', 18.0, 'Bulawayo', 'Gweru', 164, 3500.00, '2026-03-05', '2026-03-07', 'Round Trip', 'Urgent',
 'Relocation of drilling rig and support equipment from exhausted mine site to new exploration area. Requires oversized load permits.',
 ARRAY['Low-Loader','Pilot Vehicle','Oversized Load Permit','Insurance Required'], 'In Bidding', NULL, 1, now() - interval '6 hours'),

('LOAD013', 'c0000008-0000-0000-0000-000000000008', 'Lodge Furniture Delivery', 'Furniture', 6.0, 'Harare', 'Kariba', 365, 780.00, '2026-03-04', '2026-03-06', 'One Way', 'Standard',
 'Custom-made lodge furniture including wooden beds, dining tables, chairs, and reception desk. Requires careful handling and blanket wrapping.',
 ARRAY['Covered Transport','Careful Handling','Blanket Wrap'], 'In Bidding', NULL, 4, now() - interval '18 hours'),

('LOAD014', 'c0000002-0000-0000-0000-000000000002', 'Dairy Products Distribution', 'Agricultural Products', 5.0, 'Chinhoyi', 'Bulawayo', 456, 890.00, '2026-03-06', '2026-03-07', 'One Way', 'Urgent',
 'Temperature-controlled transport of dairy products (milk, cheese, yoghurt) to Bulawayo distribution centre. Must maintain 2-8°C throughout.',
 ARRAY['Refrigerated Truck','Temperature Monitoring','Same-Day Delivery'], 'In Bidding', NULL, 3, now() - interval '4 hours'),

('LOAD015', 'c0000009-0000-0000-0000-000000000009', 'Steel Pipes Shipment', 'Raw Materials', 22.0, 'Kwekwe', 'Mutare', 340, 2100.00, '2026-03-07', '2026-03-09', 'One Way', 'Standard',
 'Long steel pipes (12m length) for pipeline construction project in Mutare. Requires flatbed with extended trailer.',
 ARRAY['Flatbed Truck','Extended Trailer','Escort Vehicle'], 'In Bidding', NULL, 0, now() - interval '2 hours'),

('LOAD016', 'c0000010-0000-0000-0000-000000000010', 'Tea Export Container', 'Agricultural Products', 7.0, 'Mutare', 'Harare', 263, 720.00, '2026-03-08', '2026-03-09', 'One Way', 'Standard',
 'Containerised tea shipment from Eastern Highlands tea estates to Harare dry port for export processing.',
 ARRAY['Container Transport','Customs Docs Ready'], 'In Bidding', NULL, 2, now() - interval '1 hour'),

('LOAD017', 'c0000003-0000-0000-0000-000000000003', 'Event Equipment Rental Returns', 'Tourism Equipment', 3.0, 'Victoria Falls', 'Harare', 878, 1200.00, '2026-03-10', '2026-03-12', 'One Way', 'Standard',
 'Return of rented event equipment (sound systems, lighting rigs, marquee frames) from Victoria Falls conference venue to Harare warehouse.',
 ARRAY['Covered Transport','Careful Handling','Insurance Required'], 'In Bidding', NULL, 1, now() - interval '30 minutes'),

('LOAD018', 'c0000006-0000-0000-0000-000000000006', 'Pharmaceutical Restock', 'Medical Supplies', 2.0, 'Harare', 'Mutare', 263, 480.00, '2026-03-03', '2026-03-04', 'One Way', 'Urgent',
 'Restock of essential medicines and medical devices for Mutare hospital network. Some items require cold chain.',
 ARRAY['Refrigerated Truck','Temperature Monitoring','Careful Handling'], 'In Bidding', NULL, 5, now() - interval '3 hours'),

('LOAD019', 'c0000001-0000-0000-0000-000000000001', 'Roof Trusses Transport', 'Building Materials', 8.0, 'Harare', 'Masvingo', 292, 920.00, '2026-03-09', '2026-03-10', 'One Way', 'Standard',
 'Pre-fabricated steel roof trusses for housing development project. Oversized items requiring careful stacking and securing.',
 ARRAY['Flatbed Truck','Careful Handling','Oversized Load Permit'], 'In Bidding', NULL, 0, now() - interval '45 minutes'),

('LOAD020', 'c0000007-0000-0000-0000-000000000007', 'Maize Meal Bulk Delivery', 'Agricultural Products', 30.0, 'Masvingo', 'Bulawayo', 290, 1600.00, '2026-03-11', '2026-03-13', 'One Way', 'Standard',
 'Bulk maize meal delivery from milling plant to Bulawayo wholesale depot. Multiple truck loads may be needed.',
 ARRAY['Bulk Carrier','Covered Transport'], 'In Bidding', NULL, 2, now() - interval '5 hours');


-- ===================== 30 BIDS =====================

INSERT INTO bids (load_id, driver_id, amount_usd, message, status, submitted_at)
VALUES
('LOAD001', 'd0000001-0000-0000-0000-000000000001', 820.00, 'I have extensive experience with building materials and a flatbed ready in Harare. Can guarantee safe delivery.', 'Accepted', now() - interval '2 days 20 hours'),
('LOAD001', 'd0000003-0000-0000-0000-000000000003', 880.00, 'Available for this route. Can provide crane loading at destination.', 'Rejected', now() - interval '2 days 18 hours'),
('LOAD001', 'd0000007-0000-0000-0000-000000000007', 850.00, 'Familiar with this route and have insurance coverage for construction materials.', 'Rejected', now() - interval '2 days 16 hours'),
('LOAD001', 'd0000004-0000-0000-0000-000000000004', 900.00, 'Can handle this load with my 10-ton flatbed. Harare to Bulawayo is my regular route.', 'Rejected', now() - interval '2 days 15 hours'),

('LOAD002', 'd0000003-0000-0000-0000-000000000003', 2100.00, 'Mining equipment is my speciality. Have low-loader with pilot vehicle available immediately.', 'Accepted', now() - interval '1 day 22 hours'),
('LOAD002', 'd0000009-0000-0000-0000-000000000009', 2350.00, 'Can mobilise within 2 hours for this urgent load. Have oversized load permits ready.', 'Rejected', now() - interval '1 day 20 hours'),
('LOAD002', 'd0000001-0000-0000-0000-000000000001', 2200.00, 'Heavy equipment transport specialist. Available for urgent loads.', 'Rejected', now() - interval '1 day 18 hours'),

('LOAD003', 'd0000007-0000-0000-0000-000000000007', 650.00, 'Electronics handling is my forte. Fully padded truck with GPS tracking available.', 'Accepted', now() - interval '3 days 20 hours'),
('LOAD003', 'd0000006-0000-0000-0000-000000000006', 700.00, 'Can provide temperature-controlled transport for sensitive electronics.', 'Rejected', now() - interval '3 days 18 hours'),
('LOAD003', 'd0000004-0000-0000-0000-000000000004', 720.00, 'Covered truck with full insurance available for this route.', 'Rejected', now() - interval '3 days 16 hours'),

('LOAD004', 'd0000002-0000-0000-0000-000000000002', 400.00, 'My refrigerated truck is ready in Chinhoyi. Can deliver to Mbare Musika by noon.', 'Accepted', now() - interval '7 days'),
('LOAD004', 'd0000008-0000-0000-0000-000000000008', 430.00, 'Available for same-day delivery from Chinhoyi.', 'Rejected', now() - interval '7 days'),

('LOAD005', 'd0000006-0000-0000-0000-000000000006', 1450.00, 'Tourism logistics is my speciality. Will ensure careful handling of all camp equipment.', 'Accepted', now() - interval '9 days'),
('LOAD005', 'd0000010-0000-0000-0000-000000000010', 1550.00, 'Based near Victoria Falls, familiar with this route and tourism equipment handling.', 'Rejected', now() - interval '9 days'),

('LOAD008', 'd0000006-0000-0000-0000-000000000006', 530.00, 'Medical supply logistics certified. Cold chain vehicle available with temperature monitoring.', 'Accepted', now() - interval '20 hours'),
('LOAD008', 'd0000002-0000-0000-0000-000000000002', 560.00, 'Refrigerated truck available for medical supply transport.', 'Rejected', now() - interval '18 hours'),

('LOAD011', 'd0000004-0000-0000-0000-000000000004', 620.00, 'Regular Harare-Bulawayo route. Covered truck with GPS available.', 'Pending', now() - interval '10 hours'),
('LOAD011', 'd0000007-0000-0000-0000-000000000007', 640.00, 'Can handle mixed consumer goods with proper segregation in transit.', 'Pending', now() - interval '8 hours'),

('LOAD013', 'd0000007-0000-0000-0000-000000000007', 750.00, 'Furniture transport specialist. Will use blanket wrap and secure strapping for all items.', 'Pending', now() - interval '16 hours'),
('LOAD013', 'd0000010-0000-0000-0000-000000000010', 800.00, 'Experienced with lodge furniture deliveries to Kariba area.', 'Pending', now() - interval '14 hours'),
('LOAD013', 'd0000004-0000-0000-0000-000000000004', 780.00, 'Covered transport available with careful handling guarantee.', 'Pending', now() - interval '12 hours'),
('LOAD013', 'd0000001-0000-0000-0000-000000000001', 790.00, 'Can provide blanket wrap service and careful doorstep delivery.', 'Pending', now() - interval '10 hours'),

('LOAD014', 'd0000002-0000-0000-0000-000000000002', 860.00, 'Cold chain specialist. My truck maintains 2-8°C with continuous monitoring and alerts.', 'Pending', now() - interval '3 hours'),
('LOAD014', 'd0000008-0000-0000-0000-000000000008', 900.00, 'Agricultural cold chain available. Chinhoyi is my regular pickup area.', 'Pending', now() - interval '2 hours'),
('LOAD014', 'd0000006-0000-0000-0000-000000000006', 880.00, 'Express delivery specialist with refrigerated vehicle available.', 'Pending', now() - interval '1 hour'),

('LOAD018', 'd0000006-0000-0000-0000-000000000006', 460.00, 'Medical supply certified. Can depart Harare within 1 hour.', 'Pending', now() - interval '2 hours 30 minutes'),
('LOAD018', 'd0000002-0000-0000-0000-000000000002', 480.00, 'Cold chain vehicle ready. Familiar with pharmaceutical logistics requirements.', 'Pending', now() - interval '2 hours'),
('LOAD018', 'd0000005-0000-0000-0000-000000000005', 500.00, 'Certified for hazmat and pharmaceutical transport. Temperature-monitored vehicle available.', 'Pending', now() - interval '1 hour 45 minutes');


-- ===================== 10 JOBS =====================

INSERT INTO jobs (job_id, load_id, driver_id, client_id, rate_usd, status, progress_pct, started_at, completed_at)
VALUES
('JOB001', 'LOAD001', 'd0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 820.00, 'In Transit', 65, now() - interval '1 day', NULL),
('JOB002', 'LOAD002', 'd0000003-0000-0000-0000-000000000003', 'c0000005-0000-0000-0000-000000000005', 2100.00, 'In Transit', 40, now() - interval '12 hours', NULL),
('JOB003', 'LOAD003', 'd0000007-0000-0000-0000-000000000007', 'c0000004-0000-0000-0000-000000000004', 650.00, 'In Transit', 80, now() - interval '2 days', NULL),
('JOB004', 'LOAD004', 'd0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 400.00, 'Completed', 100, now() - interval '8 days', now() - interval '7 days 16 hours'),
('JOB005', 'LOAD005', 'd0000006-0000-0000-0000-000000000006', 'c0000003-0000-0000-0000-000000000003', 1450.00, 'Completed', 100, now() - interval '10 days', now() - interval '8 days'),
('JOB006', 'LOAD006', 'd0000001-0000-0000-0000-000000000001', 'c0000009-0000-0000-0000-000000000009', 1800.00, 'Completed', 100, now() - interval '14 days', now() - interval '13 days'),
('JOB007', 'LOAD007', 'd0000008-0000-0000-0000-000000000008', 'c0000010-0000-0000-0000-000000000010', 950.00, 'Completed', 100, now() - interval '16 days', now() - interval '15 days'),
('JOB008', 'LOAD008', 'd0000006-0000-0000-0000-000000000006', 'c0000006-0000-0000-0000-000000000006', 530.00, 'Pending', 0, NULL, NULL),
('JOB009', 'LOAD009', 'd0000003-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 1100.00, 'Active', 0, NULL, NULL),
('JOB010', 'LOAD010', 'd0000008-0000-0000-0000-000000000008', 'c0000007-0000-0000-0000-000000000007', 1350.00, 'Pending', 0, NULL, NULL);


-- ===================== MESSAGES =====================

INSERT INTO messages (job_id, sender_id, recipient_id, content, "read", sent_at) VALUES
('JOB001', 'c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Hi Tendai, thanks for accepting the job. The materials are ready for pickup at our Harare warehouse on Seke Rd.', true, now() - interval '1 day 2 hours'),
('JOB001', 'd0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Thank you! I will be there at 6am sharp. Do I need any special documentation for the loading bay?', true, now() - interval '1 day 1 hour'),
('JOB001', 'c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Just your ID and the job reference number JOB001. The foreman will be expecting you. Gate 3.', true, now() - interval '1 day'),
('JOB001', 'd0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Loading complete. 5 tons of cement and steel loaded. Departing Harare now, ETA Bulawayo around 1pm.', true, now() - interval '18 hours'),
('JOB001', 'c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Great, please update me when you pass through Kadoma.', true, now() - interval '17 hours'),
('JOB001', 'd0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Just passed Kadoma. Roads are clear, making good time. Should arrive ahead of schedule.', false, now() - interval '12 hours'),

('JOB002', 'c0000005-0000-0000-0000-000000000005', 'd0000003-0000-0000-0000-000000000003', 'James, the drilling equipment is at our Gweru depot. This is a priority move — the Bulawayo site is waiting.', true, now() - interval '12 hours'),
('JOB002', 'd0000003-0000-0000-0000-000000000003', 'c0000005-0000-0000-0000-000000000005', 'Understood. My low-loader and pilot vehicle are en route to Gweru now. We should be loaded by midday.', true, now() - interval '11 hours'),
('JOB002', 'c0000005-0000-0000-0000-000000000005', 'd0000003-0000-0000-0000-000000000003', 'Perfect. The site foreman at Bulawayo is Tapiwa — call him on +263 77 555 1234 when you are 30 mins out.', true, now() - interval '10 hours'),
('JOB002', 'd0000003-0000-0000-0000-000000000003', 'c0000005-0000-0000-0000-000000000005', 'Loading complete. Departing Gweru depot now with pilot vehicle leading. Will call Tapiwa as instructed.', false, now() - interval '6 hours'),

('JOB004', 'c0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 'Sarah, the produce is packed and ready at Farm 12, Chinhoyi. Please maintain 4°C during transport.', true, now() - interval '8 days'),
('JOB004', 'd0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'Refrigerated truck pre-cooled to 4°C. Departing Chinhoyi in 15 minutes. ETA Mbare Musika by 10am.', true, now() - interval '7 days 22 hours'),
('JOB004', 'd0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'Delivered successfully to Mbare Musika at 9:45am. Temperature maintained throughout. Receipt signed by your agent.', true, now() - interval '7 days 16 hours'),
('JOB004', 'c0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 'Excellent work Sarah! The produce arrived in perfect condition. Will definitely use your services again. 5 stars!', true, now() - interval '7 days 14 hours'),

('JOB005', 'c0000003-0000-0000-0000-000000000003', 'd0000006-0000-0000-0000-000000000006', 'Hi Patricia, the camp equipment is at our Harare office. It is a mix of tents, beds, and a generator — handle with care!', true, now() - interval '10 days'),
('JOB005', 'd0000006-0000-0000-0000-000000000006', 'c0000003-0000-0000-0000-000000000003', 'No problem! I specialise in careful handling. Will use blanket wrap for the generator. Picking up tomorrow at 5am.', true, now() - interval '9 days 20 hours'),
('JOB005', 'd0000006-0000-0000-0000-000000000006', 'c0000003-0000-0000-0000-000000000003', 'All delivered to the Victoria Falls camp site. Everything in perfect condition. The camp manager signed off.', true, now() - interval '8 days 2 hours'),
('JOB005', 'c0000003-0000-0000-0000-000000000003', 'd0000006-0000-0000-0000-000000000006', 'Brilliant! Thank you Patricia. The team is thrilled. Payment released now.', true, now() - interval '8 days'),

('JOB008', 'c0000006-0000-0000-0000-000000000006', 'd0000006-0000-0000-0000-000000000006', 'Patricia, your bid has been accepted. The medical supplies will be ready at our Kwame Nkrumah warehouse on Feb 28.', true, now() - interval '18 hours'),
('JOB008', 'd0000006-0000-0000-0000-000000000006', 'c0000006-0000-0000-0000-000000000006', 'Confirmed! I will have my temperature-monitored vehicle ready. Are there any specific handling instructions for the vaccines?', true, now() - interval '16 hours'),
('JOB008', 'c0000006-0000-0000-0000-000000000006', 'd0000006-0000-0000-0000-000000000006', 'Yes — the vaccines must stay between 2-8°C. We will provide insulated boxes but your fridge truck is essential backup. Also, please bring your cold chain certification documents.', false, now() - interval '14 hours');


-- ===================== REVIEWS =====================

INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment, created_at) VALUES
('JOB004', 'c0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 5.0, 'Excellent cold chain service. Produce arrived fresh and on time. Highly recommended for perishable goods.', now() - interval '7 days'),
('JOB004', 'd0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 5.0, 'Great client — everything was ready on time and well-packed. Smooth transaction.', now() - interval '7 days'),
('JOB005', 'c0000003-0000-0000-0000-000000000003', 'd0000006-0000-0000-0000-000000000006', 5.0, 'Professional handling of fragile equipment. Everything arrived in perfect condition over a long route.', now() - interval '8 days'),
('JOB005', 'd0000006-0000-0000-0000-000000000006', 'c0000003-0000-0000-0000-000000000003', 4.5, 'Well-organised client. Clear instructions and prompt payment.', now() - interval '8 days'),
('JOB006', 'c0000009-0000-0000-0000-000000000009', 'd0000001-0000-0000-0000-000000000001', 4.5, 'Heavy load handled with expertise. Tendai knows his way around flatbed operations.', now() - interval '13 days'),
('JOB006', 'd0000001-0000-0000-0000-000000000001', 'c0000009-0000-0000-0000-000000000009', 5.0, 'SteelWorks has an efficient loading operation. Will work with them again.', now() - interval '13 days'),
('JOB007', 'c0000010-0000-0000-0000-000000000010', 'd0000008-0000-0000-0000-000000000008', 4.0, 'Good delivery, arrived on time. Tobacco bales well-protected from moisture.', now() - interval '15 days'),
('JOB007', 'd0000008-0000-0000-0000-000000000008', 'c0000010-0000-0000-0000-000000000010', 4.5, 'Professional farm operation. Loading was quick and efficient.', now() - interval '15 days');


-- ===================== NOTIFICATIONS =====================

INSERT INTO notifications (user_id, title, body, type, "read", reference_id, created_at) VALUES
('d0000001-0000-0000-0000-000000000001', 'Bid Accepted', 'Your bid of $820 on LOAD001 (Building Materials Transport) has been accepted!', 'bid', true, 'LOAD001', now() - interval '2 days'),
('d0000001-0000-0000-0000-000000000001', 'New Load Available', 'A new Building Materials load from Harare to Masvingo is available on the load board.', 'info', false, 'LOAD019', now() - interval '45 minutes'),
('d0000003-0000-0000-0000-000000000003', 'Bid Accepted', 'Your bid of $2,100 on LOAD002 (Mining Equipment Haul) has been accepted!', 'bid', true, 'LOAD002', now() - interval '1 day'),
('d0000003-0000-0000-0000-000000000003', 'Job Assigned', 'You have been assigned to LOAD009 (Concrete Blocks Haulage). Please prepare for pickup on March 1.', 'job', false, 'JOB009', now() - interval '1 day'),
('d0000006-0000-0000-0000-000000000006', 'New Message', 'You have a new message from MediSupply Zim regarding JOB008.', 'message', false, 'JOB008', now() - interval '14 hours'),
('d0000007-0000-0000-0000-000000000007', 'Delivery Update', 'Your delivery for JOB003 is at 80% progress. Keep up the great work!', 'job', false, 'JOB003', now() - interval '4 hours'),
('d0000002-0000-0000-0000-000000000002', 'New Review', 'Farm Fresh Zimbabwe left you a 5-star review. Check your profile!', 'info', true, 'JOB004', now() - interval '7 days'),
('c0000001-0000-0000-0000-000000000001', 'Driver Update', 'Tendai Mukamuri has passed Kadoma and is making good time on LOAD001.', 'job', false, 'JOB001', now() - interval '12 hours'),
('c0000001-0000-0000-0000-000000000001', 'New Bid Received', 'You received a new bid on LOAD019 (Roof Trusses Transport).', 'bid', false, 'LOAD019', now() - interval '30 minutes'),
('c0000004-0000-0000-0000-000000000004', 'Delivery Progress', 'LOAD003 delivery is now at 80%. Expected arrival in Victoria Falls soon.', 'job', false, 'JOB003', now() - interval '4 hours'),
('c0000005-0000-0000-0000-000000000005', 'Bids Received', 'LOAD012 (Drilling Rig Relocation) has received its first bid from a driver.', 'bid', false, 'LOAD012', now() - interval '5 hours'),
('c0000006-0000-0000-0000-000000000006', 'Driver Confirmed', 'Patricia Nyoni has confirmed receipt of medical supply handling instructions for JOB008.', 'message', false, 'JOB008', now() - interval '14 hours'),
('c0000008-0000-0000-0000-000000000008', 'Multiple Bids', 'LOAD013 (Lodge Furniture Delivery) has received 4 bids. Review them now!', 'bid', false, 'LOAD013', now() - interval '8 hours');


-- ===================== EXTRA COMPLETED LOADS (for reviews) =====================

INSERT INTO loads (load_id, client_id, title, cargo_type, weight_tons, origin_city, destination_city, distance_km, budget_usd, pickup_date, delivery_date, trip_type, urgency, description, requirements, status, assigned_driver_id, bids_count, posted_at)
VALUES
('LOAD021', 'c0000007-0000-0000-0000-000000000007', 'Cross-Border Maize Delivery', 'Agricultural Products', 18.0, 'Masvingo', 'Beit Bridge', 298, 1400.00, '2026-01-10', '2026-01-12', 'One Way', 'Standard',
 'Bulk maize delivery from Masvingo to Beit Bridge for export. Covered transport required.', ARRAY['Bulk Carrier','Customs Docs'], 'Completed', 'd0000003-0000-0000-0000-000000000003', 2, now() - interval '45 days'),

('LOAD022', 'c0000008-0000-0000-0000-000000000008', 'Cross-Border Goods Transport', 'General Freight', 6.0, 'Harare', 'Beitbridge', 580, 1100.00, '2026-01-15', '2026-01-17', 'One Way', 'Standard',
 'Mixed general freight for cross-border delivery. Customs paperwork included.', ARRAY['Covered Transport','GPS Tracking'], 'Completed', 'd0000004-0000-0000-0000-000000000004', 3, now() - interval '40 days'),

('LOAD023', 'c0000006-0000-0000-0000-000000000006', 'Industrial Chemical Delivery', 'Chemicals', 5.0, 'Harare', 'Kwekwe', 213, 1300.00, '2026-01-20', '2026-01-21', 'One Way', 'Urgent',
 'Certified hazmat chemical transport for industrial facility. ADR compliance required.', ARRAY['Hazmat Certified','Temperature Control'], 'Completed', 'd0000005-0000-0000-0000-000000000005', 4, now() - interval '35 days'),

('LOAD024', 'c0000010-0000-0000-0000-000000000010', 'Exhibition Equipment Delivery', 'Tourism Equipment', 3.5, 'Bulawayo', 'Victoria Falls', 440, 950.00, '2026-01-25', '2026-01-27', 'One Way', 'Standard',
 'Exhibition equipment and display stands for Victoria Falls Tourism Expo.', ARRAY['Covered Transport','Careful Handling'], 'Completed', 'd0000007-0000-0000-0000-000000000007', 2, now() - interval '30 days'),

('LOAD025', 'c0000001-0000-0000-0000-000000000001', 'Crane & Heavy Equipment Move', 'Mining Equipment', 22.0, 'Harare', 'Gweru', 275, 3200.00, '2026-02-01', '2026-02-03', 'One Way', 'Standard',
 'Large crane and earthmoving equipment relocation for construction project.', ARRAY['Low-Loader','Pilot Vehicle','Oversized Load Permit'], 'Completed', 'd0000009-0000-0000-0000-000000000009', 3, now() - interval '24 days'),

('LOAD026', 'c0000003-0000-0000-0000-000000000003', 'Safari Vehicle Transport', 'Vehicles', 8.0, 'Harare', 'Kariba', 365, 1800.00, '2026-02-05', '2026-02-07', 'One Way', 'Standard',
 'Transport of three safari game-viewer vehicles from Harare dealership to new Kariba lodge.', ARRAY['Car Carrier','GPS Tracking','Insurance Required'], 'Completed', 'd0000010-0000-0000-0000-000000000010', 2, now() - interval '20 days');


-- ===================== EXTRA COMPLETED JOBS (for reviews) =====================

INSERT INTO jobs (job_id, load_id, driver_id, client_id, rate_usd, status, progress_pct, started_at, completed_at)
VALUES
('JOB011', 'LOAD021', 'd0000003-0000-0000-0000-000000000003', 'c0000007-0000-0000-0000-000000000007', 1350.00, 'Completed', 100, now() - interval '45 days', now() - interval '43 days'),
('JOB012', 'LOAD022', 'd0000004-0000-0000-0000-000000000004', 'c0000008-0000-0000-0000-000000000008', 1050.00, 'Completed', 100, now() - interval '40 days', now() - interval '38 days'),
('JOB013', 'LOAD023', 'd0000005-0000-0000-0000-000000000005', 'c0000006-0000-0000-0000-000000000006', 1250.00, 'Completed', 100, now() - interval '35 days', now() - interval '34 days'),
('JOB014', 'LOAD024', 'd0000007-0000-0000-0000-000000000007', 'c0000010-0000-0000-0000-000000000010', 900.00, 'Completed', 100, now() - interval '30 days', now() - interval '28 days'),
('JOB015', 'LOAD025', 'd0000009-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000001', 3100.00, 'Completed', 100, now() - interval '24 days', now() - interval '22 days'),
('JOB016', 'LOAD026', 'd0000010-0000-0000-0000-000000000010', 'c0000003-0000-0000-0000-000000000003', 1750.00, 'Completed', 100, now() - interval '20 days', now() - interval '18 days');


-- ===================== FULL REVIEWS FOR ALL 10 DRIVERS =====================

INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment, created_at) VALUES
-- Driver 1 (Tendai): JOB006 - existing
('JOB006', 'c0000009-0000-0000-0000-000000000009', 'd0000001-0000-0000-0000-000000000001', 4.5, 'Heavy load handled with expertise. Tendai knows his way around flatbed operations. Professional from pickup to delivery.', now() - interval '13 days'),
('JOB006', 'd0000001-0000-0000-0000-000000000001', 'c0000009-0000-0000-0000-000000000009', 5.0, 'SteelWorks has an efficient loading operation. Will work with them again.', now() - interval '13 days'),

-- Driver 2 (Sarah): JOB004 - existing
('JOB004', 'c0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 5.0, 'Excellent cold chain service. Produce arrived fresh and on time. Sarah is a true professional for perishable goods.', now() - interval '7 days'),
('JOB004', 'd0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 5.0, 'Great client — everything was ready on time and well-packed. Smooth transaction.', now() - interval '7 days'),

-- Driver 3 (James): JOB011 - new
('JOB011', 'c0000007-0000-0000-0000-000000000007', 'd0000003-0000-0000-0000-000000000003', 4.5, 'James handled the cross-border paperwork seamlessly. The drilling equipment arrived in Beit Bridge without a scratch. Will use again for mining hauls.', now() - interval '43 days'),
('JOB011', 'd0000003-0000-0000-0000-000000000003', 'c0000007-0000-0000-0000-000000000007', 5.0, 'Well-organised client. Clear cargo description and documentation ready. Made my job easy.', now() - interval '43 days'),

-- Driver 4 (Grace): JOB012 - new
('JOB012', 'c0000008-0000-0000-0000-000000000008', 'd0000004-0000-0000-0000-000000000004', 4.5, 'Grace knows the cross-border routes exceptionally well. Cargo cleared customs without delays and arrived in perfect condition. Highly recommended.', now() - interval '38 days'),
('JOB012', 'd0000004-0000-0000-0000-000000000004', 'c0000008-0000-0000-0000-000000000008', 4.5, 'Good client with clear requirements. Freight was well-packaged for the long journey. Would work with again.', now() - interval '38 days'),

-- Driver 5 (Michael): JOB013 - new
('JOB013', 'c0000006-0000-0000-0000-000000000006', 'd0000005-0000-0000-0000-000000000005', 5.0, 'Michael is the best hazmat driver on the platform. His ADR certification is current and he maintains flawless documentation. The chemicals arrived temperature-controlled and on schedule. Exceptional professionalism.', now() - interval '34 days'),
('JOB013', 'd0000005-0000-0000-0000-000000000005', 'c0000006-0000-0000-0000-000000000006', 5.0, 'MediSupply Zim is a top-tier client. Clear chemical specifications, proper packaging, and quick payment after delivery.', now() - interval '34 days'),

-- Driver 6 (Patricia): JOB005 - existing
('JOB005', 'c0000003-0000-0000-0000-000000000003', 'd0000006-0000-0000-0000-000000000006', 5.0, 'Professional handling of fragile equipment. Everything arrived in perfect condition over a long route. Patricia is our go-to driver for urgent and delicate loads.', now() - interval '8 days'),
('JOB005', 'd0000006-0000-0000-0000-000000000006', 'c0000003-0000-0000-0000-000000000003', 4.5, 'Well-organised client. Clear instructions and prompt payment.', now() - interval '8 days'),

-- Driver 7 (Tatenda): JOB014 - new
('JOB014', 'c0000010-0000-0000-0000-000000000010', 'd0000007-0000-0000-0000-000000000007', 4.5, 'Tatenda wrapped each exhibition stand individually and delivered everything safely. Some items were very fragile and he handled them with care. No damage whatsoever.', now() - interval '28 days'),
('JOB014', 'd0000007-0000-0000-0000-000000000007', 'c0000010-0000-0000-0000-000000000010', 4.5, 'Excellent client with well-labelled cargo. The exhibition items were fragile but clearly marked. Smooth handover at Victoria Falls.', now() - interval '28 days'),

-- Driver 8 (Rumbidzai): JOB007 - existing
('JOB007', 'c0000010-0000-0000-0000-000000000010', 'd0000008-0000-0000-0000-000000000008', 4.0, 'Good delivery, arrived on time. Tobacco bales were well-protected from moisture. Rumbidzai communicates regularly during transit which is appreciated.', now() - interval '15 days'),
('JOB007', 'd0000008-0000-0000-0000-000000000008', 'c0000010-0000-0000-0000-000000000010', 4.5, 'Professional farm operation. Loading was quick and efficient. Bales were perfectly wrapped.', now() - interval '15 days'),

-- Driver 9 (Blessing): JOB015 - new
('JOB015', 'c0000001-0000-0000-0000-000000000001', 'd0000009-0000-0000-0000-000000000009', 4.5, 'Blessing moved our 22-ton crane with zero incidents. He had all the permits ready and coordinated the pilot vehicle flawlessly. The site team was very impressed. Would use again for heavy lifts.', now() - interval '22 days'),
('JOB015', 'd0000009-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000001', 5.0, 'ABC Construction is a well-run company. The crane was secured and the site access was well-prepared. Professional interaction from start to finish.', now() - interval '22 days'),

-- Driver 10 (Farai): JOB016 - new
('JOB016', 'c0000003-0000-0000-0000-000000000003', 'd0000010-0000-0000-0000-000000000010', 4.5, 'Farai transported three game-viewer vehicles to our Kariba lodge without a single scratch. He understands the tourism sector and handled the vehicles like they were his own. Very professional attitude.', now() - interval '18 days'),
('JOB016', 'd0000010-0000-0000-0000-000000000010', 'c0000003-0000-0000-0000-000000000003', 5.0, 'Safari Lodge Group is a great client. Vehicles were ready for pickup on time and the Kariba delivery location was easy to navigate. Would recommend.', now() - interval '18 days');


-- ============================================================
-- DONE! TakuraBid schema is ready.
-- ============================================================
--
-- Summary:
--   • 7 tables: users, loads, bids, jobs, messages, notifications, reviews
--   • 20 users (10 drivers + 10 clients), all with password 'password123'
--   • 26 loads (completed, in-transit, assigned, in-bidding)
--   • 28+ bids across multiple loads
--   • 16 jobs (completed, in-transit, pending, active)
--   • Messages across multiple job threads
--   • 20 reviews — 2 per driver (all 10 drivers covered)
--   • Notifications for various events
--   • RLS DISABLED — app uses anon key with server-side session auth
--   • Auto-triggers for updated_at and bids_count
--   • Full indexes for performance
-- ============================================================