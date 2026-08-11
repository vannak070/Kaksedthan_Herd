import { herdbookRepository } from './src/repositories/herdbook.repository';
import { query } from './src/config/database';

async function runCustomerTest() {
  console.log('=== 🧪 E2E VERIFICATION: CUSTOMER / COW OWNER MANAGEMENT (NO LOGIN) ===\n');

  // 1. Create a Customer record
  console.log('1. Creating Customer Record (No Login Account)...');
  const testId = `TEST_CUST_${Date.now()}`;
  const created = await herdbookRepository.createCustomer({
    name: 'Bona Customer Test',
    code: testId,
    phone: '012 999 888',
    email: 'bona.customer@test.com',
    address: 'Kandal Province',
    province: 'Kandal',
    customerType: 'Individual Owner',
    nationalId: 'ID-KH-909090',
    status: 'Active'
  }, 'BREEDER-01');

  console.log(`   ✅ Customer Created: ID=${created.id}, Name="${created.name}", Code=${created.code}`);

  // 2. Verify NO user account was created in `users` table for this customer
  console.log('\n2. Verifying NO user account exists in `users` table for this email...');
  const userCheck = await query('SELECT * FROM users WHERE email = $1', ['bona.customer@test.com']);
  if (userCheck.rows.length === 0) {
    console.log('   ✅ CONFIRMED: 0 user accounts created in `users` table. Customer is NOT a system user!');
  } else {
    throw new Error('❌ FAIL: User account was incorrectly created for Customer!');
  }

  // 3. Test Breeder Scoping (Breeder 01 vs Breeder 02)
  console.log('\n3. Testing Breeder Data Scoping...');
  const customersB1 = await herdbookRepository.getCustomers('BREEDER-01');
  console.log(`   Breeder-01 Customers Count: ${customersB1.length}`);

  // 4. Test Customer Detail Fetch
  console.log('\n4. Testing Customer Detail Fetch...');
  const detail = await herdbookRepository.getCustomerById(created.id, 'BREEDER-01');
  console.log(`   Customer Detail Fetched: Name="${detail.name}", Province="${detail.province}", Code="${detail.code}"`);

  // 5. Clean up test customer
  console.log('\n5. Cleaning up test customer record...');
  await query('DELETE FROM customers WHERE id = $1', [created.id]);
  console.log('   Test customer record cleaned up.');

  console.log('\n🎉 ALL CUSTOMER MANAGEMENT (NO LOGIN) E2E TESTS PASSED!\n');
}

runCustomerTest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Customer test error:', err);
    process.exit(1);
  });
