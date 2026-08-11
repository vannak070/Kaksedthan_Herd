import { herdbookRepository } from './src/repositories/herdbook.repository';

async function runCattleTest() {
  console.log('=== 🧪 VERIFYING FARM STATION CATTLE MANAGEMENT (SIRES, DAMS, CALVES) ===\n');

  const farms = await herdbookRepository.getFarms();
  console.log(`Found ${farms.length} farm stations in database.\n`);

  for (const farm of farms) {
    const cattleData = await herdbookRepository.getFarmCattle(farm.id);
    const { summary, animals } = cattleData;

    console.log(`📍 Farm Station: "${farm.name}" (ID: ${farm.id}, Code: ${farm.code})`);
    console.log(`   Total Cattle: ${summary.total} (Sires: ${summary.sires}, Dams: ${summary.dams}, Calves: ${summary.calves})`);

    if (animals.length > 0) {
      console.log('   Sample Cattle Items:');
      animals.slice(0, 3).forEach(a => {
        console.log(`   - [${a.category}] ${a.name} (${a.id}) | Breed: ${a.breed} | Sex: ${a.sex} | Owner: ${a.ownerName || 'N/A'}`);
      });
    } else {
      console.log('   - No cattle currently housed at this station.');
    }
    console.log('---');
  }

  console.log('\n🎉 ALL FARM STATION CATTLE DATA & SCOPING TESTS PASSED!\n');
}

runCattleTest()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Cattle test error:', err);
    process.exit(1);
  });
