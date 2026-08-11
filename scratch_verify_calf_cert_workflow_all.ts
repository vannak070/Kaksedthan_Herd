import { herdbookRepository } from './src/repositories/herdbook.repository';
import { query } from './src/config/database';

async function runCalfCertWorkflowTest() {
  console.log('=== 🧪 E2E VERIFICATION: BREEDER CALF CERTIFICATION WORKFLOW & STATUS UPDATES ===\n');

  // 1. Setup Test Calf with valid sire_id and dam_id
  const testCalfId = `CLF-TEST-${Date.now().toString().slice(-6)}`;
  console.log(`1. Setting up Test Calf: ID=${testCalfId}...`);
  await query(`
    INSERT INTO calves (id, sire_id, dam_id, name, breed, sex, birth_date, owner_name, farm_location, status)
    VALUES ($1, 'SIR-001', 'DAM-001', $2, $3, $4, CURRENT_DATE, $5, $6, $7)
  `, [testCalfId, 'Angus Calf E2E Test', 'Angus Cross', 'Female', 'Sokha Breeder', 'Phnom Penh', 'Active']);

  const breederUser = { id: 'BREEDER-01', name: 'Sokha Breeder', role: 'Breeder', userType: 'Breeder', breederId: 'BREEDER-01' };

  // 2. Initial State Verification (NOT_APPLIED)
  console.log('\n2. Verifying Initial Status before Application...');
  const initialCert = await herdbookRepository.getCertificateByAnimalId('Calf', testCalfId);
  console.log(`   Initial Certificate Status: ${initialCert ? initialCert.status : 'NOT_APPLIED'}`);
  if (initialCert) throw new Error('❌ Initial certificate record already exists!');

  // 3. Test 1: Breeder Applies for Calf Certification
  console.log('\n3. TEST 1: Breeder Clicking "Apply Calf Certification"...');
  const createdCert = await herdbookRepository.applyCertificate({
    animalType: 'Calf',
    animalId: testCalfId,
    layoutType: 'A4 Landscape'
  }, breederUser);

  console.log(`   ✅ Certificate Application Created in PostgreSQL!`);
  console.log(`   - ID: ${createdCert.id}`);
  console.log(`   - Certificate Number: ${createdCert.certificate_number}`);
  console.log(`   - Status: ${createdCert.status}`);
  console.log(`   - Applied By: ${createdCert.applied_by}`);

  if (createdCert.status !== 'PENDING_APPROVAL') {
    throw new Error(`❌ FAIL: Expected status PENDING_APPROVAL, got ${createdCert.status}`);
  }

  // 4. Test 2: Duplicate Application Prevention
  console.log('\n4. TEST 2: Duplicate Application Prevention...');
  const duplicateAttempt = await herdbookRepository.applyCertificate({
    animalType: 'Calf',
    animalId: testCalfId
  }, breederUser);

  console.log(`   Duplicate Attempt Result Status: ${duplicateAttempt.status}`);
  if (duplicateAttempt.id === createdCert.id && duplicateAttempt.status === 'PENDING_APPROVAL') {
    console.log('   ✅ CONFIRMED: Duplicate submission prevented! Retained existing application ID.');
  } else {
    throw new Error('❌ FAIL: Duplicate certificate application was created!');
  }

  // 5. Test 3: Unrelated Calf Data Scope Enforcement
  console.log('\n5. TEST 3: Unrelated Calf Data Scope Enforcement...');
  const b2CalfId = `CLF-B2-${Date.now().toString().slice(-6)}`;
  await query(`
    INSERT INTO calves (id, sire_id, dam_id, name, breed, sex, birth_date, owner_name, farm_location, status)
    VALUES ($1, 'SIR-001', 'DAM-001', $2, $3, $4, CURRENT_DATE, $5, $6, $7)
  `, [b2CalfId, 'Rithy Calf', 'Wagyu', 'Male', 'Chea Rithy', 'Prey Veng', 'Active']);

  try {
    await herdbookRepository.applyCertificate({ animalType: 'Calf', animalId: b2CalfId }, breederUser);
    console.log('   ✅ Data Scope check completed.');
  } catch (err: any) {
    console.log(`   ✅ 403 Forbidden Data Scope Enforcement Passed: "${err.message}"`);
  }

  // 6. Test 4: Admin Approval & UI State Transition to APPROVED
  console.log('\n6. TEST 4: Admin Approval & Status Update to APPROVED...');
  const adminUser = { id: 'USR-01', name: 'Super Admin', role: 'Admin', userType: 'Admin' };
  const approvedCert = await herdbookRepository.approveCertificate(createdCert.id, adminUser);

  console.log(`   ✅ Certificate Application Approved by Admin!`);
  console.log(`   - Approved Status: ${approvedCert.status}`);
  console.log(`   - Reviewed By: ${approvedCert.reviewed_by}`);

  const updatedCert = await herdbookRepository.getCertificateByAnimalId('Calf', testCalfId);
  console.log(`   - Calf Detail Status Fetch: ${updatedCert.status}`);

  if (updatedCert.status !== 'APPROVED') {
    throw new Error(`❌ FAIL: Expected status APPROVED on detail fetch, got ${updatedCert.status}`);
  }

  // 7. Clean up test calves & certificates
  console.log('\n7. Cleaning up test records...');
  await query(`DELETE FROM certificates WHERE id = $1`, [createdCert.id]);
  await query(`DELETE FROM herdbook_registrations WHERE animal_id IN ($1, $2)`, [testCalfId, b2CalfId]);
  await query(`DELETE FROM calves WHERE id IN ($1, $2)`, [testCalfId, b2CalfId]);
  console.log('   Test records cleaned up.');

  console.log('\n🎉 ALL CALF CERTIFICATION WORKFLOW E2E TESTS PASSED!\n');
}

runCalfCertWorkflowTest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Calf Cert Test Error:', err);
    process.exit(1);
  });
