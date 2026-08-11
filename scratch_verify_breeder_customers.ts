import { herdbookRepository } from './src/repositories/herdbook.repository';

async function verifyBreederCustomerIsolation() {
  console.log('=== 🧪 VERIFYING BREEDER CUSTOMER MANAGEMENT & DATA ISOLATION ===\n');

  // 1. Fetch Customers for Breeder A (BREEDER-01)
  console.log('1. Testing Breeder A (BREEDER-01) customer list...');
  const breederACustomers = await herdbookRepository.getCustomers('BREEDER-01');
  console.log(`   Found ${breederACustomers.length} customers for BREEDER-01:`, breederACustomers.map(c => `${c.id} (${c.name})`));

  const containsBreederBCustomer = breederACustomers.some(c => c.id === 'CUST-103' || c.id === 'CUST-104');
  if (containsBreederBCustomer) {
    console.error('❌ SECURITY FAILURE: Breeder A can see Breeder B customers!');
    process.exit(1);
  } else {
    console.log('   ✅ Breeder A ONLY sees Breeder A customers.');
  }

  // 2. Fetch Customers for Breeder B (BREEDER-02)
  console.log('\n2. Testing Breeder B (BREEDER-02) customer list...');
  const breederBCustomers = await herdbookRepository.getCustomers('BREEDER-02');
  console.log(`   Found ${breederBCustomers.length} customers for BREEDER-02:`, breederBCustomers.map(c => `${c.id} (${c.name})`));

  const containsBreederACustomer = breederBCustomers.some(c => c.id === 'CUST-101' || c.id === 'CUST-102');
  if (containsBreederACustomer) {
    console.error('❌ SECURITY FAILURE: Breeder B can see Breeder A customers!');
    process.exit(1);
  } else {
    console.log('   ✅ Breeder B ONLY sees Breeder B customers.');
  }

  // 3. Test Direct API Access Protection (403 Forbidden check)
  console.log('\n3. Testing Direct API Access Protection...');
  console.log('   Attempting Breeder A access to Breeder B Customer CUST-103...');
  const unauthorizedFetch = await herdbookRepository.getCustomerById('CUST-103', 'BREEDER-01');
  if (unauthorizedFetch === null) {
    console.log('   ✅ Access DENIED (returns null / 403 Forbidden) as expected!');
  } else {
    console.error('❌ SECURITY FAILURE: Breeder A accessed Customer CUST-103 belonging to Breeder B!');
    process.exit(1);
  }

  console.log('   Attempting Breeder B access to Breeder B Customer CUST-103...');
  const authorizedFetch = await herdbookRepository.getCustomerById('CUST-103', 'BREEDER-02');
  if (authorizedFetch && authorizedFetch.id === 'CUST-103') {
    console.log(`   ✅ Access GRANTED to owner breeder: ${authorizedFetch.name}`);
  } else {
    console.error('❌ ERROR: Authorized breeder failed to access customer.');
    process.exit(1);
  }

  // 4. Test Customer Status Toggling
  console.log('\n4. Testing Customer Deactivation (Active -> Inactive)...');
  await herdbookRepository.setCustomerStatus('CUST-101', 'Inactive', 'BREEDER-01');
  const inactiveCust = await herdbookRepository.getCustomerById('CUST-101', 'BREEDER-01');
  console.log(`   Status updated to: ${inactiveCust.status}`);

  await herdbookRepository.setCustomerStatus('CUST-101', 'Active', 'BREEDER-01');
  const activeCust = await herdbookRepository.getCustomerById('CUST-101', 'BREEDER-01');
  console.log(`   Status restored to: ${activeCust.status}`);

  console.log('\n🎉 ALL BREEDER CUSTOMER DATA ISOLATION TESTS PASSED 100% CLEANLY!\n');
}

verifyBreederCustomerIsolation()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  });
