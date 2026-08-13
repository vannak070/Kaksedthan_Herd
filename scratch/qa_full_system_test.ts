import { query } from '../src/config/database';
import {
  fetchSireFormOptionsAction,
  fetchSiresAction,
  saveSireAction,
  fetchDamsAction,
  fetchCalvesAction,
  fetchStockInseminationAction,
  updateStockInseminationAction,
  fetchFarmsAction,
  fetchCustomersAction,
  fetchBreedingProgramsAction,
  getUserLevelsAction,
  getUserLevelModulesAction,
  fetchMasterDataCatalogAction
} from '../src/app/actions';
import { resolveAuthenticatedUserContext } from '../src/lib/auth/accessControl';

async function runFullQASuite() {
  console.log('================================================================');
  console.log('   KAKSEDTHAN HERDBOOK — COMPREHENSIVE QA FUNCTIONAL TEST SUITE ');
  console.log('================================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ✓ ${testName}`);
      if (detail) console.log(`       ↳ ${detail}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ✗ ${testName}`);
      if (detail) console.error(`       ↳ Error: ${detail}`);
      failedTests++;
    }
  }

  try {
    // ------------------------------------------------------------------------
    // TEST SUITE 1: Sire Register & Cascading Setup Architecture
    // ------------------------------------------------------------------------
    console.log('--- SUITE 1: Sire Register & Cascading Setup Architecture ---');
    const sireOpts = await fetchSireFormOptionsAction();
    assert(sireOpts.success && Array.isArray(sireOpts.data?.sourcingCompanies), 
      'Sire Form Options Database API', 
      `Loaded ${sireOpts.data?.sourcingCompanies.length} sourcing companies, ${sireOpts.data?.farms.length} farms`
    );

    const sc = sireOpts.data?.sourcingCompanies[0];
    const farm = sireOpts.data?.farms[0];
    const breed = sireOpts.data?.breeds[0];

    assert(!!sc && !!farm && !!breed, 'Master Setup Entities Resolution', `Company: "${sc?.name}", Farm: "${farm?.name}", Breed: "${breed?.name}"`);

    const testSireId = `QA-SIR-${Date.now().toString().slice(-4)}`;
    const saveSireRes = await saveSireAction({
      id: testSireId,
      name: 'QA Champion Tajima Bull',
      registrationNumber: `REG-QA-${Date.now().toString().slice(-4)}`,
      breed: breed?.name || 'Wagyu',
      breedId: breed?.id || 'BRD-01',
      dob: '2022-05-15',
      bloodline: '100% Fullblood Tajima',
      sourcingCompanyId: sc?.id,
      sourcingCompany: sc?.name,
      sourcingCompanyCountry: sc?.country || 'USA / Cambodia',
      ownerType: 'Sire Sourcing Company Account',
      ownerId: sc?.id,
      ownerName: sc?.name,
      farmId: farm?.id,
      farmLocation: farm?.name,
      status: 'Active'
    });
    assert(!!saveSireRes && saveSireRes.id === testSireId, 'Create Sire Record API & Database Persistence', `Created Sire ID: ${testSireId}`);

    const siresList = await fetchSiresAction();
    const createdSire = Array.isArray(siresList) ? siresList.find((s: any) => s.id === testSireId) : null;
    assert(!!createdSire, 'Fetch Sires List API', `Found created sire "${createdSire?.name}" in DB`);

    // Clean up test sire
    await query('DELETE FROM sires WHERE id = $1', [testSireId]);

    // ------------------------------------------------------------------------
    // TEST SUITE 2: Stock Insemination CRUD & Setup Architecture
    // ------------------------------------------------------------------------
    console.log('\n--- SUITE 2: Stock Insemination CRUD & Setup Architecture ---');
    const stocks = await fetchStockInseminationAction();
    assert(Array.isArray(stocks), 'Fetch Stock Insemination API', `Loaded ${stocks?.length} stock records`);

    const farmsList = await fetchFarmsAction();
    assert(farmsList.success && Array.isArray(farmsList.data), 'Fetch Farms API (Database Master)', `Loaded ${farmsList.data?.length} active farm stations`);

    const customers = await fetchCustomersAction();
    assert(customers.success && Array.isArray(customers.data), 'Fetch Customers API (Database Master)', `Loaded ${customers.data?.length} active customers`);

    if (Array.isArray(stocks) && stocks.length > 0) {
      const stockId = stocks[0].id;
      const origNotes = stocks[0].notes || '';
      const newNotes = `QA Audit Verified at ${new Date().toISOString()}`;
      
      const updateRes = await updateStockInseminationAction(stockId, { notes: newNotes });
      assert(updateRes.success, 'Update Stock Insemination CRUD Action', `Updated Stock ID: ${stockId}`);

      // Revert notes
      await updateStockInseminationAction(stockId, { notes: origNotes });
    }

    // ------------------------------------------------------------------------
    // TEST SUITE 3: Dam, Calf & Breeding Programs
    // ------------------------------------------------------------------------
    console.log('\n--- SUITE 3: Dam, Calf & Breeding Programs ---');
    const dams = await fetchDamsAction();
    assert(Array.isArray(dams), 'Fetch Dams API', `Loaded ${dams?.length} dams`);

    const calves = await fetchCalvesAction();
    assert(Array.isArray(calves), 'Fetch Calves API', `Loaded ${calves?.length} calves`);

    const programs = await fetchBreedingProgramsAction();
    assert(Array.isArray(programs), 'Fetch Breeding Programs API', `Loaded ${programs?.length} programs`);

    // ------------------------------------------------------------------------
    // TEST SUITE 4: Users, User Levels & Single Primary Role RBAC
    // ------------------------------------------------------------------------
    console.log('\n--- SUITE 4: Users, User Levels & RBAC Security Engine ---');
    const adminCtx = await resolveAuthenticatedUserContext('sokchea@kaksedthan.com');
    assert(adminCtx?.role === 'Admin' && adminCtx?.userLevel === 'Admin', 
      'Admin User Identity Preservation (No Hardcoded Super Admin)', 
      `User Role: "${adminCtx?.role}", User Level: "${adminCtx?.userLevel}"`
    );

    const userRolesRes = await query(`
      SELECT ur.user_id, r.id as role_id, r.name as role_name 
      FROM user_roles ur 
      JOIN roles r ON r.id = ur.role_id 
      WHERE ur.user_id = 'USR-500925'
    `);
    assert(userRolesRes.rows.length === 1, 
      'Single Primary Role Mapping in Database (No Dual Duplicated Roles)', 
      `Assigned Role: "${userRolesRes.rows[0]?.role_name}"`
    );

    const userLevels = await getUserLevelsAction();
    assert(userLevels.success && Array.isArray(userLevels.data), 'Fetch User Levels API', `Loaded ${userLevels.data?.length} user levels`);

    const vetModules = await getUserLevelModulesAction('LEVEL-193904');
    assert(vetModules.success && Array.isArray(vetModules.data) && vetModules.data.length > 0, 
      'Fetch Vet User Level Permissions Matrix', 
      `Loaded ${vetModules.data?.length} granular permission keys for Vet`
    );

    // ------------------------------------------------------------------------
    // TEST SUITE 5: Single Source of Truth Master Data Catalog
    // ------------------------------------------------------------------------
    console.log('\n--- SUITE 5: Single Source of Truth Master Data Catalog ---');
    const masterCatalog = await fetchMasterDataCatalogAction();
    assert(masterCatalog.success && !!masterCatalog.data, 
      'Master Data Catalog API', 
      `Breeds: ${masterCatalog.data?.breeds?.length || 0}, Sourcing Companies: ${masterCatalog.data?.sourcingCompanies?.length || 0}`
    );

    // ------------------------------------------------------------------------
    // FINAL SUMMARY REPORT
    // ------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`   QA FUNCTIONAL TEST RESULTS SUMMARY: ${passedTests} PASSED | ${failedTests} FAILED `);
    console.log('================================================================\n');

    process.exit(failedTests > 0 ? 1 : 0);
  } catch (err: any) {
    console.error('[FATAL QA ERROR]:', err);
    process.exit(1);
  }
}

runFullQASuite();
