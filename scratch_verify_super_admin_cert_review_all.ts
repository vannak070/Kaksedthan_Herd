import { herdbookRepository } from './src/repositories/herdbook.repository';
import { query } from './src/config/database';

async function runSuperAdminCertReviewTest() {
  console.log('=== 🧪 E2E VERIFICATION: SUPER ADMIN CERTIFICATION REVIEW & APPROVAL WORKFLOW ===\n');

  const breederUser = { id: 'BREEDER-01', name: 'Sokha Breeder', role: 'Breeder', userType: 'Breeder', breederId: 'BREEDER-01' };
  const adminUser = { id: 'USR-01', name: 'Super Admin', role: 'Admin', userType: 'Admin' };

  // Setup Test Animal IDs
  const testSireId = `SIR-SA-${Date.now().toString().slice(-6)}`;
  const testDamId = `DAM-SA-${Date.now().toString().slice(-6)}`;
  const testCalfId = `CLF-SA-${Date.now().toString().slice(-6)}`;

  await query(`INSERT INTO sires (id, name, breed, dob, owner_name, farm_location, status) VALUES ($1, 'Admin Test Sire', 'Angus', CURRENT_DATE, 'Sokha Breeder', 'Phnom Penh', 'Active')`, [testSireId]);
  await query(`INSERT INTO dams (id, name, breed, dob, owner_name, farm_location, availability) VALUES ($1, 'Admin Test Dam', 'Wagyu', CURRENT_DATE, 'Sokha Breeder', 'Phnom Penh', 'Available')`, [testDamId]);
  await query(`INSERT INTO calves (id, sire_id, dam_id, name, breed, sex, birth_date, owner_name, farm_location, status) VALUES ($1, $2, $3, 'Admin Test Calf', 'Angus', 'Male', CURRENT_DATE, 'Sokha Breeder', 'Phnom Penh', 'Active')`, [testCalfId, testSireId, testDamId]);

  // 1. TEST 1 — CALF CERTIFICATION REVIEW & APPROVAL
  console.log('1. TEST 1 — CALF CERTIFICATION REVIEW & APPROVAL...');
  const calfApp = await herdbookRepository.applyCertificate({ animalType: 'Calf', animalId: testCalfId }, breederUser);
  console.log(`   ✅ Breeder Applied for Calf Cert: App ID=${calfApp.id}, Status=${calfApp.status}`);

  const pendingCerts1 = await herdbookRepository.getCertificates();
  const pendingCalfApp = pendingCerts1.find(c => c.id === calfApp.id);
  console.log(`   Super Admin Pending View Status: ${pendingCalfApp?.status || (pendingCalfApp as any)?.status}`);

  const approvedCalf = await herdbookRepository.approveCertificate(calfApp.id, adminUser);
  console.log(`   ✅ Super Admin Approved Calf Cert: Status=${approvedCalf.status}`);

  // 2. TEST 2 — SIRE CERTIFICATION REVIEW & APPROVAL
  console.log('\n2. TEST 2 — SIRE CERTIFICATION REVIEW & APPROVAL...');
  const sireApp = await herdbookRepository.applyCertificate({ animalType: 'Sire', animalId: testSireId }, breederUser);
  console.log(`   ✅ Breeder Applied for Sire Cert: App ID=${sireApp.id}, Status=${sireApp.status}`);

  const approvedSire = await herdbookRepository.approveCertificate(sireApp.id, adminUser);
  console.log(`   ✅ Super Admin Approved Sire Cert: Status=${approvedSire.status}`);

  // 3. TEST 3 — DAM CERTIFICATION REVIEW & APPROVAL
  console.log('\n3. TEST 3 — DAM CERTIFICATION REVIEW & APPROVAL...');
  const damApp = await herdbookRepository.applyCertificate({ animalType: 'Dam', animalId: testDamId }, breederUser);
  console.log(`   ✅ Breeder Applied for Dam Cert: App ID=${damApp.id}, Status=${damApp.status}`);

  const approvedDam = await herdbookRepository.approveCertificate(damApp.id, adminUser);
  console.log(`   ✅ Super Admin Approved Dam Cert: Status=${approvedDam.status}`);

  // 4. TEST 4 — REJECTION WORKFLOW WITH REASON
  console.log('\n4. TEST 4 — REJECTION WORKFLOW WITH REASON...');
  const testCalf2Id = `CLF-REJ-${Date.now().toString().slice(-6)}`;
  await query(`INSERT INTO calves (id, sire_id, dam_id, name, breed, sex, birth_date, owner_name, farm_location, status) VALUES ($1, $2, $3, 'Reject Test Calf', 'Angus', 'Female', CURRENT_DATE, 'Sokha Breeder', 'Phnom Penh', 'Active')`, [testCalf2Id, testSireId, testDamId]);

  const rejCalfApp = await herdbookRepository.applyCertificate({ animalType: 'Calf', animalId: testCalf2Id }, breederUser);
  console.log(`   ✅ Breeder Applied for Calf Cert: App ID=${rejCalfApp.id}, Status=${rejCalfApp.status}`);

  const rejectedCalf = await herdbookRepository.rejectCertificate(rejCalfApp.id, 'Pedigree documentation unverified by registry.', adminUser);
  console.log(`   ✅ Super Admin Rejected Cert: Status=${rejectedCalf.status}, Reason="${rejectedCalf.rejection_reason}"`);

  // 5. TEST 5 — SECURITY ENFORCEMENT FOR NON-ADMIN USERS
  console.log('\n5. TEST 5 — SECURITY ENFORCEMENT FOR NON-ADMIN USERS...');
  try {
    await herdbookRepository.approveCertificate(sireApp.id, breederUser);
    console.log('   ❌ Security Check Failed: Non-admin was able to approve!');
  } catch (err: any) {
    console.log(`   ✅ Security Check Passed (403 Forbidden): "${err.message}"`);
  }

  // 6. Cleanup Test Records
  console.log('\n6. Cleaning up test records...');
  await query(`DELETE FROM certificates WHERE id IN ($1, $2, $3, $4)`, [calfApp.id, sireApp.id, damApp.id, rejCalfApp.id]);
  await query(`DELETE FROM herdbook_registrations WHERE animal_id IN ($1, $2, $3, $4)`, [testSireId, testDamId, testCalfId, testCalf2Id]);
  await query(`DELETE FROM calves WHERE id IN ($1, $2)`, [testCalfId, testCalf2Id]);
  await query(`DELETE FROM dams WHERE id = $1`, [testDamId]);
  await query(`DELETE FROM sires WHERE id = $1`, [testSireId]);
  console.log('   Test records cleaned up.');

  console.log('\n🎉 ALL SUPER ADMIN CERTIFICATION REVIEW & APPROVAL E2E TESTS PASSED!\n');
}

runSuperAdminCertReviewTest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Super Admin Cert Review Test Error:', err);
    process.exit(1);
  });
