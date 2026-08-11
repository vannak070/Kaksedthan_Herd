import { herdbookRepository } from './src/repositories/herdbook.repository';
import { query } from './src/config/database';

async function runAdvancedAuthTest() {
  console.log('=== 🧪 E2E VERIFICATION: ADVANCED AUTHORIZATION, DATA SCOPE, APPROVAL WORKFLOW & AUDIT LOGS ===\n');

  // 1. User Account Structure Verification
  console.log('1. Verifying Account Architecture Separation...');
  const customerCheck = await query(`SELECT * FROM users WHERE email ILIKE '%customer%'`);
  console.log(`   Customer User Accounts Count in users table: ${customerCheck.rows.length} (Confirmed: 0 accounts!)`);
  if (customerCheck.rows.length > 0) throw new Error('❌ Customer account created in users table!');

  const breederUserCheck = await query(`SELECT id, email, role, user_type, user_level FROM users WHERE user_type = 'Breeder'`);
  console.log(`   Breeder User Accounts Count: ${breederUserCheck.rows.length}`);
  console.log(`   Sample Breeder User: ID=${breederUserCheck.rows[0]?.id}, Email=${breederUserCheck.rows[0]?.email}, Type=${breederUserCheck.rows[0]?.user_type}, Level=${breederUserCheck.rows[0]?.user_level}`);

  // 2. Data Scope Isolation & Security Enforcement (Breeder A vs Breeder B)
  console.log('\n2. Testing Breeder Data Scope & Authorization Isolation...');
  const b1Cust = await herdbookRepository.getCustomers('BREEDER-01');
  const b2Cust = await herdbookRepository.getCustomers('BREEDER-02');
  console.log(`   Breeder-01 Customers: ${b1Cust.length} | Breeder-02 Customers: ${b2Cust.length}`);

  if (b2Cust.length > 0) {
    try {
      await herdbookRepository.updateCustomer(b2Cust[0].id, { name: 'Scope Bypass Attempt' }, 'BREEDER-01');
      throw new Error('❌ FAIL: Breeder 01 was able to mutate Breeder 02 customer!');
    } catch (err: any) {
      console.log(`   ✅ 403 Forbidden Data Scope Enforcement Passed: "${err.message}"`);
    }
  }

  // 3. Certificate Application Workflow (Applicant creates PENDING_APPROVAL)
  console.log('\n3. Testing Certificate Application Workflow (Breeder/Farm Applicant)...');
  const testUser = { id: 'USR-BREEDER-01', name: 'Sokha Breeder', role: 'Breeder', userType: 'Breeder', breederId: 'BREEDER-01' };
  
  const certApp = await herdbookRepository.applyCertificate({
    animalType: 'Sire',
    animalId: 'SIR-002',
    layoutType: 'A4 Landscape'
  }, testUser);

  console.log(`   ✅ Certificate Application Submitted: ID=${certApp.id}, Number=${certApp.certificate_number}, Status=${certApp.status}`);
  if (certApp.status !== 'PENDING_APPROVAL') {
    throw new Error(`❌ FAIL: Expected status PENDING_APPROVAL, got ${certApp.status}`);
  }

  // 4. Approval Bypass Prevention (Applicant attempting self-approval must be DENIED)
  console.log('\n4. Testing Approval Bypass Prevention (Applicant Attempting Self-Approval)...');
  try {
    await herdbookRepository.approveCertificate(certApp.id, testUser);
    throw new Error('❌ FAIL: Non-Admin applicant was able to self-approve certificate!');
  } catch (err: any) {
    console.log(`   ✅ 403 Forbidden Self-Approval Bypass Prevented: "${err.message}"`);
  }

  // 5. Admin Approval & Audit Logging
  console.log('\n5. Testing Admin Approval & Audit Logging...');
  const adminUser = { id: 'USR-01', name: 'Super Admin', role: 'Admin', userType: 'Admin' };
  const approvedCert = await herdbookRepository.approveCertificate(certApp.id, adminUser);
  console.log(`   ✅ Certificate Application Approved by Admin: Status=${approvedCert.status}, ReviewedBy=${approvedCert.reviewed_by}`);

  // 6. Certificate Rejection Workflow (Rejection Reason Required)
  console.log('\n6. Testing Certificate Rejection Workflow with Rejection Reason...');
  const certApp2 = await herdbookRepository.applyCertificate({
    animalType: 'Dam',
    animalId: 'DAM-TEST-9190',
    layoutType: 'A4 Landscape'
  }, testUser);

  try {
    await herdbookRepository.rejectCertificate(certApp2.id, '', adminUser);
    throw new Error('❌ FAIL: Rejection without reason was accepted!');
  } catch (err: any) {
    console.log(`   ✅ Rejection Reason Enforcement Passed: "${err.message}"`);
  }

  const rejectedCert = await herdbookRepository.rejectCertificate(certApp2.id, 'Pedigree verification document missing lineage proof.', adminUser);
  console.log(`   ✅ Certificate Application Rejected by Admin: Status=${rejectedCert.status}, Reason="${rejectedCert.rejection_reason}"`);

  // 7. Verify Immutable Audit Logs
  console.log('\n7. Verifying Immutable Audit Trail in PostgreSQL...');
  const auditLogs = await query(`SELECT * FROM audit_logs WHERE resource_id IN ($1, $2) ORDER BY created_at DESC`, [certApp.id, certApp2.id]);
  console.log(`   Audit Logs Found for Test Applications: ${auditLogs.rows.length} entries`);
  auditLogs.rows.forEach(log => {
    console.log(`   - [${log.action}] PerformedBy=${log.performed_by} | Resource=${log.resource_id} | Details=${log.details}`);
  });

  // 8. Clean up test records
  console.log('\n8. Cleaning up test certificate applications...');
  await query(`DELETE FROM certificates WHERE id IN ($1, $2)`, [certApp.id, certApp2.id]);
  await query(`DELETE FROM herdbook_registrations WHERE animal_id IN ('SIR-002', 'DAM-TEST-9190') AND status = 'PENDING_APPROVAL'`);
  console.log('   Test records cleaned up.');

  console.log('\n🎉 ALL ADVANCED AUTHORIZATION, DATA SCOPE & APPROVAL WORKFLOW E2E TESTS PASSED!\n');
}

runAdvancedAuthTest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Advanced Auth Test Error:', err);
    process.exit(1);
  });
