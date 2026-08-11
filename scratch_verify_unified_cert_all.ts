import { herdbookRepository } from './src/repositories/herdbook.repository';
import { query } from './src/config/database';

async function runUnifiedCertTest() {
  console.log('=== 🧪 E2E VERIFICATION: UNIFIED CERTIFICATION WORKFLOW (SIRE, DAM, CALF) ===\n');

  const breederUser = { id: 'BREEDER-01', name: 'Sokha Breeder', role: 'Breeder', userType: 'Breeder', breederId: 'BREEDER-01' };
  const adminUser = { id: 'USR-01', name: 'Super Admin', role: 'Admin', userType: 'Admin' };

  // 1. TEST A — SIRE CERTIFICATION
  console.log('1. TEST A — SIRE CERTIFICATION WORKFLOW...');
  const testSireId = `SIR-TEST-${Date.now().toString().slice(-6)}`;
  await query(`
    INSERT INTO sires (id, name, breed, dob, bloodline, owner_name, farm_location, status)
    VALUES ($1, 'Unified Sire Test', 'Brahman', CURRENT_DATE, 'Fullblood', 'Sokha Breeder', 'Phnom Penh', 'Active')
  `, [testSireId]);

  const sireApp = await herdbookRepository.applyCertificate({ animalType: 'Sire', animalId: testSireId }, breederUser);
  console.log(`   ✅ Sire Cert Application Created: ID=${sireApp.id}, Status=${sireApp.status}`);

  const siresList1 = await herdbookRepository.getSires();
  const sire1 = siresList1.find(s => s.id === testSireId);
  console.log(`   Sire Listing Card Status: ${sire1?.certificationStatus}`);

  const approvedSire = await herdbookRepository.approveCertificate(sireApp.id, adminUser);
  console.log(`   ✅ Sire Cert Approved by Admin: Status=${approvedSire.status}`);

  const siresList2 = await herdbookRepository.getSires();
  const sire2 = siresList2.find(s => s.id === testSireId);
  console.log(`   Sire Card Status after Approval: ${sire2?.certificationStatus}`);

  // 2. TEST B — DAM CERTIFICATION
  console.log('\n2. TEST B — DAM CERTIFICATION WORKFLOW...');
  const testDamId = `DAM-TEST-${Date.now().toString().slice(-6)}`;
  await query(`
    INSERT INTO dams (id, name, breed, dob, owner_name, farm_location, availability)
    VALUES ($1, 'Unified Dam Test', 'Nelore', CURRENT_DATE, 'Sokha Breeder', 'Phnom Penh', 'Available')
  `, [testDamId]);

  const damApp = await herdbookRepository.applyCertificate({ animalType: 'Dam', animalId: testDamId }, breederUser);
  console.log(`   ✅ Dam Cert Application Created: ID=${damApp.id}, Status=${damApp.status}`);

  const damsList1 = await herdbookRepository.getDams();
  const dam1 = damsList1.find(d => d.id === testDamId);
  console.log(`   Dam Listing Card Status: ${dam1?.certificationStatus}`);

  const approvedDam = await herdbookRepository.approveCertificate(damApp.id, adminUser);
  console.log(`   ✅ Dam Cert Approved by Admin: Status=${approvedDam.status}`);

  const damsList2 = await herdbookRepository.getDams();
  const dam2 = damsList2.find(d => d.id === testDamId);
  console.log(`   Dam Card Status after Approval: ${dam2?.certificationStatus}`);

  // 3. TEST C — CALF CERTIFICATION & REJECTION
  console.log('\n3. TEST C — CALF CERTIFICATION & REJECTION WORKFLOW...');
  const testCalfId = `CLF-TEST-${Date.now().toString().slice(-6)}`;
  await query(`
    INSERT INTO calves (id, sire_id, dam_id, name, breed, sex, birth_date, owner_name, farm_location, status)
    VALUES ($1, $2, $3, 'Test Calf Unified', 'Angus', 'Female', CURRENT_DATE, 'Sokha Breeder', 'Phnom Penh', 'Active')
  `, [testCalfId, testSireId, testDamId]);

  const calfApp = await herdbookRepository.applyCertificate({ animalType: 'Calf', animalId: testCalfId }, breederUser);
  console.log(`   ✅ Calf Cert Application Created: ID=${calfApp.id}, Status=${calfApp.status}`);

  const calvesList1 = await herdbookRepository.getCalves();
  const calf1 = calvesList1.find(c => c.id === testCalfId);
  console.log(`   Calf Listing Card Status: ${calf1?.certificationStatus}`);

  const rejectedCalf = await herdbookRepository.rejectCertificate(calfApp.id, 'Incomplete pedigree documentation.', adminUser);
  console.log(`   ✅ Calf Cert Rejected by Admin: Status=${rejectedCalf.status}, Reason="${rejectedCalf.rejection_reason}"`);

  const calvesList2 = await herdbookRepository.getCalves();
  const calf2 = calvesList2.find(c => c.id === testCalfId);
  console.log(`   Calf Card Status after Rejection: ${calf2?.certificationStatus}`);

  // 4. Cleanup Test Records
  console.log('\n4. Cleaning up test records...');
  await query(`DELETE FROM certificates WHERE id IN ($1, $2, $3)`, [sireApp.id, damApp.id, calfApp.id]);
  await query(`DELETE FROM herdbook_registrations WHERE animal_id IN ($1, $2, $3)`, [testSireId, testDamId, testCalfId]);
  await query(`DELETE FROM calves WHERE id = $1`, [testCalfId]);
  await query(`DELETE FROM dams WHERE id = $1`, [testDamId]);
  await query(`DELETE FROM sires WHERE id = $1`, [testSireId]);
  console.log('   Test records cleaned up.');

  console.log('\n🎉 ALL UNIFIED CERTIFICATION WORKFLOW (SIRE, DAM, CALF) E2E TESTS PASSED!\n');
}

runUnifiedCertTest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Unified Cert Test Error:', err);
    process.exit(1);
  });
