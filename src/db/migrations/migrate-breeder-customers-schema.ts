import { query } from '../../config/database';

export async function migrateBreederCustomersSchema() {
  console.log('=== 🧬 MIGRATING BREEDER CUSTOMERS SCHEMA & DATA ===\n');

  try {
    // 1. Create dedicated `customers` table
    console.log('[1/5] Creating `customers` table in PostgreSQL...');
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(50),
          email VARCHAR(100),
          address VARCHAR(255),
          farm_location VARCHAR(100),
          national_id VARCHAR(50),
          id_front_url TEXT,
          id_back_url TEXT,
          id_verification_status VARCHAR(30) DEFAULT 'Pending',
          customer_type VARCHAR(50) DEFAULT 'Individual Owner',
          notes TEXT,
          status VARCHAR(20) DEFAULT 'Active',
          managed_by_breeder_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table `customers` ready.');

    // 2. Create performance indexes
    console.log('[2/5] Creating indexes for breeder data isolation...');
    await query(`CREATE INDEX IF NOT EXISTS idx_customers_breeder ON customers(managed_by_breeder_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);`);
    console.log('✅ Indexes created.');

    // 3. Migrate existing customer records from `users` table into `customers` table
    console.log('[3/5] Migrating existing customer records from `users` table...');
    const existingUsers = await query(`
      SELECT id, name, email, phone, farm_location, national_id, id_front_url, id_back_url, id_verification_status, created_at
      FROM users
      WHERE role ILIKE '%Customer%' OR user_level ILIKE '%Customer%' OR user_level_id = 'LEVEL-04' OR user_level_id = 'LEVEL-03'
    `);

    // Default breeder assignments for seed/existing customers
    const defaultBreeders = ['BREEDER-01', 'BREEDER-02', 'BREEDER-03', 'USR-03'];

    let count = 0;
    for (const [index, u] of existingUsers.rows.entries()) {
      const assignedBreederId = defaultBreeders[index % defaultBreeders.length];
      const customId = u.id.startsWith('CUST') ? u.id : `CUST-${u.id.replace(/[^0-9]/g, '') || String(index + 1).padStart(3, '0')}`;

      await query(`
        INSERT INTO customers (
          id, name, phone, email, address, farm_location, national_id, id_front_url, id_back_url,
          id_verification_status, customer_type, status, managed_by_breeder_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          phone = COALESCE(EXCLUDED.phone, customers.phone),
          email = COALESCE(EXCLUDED.email, customers.email),
          address = COALESCE(EXCLUDED.address, customers.address),
          farm_location = COALESCE(EXCLUDED.farm_location, customers.farm_location),
          managed_by_breeder_id = COALESCE(customers.managed_by_breeder_id, EXCLUDED.managed_by_breeder_id),
          updated_at = CURRENT_TIMESTAMP;
      `, [
        customId,
        u.name,
        u.phone || '012 ' + Math.floor(100000 + Math.random() * 900000),
        u.email,
        u.farm_location || 'Phnom Penh',
        u.farm_location || 'Phnom Penh',
        u.national_id || '010' + Math.floor(100000 + Math.random() * 900000),
        u.id_front_url || null,
        u.id_back_url || null,
        u.id_verification_status || 'Verified',
        'Individual Owner',
        'Active',
        assignedBreederId,
        u.created_at || new Date()
      ]);
      count++;
    }
    console.log(`✅ Migrated ${count} existing customers to ` + '`customers` table.');

    // 4. Ensure additional standard sample customers exist for testing breeder access control
    console.log('[4/5] Seeding standard breeder customer test records...');
    const seedCustomers = [
      { id: 'CUST-101', name: 'Sophea Nhek', phone: '012 889 123', email: 'sophea.nhek@gmail.com', address: 'Chrouy Changvar, Phnom Penh', breederId: 'BREEDER-01', status: 'Active', type: 'Individual Owner' },
      { id: 'CUST-102', name: 'Piseth Mak', phone: '015 776 234', email: 'piseth.mak@gmail.com', address: 'Kandal Province', breederId: 'BREEDER-01', status: 'Active', type: 'Farm Partner' },
      { id: 'CUST-103', name: 'Sreyneang Pich', phone: '097 554 345', email: 'sreyneang.pich@gmail.com', address: 'Takeo Province', breederId: 'BREEDER-02', status: 'Active', type: 'Individual Owner' },
      { id: 'CUST-104', name: 'Kiri Seng', phone: '088 332 456', email: 'kiri.seng@gmail.com', address: 'Kampong Cham', breederId: 'BREEDER-02', status: 'Active', type: 'Commercial Breeder' },
      { id: 'CUST-105', name: 'Chan Dara', phone: '011 443 567', email: 'chan.dara@gmail.com', address: 'Battambang', breederId: 'BREEDER-03', status: 'Active', type: 'Individual Owner' },
      { id: 'CUST-106', name: 'Bona Van', phone: '077 221 678', email: 'bona.van@gmail.com', address: 'Siem Reap', breederId: 'USR-03', status: 'Active', type: 'Farm Partner' },
    ];

    for (const sc of seedCustomers) {
      await query(`
        INSERT INTO customers (
          id, name, phone, email, address, farm_location, customer_type, status, managed_by_breeder_id
        ) VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          address = EXCLUDED.address,
          customer_type = EXCLUDED.customer_type,
          managed_by_breeder_id = EXCLUDED.managed_by_breeder_id;
      `, [sc.id, sc.name, sc.phone, sc.email, sc.address, sc.type, sc.status, sc.breederId]);
    }
    console.log('✅ Standard test customers seeded.');

    // 5. Clean up customer user accounts from `users` table so customers cannot attempt to log in
    console.log('[5/5] Removing customer login entries from `users` authentication table...');
    await query(`
      DELETE FROM users
      WHERE role ILIKE '%Customer%' OR user_level ILIKE '%Customer%' OR user_level_id = 'LEVEL-04' OR user_level_id = 'LEVEL-03';
    `);
    console.log('✅ Customer login accounts removed from `users` table.');

    console.log('\n🎉 BREEDER CUSTOMER SCHEMA & DATA MIGRATION COMPLETE!\n');
    return { success: true };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Execute if called directly
if (require.main === module) {
  migrateBreederCustomersSchema()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
