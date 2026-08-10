-- PostgreSQL Database DDL Schema for Kaksedthan Livestock Management System
-- Database: kaksedthan_herdbook

-- Drop tables if exists (cascade for clean reset during migration)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS pedigrees CASCADE;
DROP TABLE IF EXISTS herdbook_registrations CASCADE;
DROP TABLE IF EXISTS herdbook_setup CASCADE;
DROP TABLE IF EXISTS calves CASCADE;
DROP TABLE IF EXISTS breeding_programs CASCADE;
DROP TABLE IF EXISTS breeding_setup CASCADE;
DROP TABLE IF EXISTS dams CASCADE;
DROP TABLE IF EXISTS stock_insemination CASCADE;
DROP TABLE IF EXISTS sires CASCADE;
DROP TABLE IF EXISTS feed_transactions CASCADE;
DROP TABLE IF EXISTS feed_products CASCADE;
DROP TABLE IF EXISTS batch_cows CASCADE;
DROP TABLE IF EXISTS weight_tracking CASCADE;
DROP TABLE IF EXISTS sales_tracking CASCADE;
DROP TABLE IF EXISTS health_logs CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS stock CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS master_settings CASCADE;

-- 1. Master Settings Storage
CREATE TABLE master_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Authentication Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Farm Owner', -- Super Admin | Admin | Manager | Breeder | Farm Owner | Technician | Staff | Public User
    status VARCHAR(20) DEFAULT 'Active',
    password VARCHAR(255) NOT NULL,
    farm_location VARCHAR(100),
    phone VARCHAR(50),
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sire Register Table
CREATE TABLE sires (
    id VARCHAR(50) PRIMARY KEY, -- SIR-001
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(50) NOT NULL,
    dob DATE,
    bloodline VARCHAR(100),
    image_url TEXT,
    owner_name VARCHAR(100),
    farm_location VARCHAR(100),
    status VARCHAR(30) DEFAULT 'Active', -- Active | Retired | Sold | Deceased | Archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Stock Insemination (Semen Stock & Services) Table
CREATE TABLE stock_insemination (
    id VARCHAR(50) PRIMARY KEY, -- SEM-001
    sire_id VARCHAR(50) NOT NULL REFERENCES sires(id) ON DELETE CASCADE,
    stock_available INT DEFAULT 0,
    price_usd NUMERIC(10, 2) DEFAULT 0,
    price_khr NUMERIC(14, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    owner_name VARCHAR(100),
    farm_location VARCHAR(100),
    breeder_name VARCHAR(100),
    availability VARCHAR(30) DEFAULT 'Available', -- Available | Out of Stock | Reserved | Discontinued
    status VARCHAR(30) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Dam Register Table
CREATE TABLE dams (
    id VARCHAR(50) PRIMARY KEY, -- DAM-001
    name VARCHAR(100),
    breed VARCHAR(50) NOT NULL,
    dob DATE,
    owner_name VARCHAR(100),
    farm_location VARCHAR(100),
    image_url TEXT,
    availability VARCHAR(30) DEFAULT 'Available', -- Available | In Breeding | Pregnant | Sold | Transferred | Deceased | Archived
    breeding_status VARCHAR(50) DEFAULT 'Open', -- Open | In Breeding | Confirmed Pregnant | Calved
    pregnancy_status VARCHAR(50) DEFAULT 'Open', -- Open | Pending Check | Confirmed Pregnant
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Breeding Setup Configuration Table
CREATE TABLE breeding_setup (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Breeding Programs Table (Central Operational Function)
CREATE TABLE breeding_programs (
    id VARCHAR(50) PRIMARY KEY, -- BP-2026-0001
    program_number VARCHAR(50) UNIQUE NOT NULL,
    breeding_type VARCHAR(30) DEFAULT 'AI', -- AI | Natural Mating | Embryo Transfer
    breeding_method VARCHAR(50) DEFAULT 'Artificial Insemination',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sire_id VARCHAR(50) NOT NULL REFERENCES sires(id) ON DELETE RESTRICT,
    dam_id VARCHAR(50) NOT NULL REFERENCES dams(id) ON DELETE RESTRICT,
    owner_name VARCHAR(100),
    cow_owner VARCHAR(100),
    farm_location VARCHAR(100),
    breeder_name VARCHAR(100),
    price_usd NUMERIC(10, 2) DEFAULT 0,
    price_khr NUMERIC(14, 2) DEFAULT 0,
    breeding_date DATE,
    pregnancy_check_date DATE,
    expected_calving_date DATE,
    actual_calving_date DATE,
    result VARCHAR(50), -- Successful | Failed | Aborted | Calved
    status VARCHAR(50) DEFAULT 'Draft', -- Draft | Scheduled | Breeding | Pregnancy Check | Pregnant | Expected Calving | Calved | Calf Registered | Completed | Cancelled | Failed | Not Pregnant
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Calves Register Table
CREATE TABLE calves (
    id VARCHAR(50) PRIMARY KEY, -- CLF-2026-001
    breeding_program_id VARCHAR(50) REFERENCES breeding_programs(id) ON DELETE SET NULL,
    sire_id VARCHAR(50) NOT NULL REFERENCES sires(id) ON DELETE RESTRICT,
    dam_id VARCHAR(50) NOT NULL REFERENCES dams(id) ON DELETE RESTRICT,
    name VARCHAR(100),
    sex VARCHAR(10) NOT NULL, -- Male | Female
    breed VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL DEFAULT CURRENT_DATE,
    birth_weight NUMERIC(8, 2) DEFAULT 0,
    color VARCHAR(50),
    owner_name VARCHAR(100),
    farm_location VARCHAR(100),
    breeder_name VARCHAR(100),
    image_url TEXT,
    status VARCHAR(30) DEFAULT 'Active', -- Active | Registered to Herdbook | Sold | Deceased | Archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Herdbook Setup Table
CREATE TABLE herdbook_setup (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Herdbook Registrations Table
CREATE TABLE herdbook_registrations (
    id VARCHAR(50) PRIMARY KEY, -- HR-2026-001
    registration_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. KH-2026-8891
    animal_type VARCHAR(30) NOT NULL, -- Sire | Dam | Calf
    animal_id VARCHAR(50) NOT NULL,
    sire_id VARCHAR(50) REFERENCES sires(id) ON DELETE SET NULL,
    dam_id VARCHAR(50) REFERENCES dams(id) ON DELETE SET NULL,
    calf_id VARCHAR(50) REFERENCES calves(id) ON DELETE SET NULL,
    breeding_program_id VARCHAR(50) REFERENCES breeding_programs(id) ON DELETE SET NULL,
    owner_name VARCHAR(100),
    farm_location VARCHAR(100),
    breeder_name VARCHAR(100),
    registration_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'Under Review', -- Draft | Under Review | Verified | Approved | Published | Archived
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    public_token VARCHAR(100) UNIQUE NOT NULL, -- Secure token for QR verification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Pedigree Management Table
CREATE TABLE pedigrees (
    id SERIAL PRIMARY KEY,
    animal_id VARCHAR(50) NOT NULL UNIQUE,
    sire_id VARCHAR(50) REFERENCES sires(id) ON DELETE SET NULL,
    dam_id VARCHAR(50) REFERENCES dams(id) ON DELETE SET NULL,
    grand_sire_paternal VARCHAR(100),
    grand_dam_paternal VARCHAR(100),
    grand_sire_maternal VARCHAR(100),
    grand_dam_maternal VARCHAR(100),
    generation_level INT DEFAULT 2,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Certificates Table
CREATE TABLE certificates (
    id VARCHAR(50) PRIMARY KEY, -- CERT-2026-001
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    registration_id VARCHAR(50) NOT NULL REFERENCES herdbook_registrations(id) ON DELETE CASCADE,
    calf_id VARCHAR(50) REFERENCES calves(id) ON DELETE SET NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    layout_type VARCHAR(30) DEFAULT 'A4 Landscape',
    public_verification_url TEXT NOT NULL,
    qr_code_data TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Audit & History Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL, -- CREATE | UPDATE | VERIFY | APPROVE | STATUS_CHANGE
    module VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    performed_by VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Stock / General Livestock Table (Legacy Compatibility)
CREATE TABLE stock (
    id VARCHAR(50) PRIMARY KEY,
    no VARCHAR(20) NOT NULL,
    breed VARCHAR(50),
    sex VARCHAR(20),
    age VARCHAR(50),
    weight NUMERIC(10, 2) DEFAULT 0,
    owner_name VARCHAR(100),
    location VARCHAR(100),
    phone VARCHAR(50),
    buy_type VARCHAR(50),
    unit_price NUMERIC(12, 2) DEFAULT 0,
    total_price NUMERIC(12, 2) DEFAULT 0,
    health_status VARCHAR(50) DEFAULT 'Good',
    status VARCHAR(50) DEFAULT 'Active',
    purchase_date TIMESTAMP WITH TIME ZONE,
    remark TEXT,
    purchase_type VARCHAR(50),
    payment_method VARCHAR(50),
    image_url TEXT,
    purpose VARCHAR(50) DEFAULT 'Fattening',
    dam_id VARCHAR(50),
    sire_id VARCHAR(50),
    breeding_status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Weight Tracking History Table
CREATE TABLE weight_tracking (
    id SERIAL PRIMARY KEY,
    cow_id VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
    breed VARCHAR(50),
    age VARCHAR(50),
    old_weight NUMERIC(10, 2) DEFAULT 0,
    current_weight NUMERIC(10, 2) DEFAULT 0,
    gain_loss NUMERIC(10, 4) DEFAULT 0,
    health_status VARCHAR(50),
    status VARCHAR(50),
    tracking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Sales Tracking Table
CREATE TABLE sales_tracking (
    id SERIAL PRIMARY KEY,
    cow_id VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
    breed VARCHAR(50),
    age VARCHAR(50),
    weight NUMERIC(10, 2) DEFAULT 0,
    unit_price NUMERIC(12, 2) DEFAULT 0,
    total_price NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Sold',
    sales_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sale_type VARCHAR(50),
    buyer VARCHAR(100)
);

-- 17. Batches Table
CREATE TABLE batches (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT,
    farm_location VARCHAR(100),
    feeding_program JSONB DEFAULT NULL,
    expected_selling_price NUMERIC DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Batch Cows Junction Table
CREATE TABLE batch_cows (
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    cow_id VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
    PRIMARY KEY (batch_id, cow_id)
);

-- 19. Health Logs Table
CREATE TABLE health_logs (
    id VARCHAR(50) PRIMARY KEY,
    cow_id VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    administered_by VARCHAR(100),
    cost NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. Expenses Table
CREATE TABLE expenses (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    farm_location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. Feed Products Table
CREATE TABLE feed_products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    unit VARCHAR(20) DEFAULT 'bag',
    weight_per_unit NUMERIC(10, 2) DEFAULT 30,
    unit_cost NUMERIC(15, 4) DEFAULT 0,
    cost_type VARCHAR(20) DEFAULT 'per_bag',
    cost_per_bag NUMERIC(15, 2) DEFAULT 0,
    min_threshold_bags NUMERIC(10, 2) DEFAULT 50,
    min_threshold_kg NUMERIC(10, 2) DEFAULT 1500,
    description TEXT,
    supplier VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. Feed Transactions Table
CREATE TABLE feed_transactions (
    id VARCHAR(50) PRIMARY KEY,
    feed_product_id VARCHAR(50) REFERENCES feed_products(id) ON DELETE SET NULL,
    batch_id VARCHAR(50) REFERENCES batches(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL,
    quantity_bags NUMERIC(10, 2) DEFAULT 0,
    quantity_kg NUMERIC(10, 2) DEFAULT 0,
    unit_cost NUMERIC(15, 4) DEFAULT 0,
    total_cost NUMERIC(15, 2) DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sires_breed ON sires(breed);
CREATE INDEX IF NOT EXISTS idx_sires_status ON sires(status);
CREATE INDEX IF NOT EXISTS idx_insemination_sire ON stock_insemination(sire_id);
CREATE INDEX IF NOT EXISTS idx_dams_availability ON dams(availability);
CREATE INDEX IF NOT EXISTS idx_breeding_programs_status ON breeding_programs(status);
CREATE INDEX IF NOT EXISTS idx_breeding_programs_dam ON breeding_programs(dam_id);
CREATE INDEX IF NOT EXISTS idx_breeding_programs_sire ON breeding_programs(sire_id);
CREATE INDEX IF NOT EXISTS idx_calves_sire ON calves(sire_id);
CREATE INDEX IF NOT EXISTS idx_calves_dam ON calves(dam_id);
CREATE INDEX IF NOT EXISTS idx_herdbook_reg_number ON herdbook_registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_herdbook_token ON herdbook_registrations(public_token);
CREATE INDEX IF NOT EXISTS idx_certificates_reg ON certificates(registration_id);
