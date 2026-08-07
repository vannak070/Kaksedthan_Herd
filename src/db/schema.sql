-- PostgreSQL Database DDL Schema for Livestock Management System
-- Database: livestock_db

-- Drop tables if exists (clean reset during migration)
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

-- 2. Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    password VARCHAR(255) NOT NULL,
    farm_location VARCHAR(100),
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Stock / Livestock Table
CREATE TABLE stock (
    id VARCHAR(50) PRIMARY KEY, -- Cow_ID
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

-- 4. Weight Tracking History Table
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

-- 5. Sales Tracking Table
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

-- 6. Batches Table
CREATE TABLE batches (
    id VARCHAR(50) PRIMARY KEY, -- Batch Code (e.g. BATCH-001)
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

-- 7. Batch Cows Junction Table
CREATE TABLE batch_cows (
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    cow_id VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
    PRIMARY KEY (batch_id, cow_id)
);

-- 8. Health Logs Table
CREATE TABLE health_logs (
    id VARCHAR(50) PRIMARY KEY, -- HL-xxxx
    cow_id VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- Vaccination | Treatment | Disease | Deworming
    name VARCHAR(100) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    administered_by VARCHAR(100),
    cost NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Expenses Table
CREATE TABLE expenses (
    id VARCHAR(50) PRIMARY KEY, -- EXP-xxxx
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    farm_location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Feed Products Table
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

-- 11. Feed Transactions Table
CREATE TABLE feed_transactions (
    id VARCHAR(50) PRIMARY KEY,
    feed_product_id VARCHAR(50) REFERENCES feed_products(id) ON DELETE SET NULL,
    batch_id VARCHAR(50) REFERENCES batches(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- IN | OUT
    quantity_bags NUMERIC(10, 2) DEFAULT 0,
    quantity_kg NUMERIC(10, 2) DEFAULT 0,
    unit_cost NUMERIC(15, 4) DEFAULT 0,
    total_cost NUMERIC(15, 2) DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Breeding Records Table
CREATE TABLE IF NOT EXISTS breeding_records (
    id VARCHAR(50) PRIMARY KEY, -- BRD-xxxx
    dam_id VARCHAR(50) NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
    sire_id VARCHAR(50),
    mating_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    breeding_type VARCHAR(20) DEFAULT 'AI', -- AI | Natural
    technician VARCHAR(100),
    pregnancy_status VARCHAR(30) DEFAULT 'Pending', -- Pending | Confirmed Pregnant | Open
    pregnancy_check_date TIMESTAMP WITH TIME ZONE,
    expected_calving_date TIMESTAMP WITH TIME ZONE,
    actual_calving_date TIMESTAMP WITH TIME ZONE,
    calf_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_stock_status ON stock(status);
CREATE INDEX IF NOT EXISTS idx_stock_health ON stock(health_status);
CREATE INDEX IF NOT EXISTS idx_weight_cow_id ON weight_tracking(cow_id);
CREATE INDEX IF NOT EXISTS idx_weight_tracking_date ON weight_tracking(tracking_date);
CREATE INDEX IF NOT EXISTS idx_sales_cow_id ON sales_tracking(cow_id);
CREATE INDEX IF NOT EXISTS idx_health_cow_id ON health_logs(cow_id);
CREATE INDEX IF NOT EXISTS idx_batch_cows_cow_id ON batch_cows(cow_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_breeding_dam_id ON breeding_records(dam_id);
CREATE INDEX IF NOT EXISTS idx_breeding_status ON breeding_records(pregnancy_status);
CREATE INDEX IF NOT EXISTS idx_breeding_calving ON breeding_records(expected_calving_date);


