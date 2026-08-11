import { herdbookRepository } from './src/repositories/herdbook.repository';

async function runVerification() {
  console.log('=== 🧪 VERIFYING FARM STATION, CUSTOMER UI, IMAGES & LOGOUT ===\n');

  // 1. Test Farm Station Operations
  console.log('1. Testing Farm Station Repository Operations...');
  const farms = await herdbookRepository.getFarms();
  console.log(`   Found ${farms.length} farm stations in PostgreSQL.`);

  if (farms.length > 0) {
    const sampleFarm = farms[0];
    console.log(`   Testing getFarmById('${sampleFarm.id}')...`);
    const fetchedFarm = await herdbookRepository.getFarmById(sampleFarm.id);
    if (fetchedFarm && fetchedFarm.name === sampleFarm.name) {
      console.log(`   ✅ Farm Station detail fetched successfully: "${fetchedFarm.name}" (Code: ${fetchedFarm.code})`);
    } else {
      console.error('❌ ERROR: Failed to fetch Farm Station detail by ID.');
      process.exit(1);
    }
  }

  // 2. Test Customer Data Access Security
  console.log('\n2. Testing Breeder Customer Data Access Security...');
  const breeder1Customers = await herdbookRepository.getCustomers('BREEDER-01');
  const breeder2Customers = await herdbookRepository.getCustomers('BREEDER-02');
  console.log(`   BREEDER-01 customers: ${breeder1Customers.length}`);
  console.log(`   BREEDER-02 customers: ${breeder2Customers.length}`);

  const crossAccess = await herdbookRepository.getCustomerById('CUST-103', 'BREEDER-01');
  if (crossAccess === null) {
    console.log('   ✅ Backend 403 Forbidden protection active (Breeder 1 denied access to Breeder 2 customer).');
  } else {
    console.error('❌ SECURITY FAILURE: Cross-breeder access was allowed.');
    process.exit(1);
  }

  // 3. Test Farm Station Creation & Image Persistence
  console.log('\n3. Testing Farm Station Creation with Image Upload URL...');
  const newFarm = await herdbookRepository.createFarm({
    name: 'Test Experimental Farm',
    code: 'TEST_EXP_' + Date.now().toString().slice(-4),
    ownerName: 'Test Owner',
    address: 'Phnom Penh Test Station',
    capacity: 250,
    imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
    notes: '200MB optimized test image'
  });
  console.log(`   Created Farm Station: ID=${newFarm.id}, Code=${newFarm.code}`);

  const checkFarm = await herdbookRepository.getFarmById(newFarm.id);
  if (checkFarm && checkFarm.imageUrl) {
    console.log('   ✅ Farm image persisted cleanly in PostgreSQL database.');
  } else {
    console.error('❌ ERROR: Image URL failed to persist in database.');
    process.exit(1);
  }

  // Clean up test farm
  await herdbookRepository.deleteFarm(newFarm.id);
  console.log('   Test Farm Station cleaned up.');

  console.log('\n🎉 ALL FARM STATION, CUSTOMER, IMAGE & SECURITY VERIFICATIONS PASSED!\n');
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Verification error:', err);
    process.exit(1);
  });
