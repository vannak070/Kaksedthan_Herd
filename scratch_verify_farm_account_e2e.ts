import { herdbookRepository } from './src/repositories/herdbook.repository';
import { query } from './src/config/database';

async function runE2ETest() {
  console.log('=== 🧪 E2E VERIFICATION: FARM STATION LOGIN ACCOUNT & 4-SECTION FORM ===\n');

  const testEmail = `greenvalley_${Date.now()}@snrfarm.com`;

  // 1. Create Farm Station with Login Account
  console.log('1. Creating Farm Station with Section 4 Login Account enabled...');
  const newFarm = await herdbookRepository.createFarm({
    name: 'Green Valley Station E2E',
    code: 'GV_E2E_' + Date.now().toString().slice(-4),
    farmType: 'Breeding Station',
    ownerName: 'Sokha Green Valley Owner',
    ownerPhone: '012 887 990',
    ownerEmail: 'sokha@greenvalley.com',
    ownerNationalId: '010998822',
    address: 'National Road 1, Neak Loeung',
    province: 'Prey Veng',
    district: 'Peam Ro',
    commune: 'Neak Loeung',
    village: 'Village 1',
    phone: '012 334 556',
    email: 'info@greenvalley.com',
    capacity: 350,
    notes: 'Primary E2E test breeding station with login account',
    createAccount: true,
    accountEmail: testEmail,
    accountPassword: 'farmPassword123!',
    accountStatus: 'Active',
    userLevel: 'Farm Owner Account'
  });

  console.log(`   ✅ Farm Station Created: ID=${newFarm.id}, Name="${newFarm.name}", Code=${newFarm.code}`);
  console.log(`   User ID Linked: ${newFarm.userId}`);
  console.log(`   Login Email: ${newFarm.accountEmail}`);
  console.log(`   User Level: ${newFarm.userLevel}`);

  if (!newFarm.userId || newFarm.accountEmail !== testEmail) {
    console.error('❌ ERROR: User Account was not linked properly to Farm Station.');
    process.exit(1);
  }

  // 2. Inspect database `users` table directly
  console.log('\n2. Verifying PostgreSQL `users` table record...');
  const userCheckRes = await query(`SELECT id, email, role, user_level, farm_id, status FROM users WHERE id = $1`, [newFarm.userId]);
  if (userCheckRes.rows.length === 0) {
    console.error('❌ ERROR: User record missing from PostgreSQL `users` table.');
    process.exit(1);
  }

  const uRow = userCheckRes.rows[0];
  console.log(`   User Row: ID=${uRow.id}, Email=${uRow.email}, Role=${uRow.role}, Level=${uRow.user_level}, FarmID=${uRow.farm_id}, Status=${uRow.status}`);

  if (uRow.farm_id !== newFarm.id) {
    console.error('❌ ERROR: User farm_id does not match created Farm Station ID.');
    process.exit(1);
  }

  // 3. Test Account Status Toggle
  console.log('\n3. Testing Account Status Toggle (Active -> Inactive -> Active)...');
  await herdbookRepository.toggleFarmAccountStatus(newFarm.id, 'Inactive');
  const inactiveCheck = await herdbookRepository.getFarmById(newFarm.id);
  console.log(`   Status after toggle to Inactive: AccountStatus="${inactiveCheck.accountStatus}"`);

  await herdbookRepository.toggleFarmAccountStatus(newFarm.id, 'Active');
  const activeCheck = await herdbookRepository.getFarmById(newFarm.id);
  console.log(`   Status after toggle back to Active: AccountStatus="${activeCheck.accountStatus}"`);

  // 4. Test Duplicate Email Protection
  console.log('\n4. Testing Duplicate Email Validation...');
  try {
    await herdbookRepository.createFarm({
      name: 'Duplicate Email Farm',
      createAccount: true,
      accountEmail: testEmail,
      accountPassword: 'password123'
    });
    console.error('❌ ERROR: Duplicate email allowed!');
    process.exit(1);
  } catch (err: any) {
    console.log(`   ✅ Duplicate email rejected cleanly with error: "${err.message}"`);
  }

  // 5. Clean up test records
  console.log('\n5. Cleaning up test records...');
  await herdbookRepository.deleteFarm(newFarm.id);
  await query(`DELETE FROM users WHERE id = $1`, [newFarm.userId]);
  console.log('   Test records cleaned up.');

  console.log('\n🎉 ALL FARM STATION LOGIN ACCOUNT & 4-SECTION FORM E2E TESTS PASSED!\n');
}

runE2ETest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('E2E Test Error:', err);
    process.exit(1);
  });
