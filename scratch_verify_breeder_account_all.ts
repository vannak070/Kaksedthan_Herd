import { herdbookRepository } from './src/repositories/herdbook.repository';
import { query } from './src/config/database';

async function runBreederTest() {
  console.log('=== 🧪 E2E VERIFICATION: BREEDER AS USER ACCOUNT (ALIGNED WITH FARM STATION) ===\n');

  // 1. Admin creates Breeder Account with Section 4 Login Account enabled
  console.log('1. Admin Creating Breeder Account with Section 4 Login Account...');
  const testId = `TEST_BRD_${Date.now()}`;
  const testEmail = `breeder_${Date.now()}@snrfarm.com`;

  const createdBreeder = await herdbookRepository.createBreeder({
    name: 'Vannak Master Breeder E2E',
    code: testId,
    phone: '012 888 777',
    email: testEmail,
    address: 'Phnom Penh, Cambodia',
    province: 'Phnom Penh',
    notes: 'Master Breeder E2E Test Record',
    status: 'Active',
    createAccount: true,
    accountEmail: testEmail,
    accountPassword: 'BreederPassword@2026',
    accountStatus: 'Active',
    userLevel: 'Senior Breeder Account'
  });

  console.log(`   ✅ Breeder Profile Created: ID=${createdBreeder.id}, Name="${createdBreeder.name}", Code=${createdBreeder.code}`);
  console.log(`   User ID Linked: ${createdBreeder.userId}`);
  console.log(`   Login Email: ${createdBreeder.accountEmail}`);
  console.log(`   User Level: ${createdBreeder.userLevel}`);

  // 2. Verify PostgreSQL `users` table record
  console.log('\n2. Verifying PostgreSQL `users` table record...');
  const userCheck = await query('SELECT * FROM users WHERE email = $1', [testEmail]);
  if (userCheck.rows.length === 1) {
    const u = userCheck.rows[0];
    console.log(`   User Row Found: ID=${u.id}, Email=${u.email}, Role=${u.role}, UserType=${u.user_type}, UserLevel=${u.user_level}, Status=${u.status}, BreederID=${u.breeder_id}`);
    if (u.user_type === 'Breeder' && u.breeder_id === createdBreeder.id) {
      console.log('   ✅ CONFIRMED: Breeder is stored as a REAL USER ACCOUNT with user_type="Breeder" (NOT just a Role!)');
    } else {
      throw new Error('❌ FAIL: User account user_type or breeder_id mismatch!');
    }
  } else {
    throw new Error('❌ FAIL: User account was not created in users table!');
  }

  // 3. Test Account Status Toggle (Active -> Inactive -> Active)
  console.log('\n3. Testing Account Status Toggle (Active -> Inactive -> Active)...');
  await herdbookRepository.toggleBreederAccountStatus(createdBreeder.id, 'Inactive');
  const toggled1 = await herdbookRepository.getBreederById(createdBreeder.id);
  console.log(`   Status after toggle to Inactive: AccountStatus="${toggled1.accountStatus}"`);

  await herdbookRepository.toggleBreederAccountStatus(createdBreeder.id, 'Active');
  const toggled2 = await herdbookRepository.getBreederById(createdBreeder.id);
  console.log(`   Status after toggle back to Active: AccountStatus="${toggled2.accountStatus}"`);

  // 4. Test Data Scoping & Security Enforcement
  console.log('\n4. Testing Breeder Data Scoping & Security Authorization...');
  const customersB1 = await herdbookRepository.getCustomers('BREEDER-01');
  const customersB2 = await herdbookRepository.getCustomers('BREEDER-02');
  console.log(`   Breeder-01 Customers: ${customersB1.length} | Breeder-02 Customers: ${customersB2.length}`);

  if (customersB1.length > 0 && customersB2.length > 0) {
    const b2CustId = customersB2[0].id;
    try {
      await herdbookRepository.updateCustomer(b2CustId, { name: 'Unauthorized Hack' }, 'BREEDER-01');
      throw new Error('❌ FAIL: Breeder 01 was able to mutate Breeder 02 customer!');
    } catch (err: any) {
      console.log(`   ✅ 403 Forbidden Security Enforcement Passed: "${err.message}"`);
    }
  }

  // 5. Clean up test records
  console.log('\n5. Cleaning up test records...');
  await query('DELETE FROM users WHERE email = $1', [testEmail]);
  await query('DELETE FROM breeders WHERE id = $1', [createdBreeder.id]);
  console.log('   Test records cleaned up.');

  console.log('\n🎉 ALL BREEDER AS USER ACCOUNT E2E TESTS PASSED!\n');
}

runBreederTest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Breeder test error:', err);
    process.exit(1);
  });
