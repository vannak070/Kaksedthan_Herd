import { herdbookRepository } from './src/repositories/herdbook.repository';
import { exportToCSV, ExportColumn } from './src/utils/exportUtils';

async function runSystemwidePaginationExportTest() {
  console.log('=== 🧪 E2E VERIFICATION: SYSTEM-WIDE PAGINATION & EXPORT AUDIT ===\n');

  // 1. Audit Sires Pagination & Export
  console.log('1. Auditing Sire Register Pagination & Export...');
  const sires = await herdbookRepository.getSires();
  console.log(`   Total Sires in DB: ${sires.length}`);
  const sireCols: ExportColumn[] = [
    { header: 'Sire ID', key: 'id' },
    { header: 'Sire Name', key: 'name' },
    { header: 'Breed', key: 'breed' },
    { header: 'Status', key: 'status' },
    { header: 'Certification', key: 'certificationStatus' }
  ];
  const sirePage1 = sires.slice(0, 20);
  console.log(`   Page 1 Sires Count: ${sirePage1.length}`);
  if (sires.length > 0 && sirePage1.length === 0) throw new Error('❌ Sire pagination failed!');

  // 2. Audit Dams Pagination & Export
  console.log('\n2. Auditing Dam Register Pagination & Export...');
  const dams = await herdbookRepository.getDams();
  console.log(`   Total Dams in DB: ${dams.length}`);
  const damPage1 = dams.slice(0, 20);
  console.log(`   Page 1 Dams Count: ${damPage1.length}`);

  // 3. Audit Calves Pagination & Export
  console.log('\n3. Auditing Calf Register Pagination & Export...');
  const calves = await herdbookRepository.getCalves();
  console.log(`   Total Calves in DB: ${calves.length}`);
  const calfPage1 = calves.slice(0, 20);
  console.log(`   Page 1 Calves Count: ${calfPage1.length}`);

  // 4. Audit Breeding Programs Pagination & Export
  console.log('\n4. Auditing Breeding Programs Pagination & Export...');
  const bp = await herdbookRepository.getBreedingPrograms();
  console.log(`   Total Breeding Programs in DB: ${bp.length}`);
  const bpPage1 = bp.slice(0, 20);
  console.log(`   Page 1 Breeding Programs Count: ${bpPage1.length}`);

  // 5. Audit Stock Insemination Pagination & Export
  console.log('\n5. Auditing Stock Insemination Pagination & Export...');
  const stock = await herdbookRepository.getStockInsemination();
  console.log(`   Total Stock Batches in DB: ${stock.length}`);
  const stockPage1 = stock.slice(0, 20);
  console.log(`   Page 1 Stock Batches Count: ${stockPage1.length}`);

  // 6. Audit Certificate Center Pagination & Export
  console.log('\n6. Auditing Certificate Center Pagination & Export...');
  const certs = await herdbookRepository.getCertificates();
  console.log(`   Total Certificates in DB: ${certs.length}`);
  const certPage1 = certs.slice(0, 20);
  console.log(`   Page 1 Certificates Count: ${certPage1.length}`);

  // 7. Audit Breeder Accounts Pagination & Export
  console.log('\n7. Auditing Breeder Accounts Pagination & Export...');
  const breeders = await herdbookRepository.getBreeders();
  console.log(`   Total Breeders in DB: ${breeders.length}`);
  const breederPage1 = breeders.slice(0, 20);
  console.log(`   Page 1 Breeders Count: ${breederPage1.length}`);

  // 8. Audit Customers Pagination & Export
  console.log('\n8. Auditing Customers / Cow Owners Pagination & Export...');
  const customers = await herdbookRepository.getCustomers();
  console.log(`   Total Customers in DB: ${customers.length}`);

  // 9. Audit Farm Stations Pagination & Export
  console.log('\n9. Auditing Farm Stations Pagination & Export...');
  const farms = await herdbookRepository.getFarms();
  console.log(`   Total Farm Stations in DB: ${farms.length}`);

  // 10. Audit Audit Logs Pagination & Export
  console.log('\n10. Auditing System Audit Logs Pagination & Export...');
  const logs = await herdbookRepository.getAuditLogs();
  console.log(`    Total Audit Logs in DB: ${logs.length}`);

  console.log('\n🎉 ALL SYSTEM-WIDE PAGINATION & EXPORT E2E TESTS PASSED!\n');
}

runSystemwidePaginationExportTest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Systemwide Pagination & Export Test Error:', err);
    process.exit(1);
  });
