import { query } from './src/config/database';
import { herdbookRepository } from './src/repositories/herdbook.repository';

async function runDeepAudit() {
  console.log('=================================================================');
  console.log('🔍 DEEP TECHNICAL AUDIT: KAKSEDTHAN HERDBOOK MANAGEMENT SYSTEM');
  console.log('=================================================================\n');

  // 1. Database Connection & Environment Audit
  console.log('--- 1. DATABASE CONNECTION AUDIT ---');
  try {
    const dbInfo = await query(`
      SELECT current_database(), current_user, inet_server_addr(), inet_server_port(), version()
    `);
    console.log('✅ PostgreSQL Connection Successful:');
    console.log(`   Database: ${dbInfo.rows[0].current_database}`);
    console.log(`   User: ${dbInfo.rows[0].current_user}`);
    console.log(`   Host Address: ${dbInfo.rows[0].inet_server_addr || 'localhost'}`);
    console.log(`   Port: ${dbInfo.rows[0].inet_server_port || 5433}`);
  } catch (err: any) {
    console.error('❌ DB Connection Error:', err.message);
  }

  // 2. Database Schema & Table Inventory Audit
  console.log('\n--- 2. DATABASE TABLE INVENTORY & RECORD COUNTS ---');
  const tables = [
    'users', 'user_levels', 'user_level_roles', 'user_level_modules',
    'breeders', 'farms', 'customers', 'sires', 'dams', 'calves',
    'breeding_programs', 'stock_insemination', 'herdbook_registrations',
    'certificates', 'pedigrees', 'audit_logs'
  ];

  const counts: Record<string, number> = {};
  for (const t of tables) {
    try {
      const res = await query(`SELECT COUNT(*) FROM ${t}`);
      counts[t] = parseInt(res.rows[0].count, 10);
      console.log(`   Table \`${t.padEnd(24, ' ')}\`: ${counts[t]} rows`);
    } catch (err: any) {
      console.log(`   Table \`${t.padEnd(24, ' ')}\`: ERROR (${err.message})`);
    }
  }

  // 3. User Accounts vs Customer Login Separation Audit
  console.log('\n--- 3. USER ACCOUNT & CUSTOMER LOGIN AUDIT ---');
  const totalUsers = counts['users'] || 0;
  const totalBreeders = counts['breeders'] || 0;
  const totalFarms = counts['farms'] || 0;
  const totalCustomers = counts['customers'] || 0;

  const customerUsers = await query(`SELECT COUNT(*) FROM users WHERE email ILIKE '%customer%' OR role ILIKE '%customer%' OR user_type ILIKE '%customer%'`);
  const custUserCount = parseInt(customerUsers.rows[0].count, 10);

  console.log(`   Total Users in \`users\` table: ${totalUsers}`);
  console.log(`   Breeder User Profiles: ${totalBreeders}`);
  console.log(`   Farm Station Profiles: ${totalFarms}`);
  console.log(`   Customer Business Records: ${totalCustomers}`);
  console.log(`   Customer User Accounts in \`users\` table: ${custUserCount}`);
  if (custUserCount === 0) {
    console.log('   ✅ CONFIRMED: 0 Customer login accounts exist. Customers are strictly business records!');
  } else {
    console.error('   ❌ WARNING: Customer user accounts found in users table!');
  }

  // 4. Data Scoping & Relationship Audit
  console.log('\n--- 4. DATA SCOPING & FK RELATIONSHIP AUDIT ---');
  const orphanCalves = await query(`
    SELECT COUNT(*) FROM calves c
    LEFT JOIN sires s ON c.sire_id = s.id
    LEFT JOIN dams d ON c.dam_id = d.id
    WHERE (c.sire_id IS NOT NULL AND s.id IS NULL) OR (c.dam_id IS NOT NULL AND d.id IS NULL)
  `);
  console.log(`   Orphan Calves with missing Sire/Dam FK: ${orphanCalves.rows[0].count}`);

  const orphanCertificates = await query(`
    SELECT COUNT(*) FROM certificates c
    LEFT JOIN herdbook_registrations hr ON c.registration_id = hr.id
    WHERE hr.id IS NULL
  `);
  console.log(`   Orphan Certificates with missing Herdbook Registration FK: ${orphanCertificates.rows[0].count}`);

  // 5. Repository Functionality & CRUD Audit
  console.log('\n--- 5. REPOSITORY METHOD AUDIT ---');
  try {
    const sires = await herdbookRepository.getSires();
    console.log(`   getSires(): ${sires.length} items fetched`);

    const dams = await herdbookRepository.getDams();
    console.log(`   getDams(): ${dams.length} items fetched`);

    const calves = await herdbookRepository.getCalves();
    console.log(`   getCalves(): ${calves.length} items fetched`);

    const farms = await herdbookRepository.getFarms();
    console.log(`   getFarms(): ${farms.length} items fetched`);

    const breeders = await herdbookRepository.getBreeders();
    console.log(`   getBreeders(): ${breeders.length} items fetched`);

    const customers = await herdbookRepository.getCustomers();
    console.log(`   getCustomers(): ${customers.length} items fetched`);

    const certs = await herdbookRepository.getCertificates();
    console.log(`   getCertificates(): ${certs.length} items fetched`);
  } catch (err: any) {
    console.error('   ❌ Repository Fetch Error:', err.message);
  }

  // 6. Approval Workflow & Audit Log Integrity
  console.log('\n--- 6. APPROVAL WORKFLOW & AUDIT LOG INTEGRITY AUDIT ---');
  const pendingCerts = await query(`SELECT COUNT(*) FROM certificates WHERE status = 'PENDING_APPROVAL'`);
  const approvedCerts = await query(`SELECT COUNT(*) FROM certificates WHERE status = 'APPROVED'`);
  const rejectedCerts = await query(`SELECT COUNT(*) FROM certificates WHERE status = 'REJECTED'`);
  const totalAuditLogs = await query(`SELECT COUNT(*) FROM audit_logs`);

  console.log(`   Pending Certificates: ${pendingCerts.rows[0].count}`);
  console.log(`   Approved Certificates: ${approvedCerts.rows[0].count}`);
  console.log(`   Rejected Certificates: ${rejectedCerts.rows[0].count}`);
  console.log(`   Total Audit Logs in \`audit_logs\`: ${totalAuditLogs.rows[0].count}`);

  console.log('\n=================================================================');
  console.log('✅ AUDIT COMPLETE. GENERATING AUDIT REPORT...');
  console.log('=================================================================\n');
}

runDeepAudit()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Audit Script Error:', err);
    process.exit(1);
  });
