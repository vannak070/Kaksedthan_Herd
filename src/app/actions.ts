'use server';

import { 
  getDbData, 
  addStockItem, 
  updateStockItem, 
  addWeightRecord, 
  recordSale,
  recordBatchSale,
  updateSettings,
  createBatch,
  assignCowsToBatch,
  addHealthLog,
  addExpense,
  updateExpense,
  deleteExpense,
  removeCowFromBatch,
  updateBatch,
  recordBatchWeights,
  recordBatchHealthLog,
  deleteStockItem,
  deleteBatch,
  deleteHealthLog,
  updateHealthLog,
  deleteWeightRecord,
  updateWeightRecord,
  deleteSalesRecord,
  updateSalesRecord,
  updateStockLocation,
  saveFeedProduct,
  deleteFeedProduct,
  addFeedTransaction
} from '@/lib/db';
import { StockItem, WeightRecord, SalesRecord } from '@/lib/xlsx-parser';
import { MasterSetup, BatchItem, HealthLogItem, ExpenseItem, FeedProductItem, FeedStockTransaction } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { herdbookRepository } from '@/repositories/herdbook.repository';
import { settingsRepository } from '@/repositories/settings.repository';
import { SireItem, DamItem, StockInseminationItem, BreedingProgramItem, CalfItem } from '@/types/breeding.types';

export async function getLivestockDataAction() {
  try {
    const data = await getDbData();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch livestock data' };
  }
}

export async function getSettingsAction() {
  try {
    const settings = await settingsRepository.getSettings();
    return { success: true, data: settings };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch settings' };
  }
}

export async function loginUserAction(credentials: { email?: string; password?: string }) {
  try {
    if (!credentials.email || !credentials.password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const emailTrim = credentials.email.trim().toLowerCase();
    const { query } = await import('@/config/database');
    const { resolveAuthenticatedUserContext } = await import('@/lib/auth/accessControl');

    const res = await query(
      `SELECT id, name, email, password, role, user_level, status FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [emailTrim]
    );

    if (res.rows.length === 0) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const user = res.rows[0];

    // Check account status
    const statusLower = (user.status || 'Active').toLowerCase();
    if (statusLower === 'disabled' || statusLower === 'suspended' || statusLower === 'inactive') {
      return { success: false, error: `Account status is "${user.status}". Login is blocked for deactivated or suspended accounts.` };
    }

    // Password verification
    const submittedPass = credentials.password.trim();
    const storedPass = user.password || '';
    const expectedSaltHash = `$2a$10$e8T.uD39G1/E1Y/n.${submittedPass}`;

    const isValidPassword = storedPass === submittedPass || storedPass === expectedSaltHash;

    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Resolve full authenticated user context (permissions, dataScope, etc.)
    const userContext = await resolveAuthenticatedUserContext(user.email);
    if (!userContext) {
      return { success: false, error: 'Failed to resolve user security context.' };
    }

    return { success: true, data: userContext };
  } catch (error: any) {
    return { success: false, error: error.message || 'An error occurred during authentication.' };
  }
}

export async function addStockItemAction(item: Omit<StockItem, 'no'>) {
  try {
    const newItem = await addStockItem(item);
    revalidatePath('/');
    return { success: true, data: newItem };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add stock item' };
  }
}

export async function updateStockItemAction(id: string, updates: Partial<StockItem>) {
  try {
    const updated = await updateStockItem(id, updates);
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update stock item' };
  }
}

export async function updateStockLocationAction(oldLocation: string, newLocation: string) {
  try {
    await updateStockLocation(oldLocation, newLocation);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update stock location' };
  }
}

export async function addWeightRecordAction(cowId: string, currentWeight: number, healthStatus: string, trackingDate?: string) {
  try {
    const record = await addWeightRecord(cowId, currentWeight, healthStatus, trackingDate);
    revalidatePath('/');
    return { success: true, data: record };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add weight record' };
  }
}

export async function recordSaleAction(cowId: string, unitPrice: number, saleType: 'Weight' | 'Lumpsum', salesDate?: string, buyer?: string) {
  try {
    const record = await recordSale(cowId, unitPrice, saleType, salesDate, buyer);
    revalidatePath('/');
    return { success: true, data: record };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record sale' };
  }
}

export async function recordBatchSaleAction(batchId: string, unitPrice: number, saleType: 'Weight' | 'Lumpsum', salesDate?: string) {
  try {
    const records = await recordBatchSale(batchId, unitPrice, saleType, salesDate);
    revalidatePath('/');
    return { success: true, data: records };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record batch sale' };
  }
}

export async function updateSettingsAction(settings: MasterSetup) {
  try {
    const res = await updateSettings(settings);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update setup configurations' };
  }
}

export async function createBatchAction(batch: Omit<BatchItem, 'cowIds'>) {
  try {
    const res = await createBatch(batch);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create batch' };
  }
}

export async function assignCowsToBatchAction(batchId: string, cowIds: string[]) {
  try {
    const res = await assignCowsToBatch(batchId, cowIds);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to assign cows' };
  }
}

export async function addHealthLogAction(log: Omit<HealthLogItem, 'id'>) {
  try {
    const res = await addHealthLog(log);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add medical/vaccination log' };
  }
}

export async function addExpenseAction(expense: Omit<ExpenseItem, 'id'>) {
  try {
    const res = await addExpense(expense);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record expense' };
  }
}

export async function updateExpenseAction(expenseId: string, updates: Partial<ExpenseItem>) {
  try {
    const res = await updateExpense(expenseId, updates);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update expense record' };
  }
}

export async function deleteExpenseAction(expenseId: string) {
  try {
    await deleteExpense(expenseId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete expense record' };
  }
}

export async function removeCowFromBatchAction(batchId: string, cowId: string) {
  try {
    const res = await removeCowFromBatch(batchId, cowId);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove cow from batch' };
  }
}

export async function updateBatchAction(batchId: string, updates: Partial<BatchItem>) {
  try {
    const res = await updateBatch(batchId, updates);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update batch details' };
  }
}

export async function recordBatchWeightsAction(records: { cowId: string; currentWeight: number; healthStatus: string; trackingDate?: string }[]) {
  try {
    await recordBatchWeights(records);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record batch weights' };
  }
}

export async function recordBatchHealthLogAction(batchId: string, log: Omit<HealthLogItem, 'id' | 'cowId'>) {
  try {
    const records = await recordBatchHealthLog(batchId, log);
    revalidatePath('/');
    return { success: true, data: records };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record batch health log' };
  }
}

export async function deleteStockItemAction(cowId: string) {
  try {
    await deleteStockItem(cowId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete stock item' };
  }
}

export async function deleteBatchAction(batchId: string) {
  try {
    await deleteBatch(batchId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete batch' };
  }
}

export async function deleteHealthLogAction(logId: string) {
  try {
    await deleteHealthLog(logId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete health log' };
  }
}

export async function updateHealthLogAction(logId: string, updates: Partial<HealthLogItem>) {
  try {
    const res = await updateHealthLog(logId, updates);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update health log' };
  }
}

export async function deleteWeightRecordAction(cowId: string, trackingDate: string) {
  try {
    await deleteWeightRecord(cowId, trackingDate);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete weight record' };
  }
}

export async function updateWeightRecordAction(cowId: string, trackingDate: string, currentWeight: number, healthStatus: string) {
  try {
    await updateWeightRecord(cowId, trackingDate, currentWeight, healthStatus);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update weight record' };
  }
}

export async function deleteSalesRecordAction(cowId: string) {
  try {
    await deleteSalesRecord(cowId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete sales record' };
  }
}

export async function updateSalesRecordAction(cowId: string, updates: Partial<SalesRecord>) {
  try {
    const res = await updateSalesRecord(cowId, updates);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update sales record' };
  }
}

export async function saveFeedProductAction(product: FeedProductItem) {
  try {
    const res = await saveFeedProduct(product);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save feed product' };
  }
}

export async function deleteFeedProductAction(productId: string) {
  try {
    await deleteFeedProduct(productId);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete feed product' };
  }
}

export async function addFeedTransactionAction(tx: FeedStockTransaction) {
  try {
    const res = await addFeedTransaction(tx);
    revalidatePath('/');
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add feed transaction' };
  }
}

// ── HERDBOOK & BREEDING ACTIONS ─────────────────────────────────────────────

export async function fetchSiresAction() {
  return herdbookRepository.getSires();
}

export async function saveSireAction(sire: SireItem) {
  if (sire.id) {
    const existing = await herdbookRepository.getSireById(sire.id);
    if (existing) {
      const res = await herdbookRepository.updateSire(sire.id, sire);
      revalidatePath('/sires');
      revalidatePath(`/sires/${sire.id}`);
      return res;
    }
  }
  const id = sire.id || `SIR-${Math.floor(100 + Math.random() * 900)}`;
  const res = await herdbookRepository.createSire({ ...sire, id });
  revalidatePath('/sires');
  return res;
}

export async function createSireAction(sire: SireItem) {
  return saveSireAction(sire);
}

export async function fetchDamsAction() {
  return herdbookRepository.getDams();
}

export async function saveDamAction(dam: DamItem) {
  if (dam.id) {
    const existing = await herdbookRepository.getDamById(dam.id);
    if (existing) {
      const res = await herdbookRepository.updateDam(dam.id, dam);
      revalidatePath('/dams');
      revalidatePath(`/dams/${dam.id}`);
      return res;
    }
  }
  const id = dam.id || `DAM-${Math.floor(100 + Math.random() * 900)}`;
  const res = await herdbookRepository.createDam({ ...dam, id });
  revalidatePath('/dams');
  return res;
}

export async function createDamAction(dam: DamItem) {
  return saveDamAction(dam);
}

export async function fetchStockInseminationAction() {
  return herdbookRepository.getStockInsemination();
}

export async function saveStockInseminationAction(item: StockInseminationItem) {
  const id = item.id || `SEM-${Math.floor(100 + Math.random() * 900)}`;
  const res = await herdbookRepository.createStockInsemination({ ...item, id, currency: 'USD' });
  revalidatePath('/stock-insemination');
  return res;
}

export async function createStockInseminationAction(item: StockInseminationItem) {
  return saveStockInseminationAction(item);
}

export async function updateStockInseminationAction(id: string, updates: Partial<StockInseminationItem>) {
  await herdbookRepository.updateStockInsemination(id, updates);
  revalidatePath('/stock-insemination');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// Breeding Program: Breeder Data-Scope Enforcement
// ─────────────────────────────────────────────────────────────

/**
 * Resolve the Breeder profile from the current user's email.
 * This is the ONLY secure way to identify a Breeder on the backend.
 * Never trust the breederId sent from the frontend payload.
 */
export async function resolveCurrentBreederAction(email?: string): Promise<{
  success: boolean;
  data?: { id: string; name: string } | null;
  error?: string;
}> {
  if (!email) return { success: true, data: null };
  try {
    const breeder = await herdbookRepository.getBreederByEmail(email);
    return { success: true, data: breeder ? { id: breeder.id, name: breeder.name } : null };
  } catch (error: any) {
    console.error('[resolveCurrentBreeder] error:', error);
    return { success: false, error: error.message || 'Failed to resolve Breeder identity' };
  }
}

/**
 * Fetch breeding programs, scoped by Breeder ID when the caller is a Breeder account.
 * Admin: breederIdScope = undefined → all programs.
 * Breeder: breederIdScope = resolvedBreederId → only own programs.
 */
export async function fetchBreedingProgramsAction(breederIdScope?: string) {
  try {
    const programs = await herdbookRepository.getBreedingPrograms(breederIdScope || undefined);
    return programs;
  } catch {
    return [];
  }
}

/**
 * Create a new Breeding Program with authoritative Breeder assignment.
 *
 * Security enforcement:
 * - If callerRole is 'Breeder': backend resolves the Breeder ID from callerEmail,
 *   IGNORES any breederId in the frontend payload, and stamps the resolved ID.
 * - If callerRole is 'Admin' / 'Super Admin': uses the breederId from the payload
 *   but validates the Breeder exists and is active.
 * - Frontend-supplied breederId for Breeder accounts is SILENTLY OVERRIDDEN.
 */
export async function createBreedingProgramAction(
  program: BreedingProgramItem,
  callerRole?: string,
  callerEmail?: string
) {
  const id = program.id || `BP-${Date.now()}`;
  const programNumber = program.programNumber || `BP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  let resolvedBreederId: string | null = (program as any).breederId || null;
  let resolvedBreederName: string | null = program.breederName || null;

  const isBreederAccount = callerRole === 'Breeder' || callerRole === 'Breeder Account';

  if (isBreederAccount && callerEmail) {
    // SECURITY: Derive Breeder ID from the authenticated user email — ignore frontend payload
    const breeder = await herdbookRepository.getBreederByEmail(callerEmail);
    if (!breeder) {
      throw new Error('Breeder account not found. Cannot create program without a verified Breeder identity.');
    }
    resolvedBreederId = breeder.id;
    resolvedBreederName = breeder.name;
  } else if (!isBreederAccount && resolvedBreederId) {
    // Admin path: validate the selected Breeder exists
    const breeder = await herdbookRepository.getBreederById(resolvedBreederId);
    if (!breeder) {
      throw new Error(`Selected Breeder (${resolvedBreederId}) not found.`);
    }
    resolvedBreederName = breeder.name;
  }

  const res = await herdbookRepository.createBreedingProgram({
    ...program,
    id,
    programNumber,
    breederName: resolvedBreederName || program.breederName || null,
    ...(resolvedBreederId ? { breederId: resolvedBreederId } : {})
  } as any);

  revalidatePath('/breeding-programs');
  return res;
}

export async function updateBreedingStatusAction(id: string, status: BreedingProgramItem['status'], notes?: string) {
  await herdbookRepository.updateBreedingProgramStatus(id, status, undefined, undefined);
  revalidatePath('/breeding-programs');
  return { success: true };
}

export async function updateBreedingProgramStatusAction(id: string, status: BreedingProgramItem['status'], actualCalvingDate?: string, result?: string) {
  await herdbookRepository.updateBreedingProgramStatus(id, status, actualCalvingDate, result);
  revalidatePath('/breeding-programs');
  return { success: true };
}

export async function fetchCalvesAction() {
  return herdbookRepository.getCalves();
}

export async function updateCalfAction(id: string, updates: Partial<CalfItem>) {
  const res = await herdbookRepository.updateCalf(id, updates);
  revalidatePath('/calves');
  return res;
}

export async function confirmCalfTransactionAction(calf: CalfItem) {
  const id = calf.id || `CLF-2026-${Math.floor(100 + Math.random() * 900)}`;
  const res = await herdbookRepository.confirmCalfTransaction({ ...calf, id });
  revalidatePath('/calves');
  revalidatePath('/herdbook');
  revalidatePath('/certificates');
  return res;
}

export async function fetchHerdbookRegistrationsAction() {
  return herdbookRepository.getHerdbookRegistrations();
}

export async function fetchCertificatesAction() {
  return herdbookRepository.getCertificates();
}

export async function getCertificateByIdAction(id: string) {
  return herdbookRepository.getCertificateById(id);
}

export async function updateCertificateStatusAction(id: string, status: string) {
  await herdbookRepository.updateCertificateStatus(id, status);
  revalidatePath('/certificates');
  revalidatePath(`/certificates/${id}`);
  return { success: true };
}

export async function getPublicVerificationAction(token: string) {
  try {
    const res = await herdbookRepository.getPublicVerificationByToken(token);
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || 'Verification failed' };
  }
}

export async function applyCertificateAction(
  dataOrAnimalType: 'Sire' | 'Dam' | 'Calf' | { animalType: 'Sire' | 'Dam' | 'Calf'; animalId: string; layoutType?: string },
  animalIdOrUser?: string | { id: string; name: string; role?: string; userType?: string }
) {
  try {
    if (typeof dataOrAnimalType === 'object') {
      const user = (typeof animalIdOrUser === 'object' && animalIdOrUser) ? animalIdOrUser : { id: 'USR-01', name: 'Super Admin', role: 'Admin' };
      const created = await herdbookRepository.applyCertificate(dataOrAnimalType, user);
      revalidatePath('/certificates');
      revalidatePath('/settings/certificates');
      return { success: true, data: created };
    } else {
      const animalId = animalIdOrUser as string;
      const created = await herdbookRepository.applyCertificate({ animalType: dataOrAnimalType, animalId }, { id: 'USR-01', name: 'Super Admin', role: 'Admin' });
      revalidatePath('/certificates');
      revalidatePath('/sires');
      revalidatePath('/dams');
      revalidatePath('/calves');
      return { success: true, data: created };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to submit certificate application' };
  }
}

// ─────────────────────────────────────────────────────────────
// User Level Management Actions (Database Driven)
// ─────────────────────────────────────────────────────────────
export async function getUserLevelsAction() {
  try {
    await herdbookRepository.ensureUserLevelTablesSchema();
    let levels = await herdbookRepository.getUserLevels();
    if (levels.length === 0) {
      await herdbookRepository.seedUserLevelPermissions();
      levels = await herdbookRepository.getUserLevels();
    }
    return { success: true, data: levels };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch user levels' };
  }
}

export async function getActiveUserLevelsAction() {
  try {
    const levels = await herdbookRepository.getUserLevels();
    const activeLevels = levels.filter(l => l.status === 'Active');
    return { success: true, data: activeLevels };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch active user levels' };
  }
}

export async function getActiveSystemAccountLevelsAction() {
  try {
    const levels = await herdbookRepository.getUserLevels();
    const activeSystemLevels = levels.filter(
      l => l.status === 'Active' && (l.levelType === 'SYSTEM_ACCOUNT' || !['LEVEL-01', 'LEVEL-02', 'LEVEL-03', 'LEVEL-04'].includes(l.id))
    );
    return { success: true, data: activeSystemLevels };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch active system account levels' };
  }
}

export async function getUserLevelPermissionsAction(userLevelId: string) {
  try {
    const perms = await herdbookRepository.getUserLevelPermissions(userLevelId);
    return { success: true, data: perms };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch user level permissions' };
  }
}

export async function updateUserLevelPermissionsAction(userLevelId: string, permissions: string[], callerUserId?: string) {
  try {
    if (!callerUserId) throw new Error('Unauthorized');
    await herdbookRepository.updateUserLevelPermissions(userLevelId, permissions, callerUserId);
    revalidatePath('/admin/user-levels');
    revalidatePath(`/admin/user-levels/${userLevelId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update user level permissions' };
  }
}

export async function getUserLevelByIdAction(id: string) {
  try {
    const level = await herdbookRepository.getUserLevelById(id);
    return { success: true, data: level };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch user level details' };
  }
}

export async function createUserLevelAction(data: {
  code: string;
  name: string;
  description?: string;
  purpose?: string;
  sortOrder?: number;
  defaultModules?: string[];
  permissions?: string[];
}, callerUserId?: string) {
  try {
    if (callerUserId) {
      const { isSuperAdmin } = await resolveCallerPermissions(callerUserId);
      if (!isSuperAdmin) {
        return { success: false, error: 'Forbidden: Super Admin authority required to create User Levels.', statusCode: 403 };
      }
    }
    const level = await herdbookRepository.createUserLevel(data);
    revalidatePath('/admin/user-levels');
    revalidatePath('/settings/user-levels');
    return { success: true, data: level };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create user level' };
  }
}

export async function updateUserLevelAction(id: string, updates: { name?: string; description?: string; purpose?: string; sortOrder?: number; status?: 'Draft' | 'Active' | 'Inactive' }, callerUserId?: string) {
  try {
    if (callerUserId) {
      const { isSuperAdmin } = await resolveCallerPermissions(callerUserId);
      if (!isSuperAdmin) {
        return { success: false, error: 'Forbidden: Super Admin authority required to update User Levels.', statusCode: 403 };
      }
    }
    const level = await herdbookRepository.updateUserLevel(id, updates, callerUserId || 'admin');
    revalidatePath('/admin/user-levels');
    revalidatePath(`/admin/user-levels/${id}`);
    revalidatePath('/settings/user-levels');
    revalidatePath(`/settings/user-levels/${id}`);
    return { success: true, data: level };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update user level' };
  }
}

export async function setUserLevelStatusAction(id: string, status: 'Draft' | 'Active' | 'Inactive', callerUserId?: string) {
  try {
    if (callerUserId) {
      const { isSuperAdmin } = await resolveCallerPermissions(callerUserId);
      if (!isSuperAdmin) {
        return { success: false, error: 'Forbidden: Super Admin authority required to change User Level status.', statusCode: 403 };
      }
    }
    const res = await herdbookRepository.setUserLevelStatus(id, status);
    revalidatePath('/admin/user-levels');
    revalidatePath(`/admin/user-levels/${id}`);
    revalidatePath('/settings/user-levels');
    revalidatePath(`/settings/user-levels/${id}`);
    return { success: true, data: res.level, warning: res.warning };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update user level status' };
  }
}

export async function getUserLevelUsersAction(userLevelId: string) {
  try {
    const users = await herdbookRepository.getUserLevelUsers(userLevelId);
    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch assigned users' };
  }
}

export async function getUserLevelModulesAction(userLevelId: string) {
  try {
    const modules = await herdbookRepository.getUserLevelModules(userLevelId);
    return { success: true, data: modules };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch user level modules' };
  }
}

export async function updateUserLevelModulesAction(
  userLevelId: string,
  modules: { moduleKey: string; moduleName?: string; isAvailable: boolean }[],
  performedBy?: string
) {
  try {
    await herdbookRepository.updateUserLevelModules(userLevelId, modules, performedBy || 'admin');
    revalidatePath('/admin/user-levels');
    revalidatePath(`/admin/user-levels/${userLevelId}`);
    revalidatePath('/settings/user-levels');
    revalidatePath(`/settings/user-levels/${userLevelId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update module access' };
  }
}

// ─────────────────────────────────────────────────────────────
// User Level Role Actions
// ─────────────────────────────────────────────────────────────

export async function getUserLevelRolesAction(userLevelId: string) {
  try {
    const roles = await herdbookRepository.getUserLevelRoles(userLevelId);
    return { success: true, data: roles };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch user level roles' };
  }
}

export async function setUserLevelRolesAction(
  userLevelId: string,
  roles: { roleName: string; roleLabel?: string }[],
  performedBy?: string
) {
  try {
    await herdbookRepository.setUserLevelRoles(userLevelId, roles, performedBy || 'admin');
    revalidatePath('/admin/user-levels');
    revalidatePath(`/admin/user-levels/${userLevelId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update user level roles' };
  }
}

// ─────────────────────────────────────────────────────────────
// User Level Safe Delete Action
// ─────────────────────────────────────────────────────────────

export async function deleteUserLevelAction(id: string, performedBy?: string) {
  try {
    const result = await herdbookRepository.deleteUserLevel(id, performedBy || 'admin');
    if (result.deleted) {
      revalidatePath('/admin/user-levels');
      revalidatePath('/settings/user-levels');
    }
    return { success: result.deleted, data: result, error: result.reason };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete user level' };
  }
}

// ─────────────────────────────────────────────────────────────
// User Level Audit Log Action
// ─────────────────────────────────────────────────────────────

export async function getUserLevelAuditAction(userLevelId: string) {
  try {
    const logs = await herdbookRepository.getUserLevelAudit(userLevelId);
    return { success: true, data: logs };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch audit log' };
  }
}

// ─────────────────────────────────────────────────────────────
// Farm Management Server Actions
// ─────────────────────────────────────────────────────────────

export async function fetchFarmsAction() {
  try {
    const farms = await herdbookRepository.getFarms();
    return { success: true, data: farms };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch farms' };
  }
}

export async function fetchFarmByIdAction(id: string) {
  try {
    const farm = await herdbookRepository.getFarmById(id);
    if (!farm) {
      return { success: false, error: 'Farm station not found' };
    }
    return { success: true, data: farm };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch farm details' };
  }
}

export async function fetchFarmCattleAction(id: string) {
  try {
    const cattleData = await herdbookRepository.getFarmCattle(id);
    return { success: true, data: cattleData };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch farm cattle' };
  }
}

export async function createFarmAction(farm: {
  name: string;
  code?: string;
  farmType?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerNationalId?: string;
  address?: string;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  imageUrl?: string;
  notes?: string;
  status?: string;
  createAccount?: boolean;
  accountEmail?: string;
  accountPassword?: string;
  accountStatus?: string;
  userLevel?: string;
}) {
  try {
    const created = await herdbookRepository.createFarm(farm);
    revalidatePath('/farms');
    revalidatePath('/settings/organization');
    return { success: true, data: created };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create farm station' };
  }
}

export async function updateFarmAction(id: string, updates: {
  name?: string;
  code?: string;
  farmType?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerNationalId?: string;
  address?: string;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  imageUrl?: string;
  notes?: string;
  status?: string;
  createAccount?: boolean;
  accountEmail?: string;
  accountPassword?: string;
  accountStatus?: string;
  userLevel?: string;
}) {
  try {
    const updated = await herdbookRepository.updateFarm(id, updates);
    revalidatePath('/farms');
    revalidatePath(`/farms/${id}`);
    revalidatePath('/settings/organization');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update farm station' };
  }
}

export async function toggleFarmAccountStatusAction(farmId: string, status: 'Active' | 'Inactive' | 'Suspended') {
  try {
    const updated = await herdbookRepository.toggleFarmAccountStatus(farmId, status);
    revalidatePath('/farms');
    revalidatePath(`/farms/${farmId}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update login account status' };
  }
}

export async function fetchBreedersAction() {
  try {
    const breeders = await herdbookRepository.getBreeders();
    return { success: true, data: breeders };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch breeders' };
  }
}

export async function fetchBreederByIdAction(id: string) {
  try {
    const breeder = await herdbookRepository.getBreederById(id);
    if (!breeder) {
      return { success: false, error: 'Breeder profile not found' };
    }
    return { success: true, data: breeder };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch breeder details' };
  }
}

export async function createBreederAction(payload: {
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  imageUrl?: string;
  nationalId?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  notes?: string;
  status?: string;
  createAccount?: boolean;
  accountEmail?: string;
  accountPassword?: string;
  accountStatus?: string;
  userLevel?: string;
}) {
  try {
    const created = await herdbookRepository.createBreeder(payload);
    revalidatePath('/breeders');
    revalidatePath('/settings/users');
    return { success: true, data: created };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create breeder account' };
  }
}

export async function updateBreederAction(id: string, updates: {
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  commune?: string;
  village?: string;
  imageUrl?: string;
  nationalId?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  notes?: string;
  status?: string;
  createAccount?: boolean;
  accountEmail?: string;
  accountPassword?: string;
  accountStatus?: string;
  userLevel?: string;
}) {
  try {
    const updated = await herdbookRepository.updateBreeder(id, updates);
    revalidatePath('/breeders');
    revalidatePath(`/breeders/${id}`);
    revalidatePath('/settings/users');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update breeder profile' };
  }
}

export async function toggleBreederAccountStatusAction(breederId: string, status: 'Active' | 'Inactive' | 'Suspended') {
  try {
    const updated = await herdbookRepository.toggleBreederAccountStatus(breederId, status);
    revalidatePath('/breeders');
    revalidatePath(`/breeders/${breederId}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update breeder login status' };
  }
}

export async function approveCertificateAction(certId: string, adminUser: { id: string; name: string; role?: string; userType?: string }) {
  try {
    const approved = await herdbookRepository.approveCertificate(certId, adminUser);
    revalidatePath('/certificates');
    revalidatePath('/settings/certificates');
    revalidatePath('/settings/audit-logs');
    return { success: true, data: approved };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to approve certificate application' };
  }
}

export async function rejectCertificateAction(certId: string, rejectionReason: string, adminUser: { id: string; name: string; role?: string; userType?: string }) {
  try {
    const rejected = await herdbookRepository.rejectCertificate(certId, rejectionReason, adminUser);
    revalidatePath('/certificates');
    revalidatePath('/settings/certificates');
    revalidatePath('/settings/audit-logs');
    return { success: true, data: rejected };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to reject certificate application' };
  }
}

export async function fetchCertificateByAnimalAction(animalType: 'Sire' | 'Dam' | 'Calf', animalId: string) {
  try {
    const cert = await herdbookRepository.getCertificateByAnimalId(animalType, animalId);
    return { success: true, data: cert };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch certificate status' };
  }
}

export async function deleteFarmAction(id: string) {
  try {
    const res = await herdbookRepository.deleteFarm(id);
    if (res.deleted) {
      revalidatePath('/farms');
    }
    return { success: res.deleted, error: res.reason };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete farm' };
  }
}

// ─────────────────────────────────────────────────────────────
// Breeder Customer / Cow Owner Server Actions
// ─────────────────────────────────────────────────────────────

export async function fetchCustomersAction(breederId?: string) {
  try {
    const customers = await herdbookRepository.getCustomers(breederId);
    return { success: true, data: customers };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customers' };
  }
}

export async function fetchCustomerByIdAction(id: string, breederId?: string) {
  try {
    const customer = await herdbookRepository.getCustomerById(id, breederId);
    if (!customer) {
      return { success: false, error: '403 Forbidden: Customer does not exist or access denied.' };
    }
    return { success: true, data: customer };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customer details' };
  }
}

export async function createCustomerAction(data: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  nationalId?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  customerType?: string;
  notes?: string;
  status?: string;
}, breederId: string) {
  try {
    const newCustomer = await herdbookRepository.createCustomer(data, breederId || 'BREEDER-01');
    revalidatePath('/customers');
    return { success: true, data: newCustomer };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create customer' };
  }
}

export async function updateCustomerAction(id: string, data: any, breederId?: string) {
  try {
    const updated = await herdbookRepository.updateCustomer(id, data, breederId);
    revalidatePath('/customers');
    revalidatePath(`/customers/${id}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update customer' };
  }
}

export async function toggleCustomerStatusAction(id: string, status: 'Active' | 'Inactive', breederId?: string) {
  try {
    const updated = await herdbookRepository.setCustomerStatus(id, status, breederId);
    revalidatePath('/customers');
    revalidatePath(`/customers/${id}`);
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update customer status' };
  }
}

export async function fetchCustomerAnimalsAction(customerId: string) {
  try {
    const animals = await herdbookRepository.getCustomerAnimals(customerId);
    return { success: true, data: animals };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customer animals' };
  }
}

export async function fetchCustomerBreedingProgramsAction(customerId: string) {
  try {
    const programs = await herdbookRepository.getCustomerBreedingPrograms(customerId);
    return { success: true, data: programs };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customer breeding programs' };
  }
}

export async function fetchCustomerCertificatesAction(customerId: string) {
  try {
    const certs = await herdbookRepository.getCustomerCertificates(customerId);
    return { success: true, data: certs };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customer certificates' };
  }
}

export async function updateUserNationalIdAction(userId: string, data: { nationalId?: string; idFrontUrl?: string; idBackUrl?: string; idVerificationStatus?: string }) {
  try {
    const updated = await herdbookRepository.updateUserNationalId(userId, data);
    revalidatePath('/settings/users');
    revalidatePath('/customers');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update National ID verification' };
  }
}

// ─────────────────────────────────────────────────────────────
// Audit Logs Server Action
// ─────────────────────────────────────────────────────────────

export async function fetchAuditLogsAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const logs = await herdbookRepository.getAuditLogs();
    return { success: true, data: logs };
  } catch (error: any) {
    console.error('[AuditLogs] fetchAuditLogsAction error:', error);
    return { success: false, error: error.message || 'Failed to fetch audit logs' };
  }
}



// ─── ROLE MANAGEMENT ACTIONS ─────────────────────────────────────────────────

/**
 * Get all roles from DB (with permissions).
 */
export async function getRolesAction() {
  try {
    const roles = await settingsRepository.getRolesFromDb();
    return { success: true, data: roles };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch roles' };
  }
}

/**
 * Get full permissions catalog from DB.
 */
export async function getPermissionsAction() {
  try {
    // Also return PERMISSION_CATALOG from types as fallback
    const { PERMISSION_CATALOG } = await import('@/types/settings.types');
    let dbPerms: any[] = [];
    try {
      dbPerms = await settingsRepository.getPermissionsCatalog();
    } catch {
      dbPerms = [];
    }
    // Merge: prefer DB data, supplement with catalog
    const merged = PERMISSION_CATALOG.map(cat => {
      const db = dbPerms.find(d => d.key === cat.key);
      return db ? { ...cat, ...db } : cat;
    });
    return { success: true, data: merged };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch permissions' };
  }
}

/**
 * Helper: resolve caller's effective permissions from DB.
 * Super Admin gets ALL permissions. Others get DB role-derived permissions.
 */
async function resolveCallerPermissions(callerUserId: string | undefined): Promise<{ isSuperAdmin: boolean; permissions: string[] }> {
  if (!callerUserId) return { isSuperAdmin: false, permissions: [] };

  const { query } = await import('@/config/database');
  const userRes = await query(
    `SELECT id, role, user_level, permissions FROM users WHERE id = $1 LIMIT 1`,
    [callerUserId]
  );
  if (userRes.rows.length === 0) return { isSuperAdmin: false, permissions: [] };

  const user = userRes.rows[0];
  const isSuperAdmin = user.role === 'Super Admin' || user.role === 'Super Administrator'
    || user.user_level === 'Super Admin';

  if (isSuperAdmin) {
    // Super Admin has all permissions — fetch from permissions table
    const allPermsRes = await query(`SELECT key FROM permissions`);
    const allKeys = allPermsRes.rows.map((r: any) => r.key);
    return { isSuperAdmin: true, permissions: allKeys };
  }

  // Regular user: get permissions from user_roles → role_permissions
  const rolePermsRes = await query(`
    SELECT DISTINCT rp.permission_key
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id AND r.status = 'Active'
    JOIN role_permissions rp ON rp.role_id = r.id
    WHERE ur.user_id = $1
  `, [callerUserId]);

  let permissions = rolePermsRes.rows.map((r: any) => r.permission_key);

  // Fallback: also check user.permissions JSON column
  if (permissions.length === 0 && user.permissions) {
    const jsonPerms = typeof user.permissions === 'string'
      ? JSON.parse(user.permissions)
      : user.permissions;
    permissions = Array.isArray(jsonPerms) ? jsonPerms : [];
  }

  return { isSuperAdmin: false, permissions };
}

/**
 * Create a new role.
 * - Super Admin: can assign any permissions.
 * - Admin with role.create: can only assign permissions they themselves hold.
 */
export async function createRoleAction(payload: {
  name: string;
  category?: string;
  description?: string;
  permissions: string[];
}, callerUserId?: string) {
  try {
    const caller = await resolveCallerPermissions(callerUserId);

    if (!caller.isSuperAdmin) {
      // Check caller has role.create permission
      if (!caller.permissions.includes('role.create')) {
        return { success: false, error: 'Forbidden: You do not have role.create permission.', statusCode: 403 };
      }
      // Authority boundary: caller cannot grant permissions they don't have
      const callerPermSet = new Set(caller.permissions.map(p => p.toLowerCase()));
      const forbidden = payload.permissions.filter(p => !callerPermSet.has(p.toLowerCase()));
      if (forbidden.length > 0) {
        return {
          success: false,
          error: `Forbidden: You cannot assign permissions you don't have: ${forbidden.join(', ')}`,
          statusCode: 403
        };
      }
    }

    const newId = `ROLE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const role = await settingsRepository.createRole({
      id: newId,
      name: payload.name,
      category: payload.category,
      description: payload.description,
      permissions: payload.permissions,
      isSystem: false,
      createdBy: callerUserId,
    });

    revalidatePath('/settings/roles');
    return { success: true, data: role };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create role' };
  }
}

/**
 * Update an existing role.
 * - Super Admin: can update any role.
 * - Admin with role.update: can only set permissions within their own scope.
 */
export async function updateRoleAction(roleId: string, payload: {
  name?: string;
  category?: string;
  description?: string;
  permissions?: string[];
}, callerUserId?: string) {
  try {
    const caller = await resolveCallerPermissions(callerUserId);

    if (!caller.isSuperAdmin) {
      if (!caller.permissions.includes('role.update')) {
        return { success: false, error: 'Forbidden: You do not have role.update permission.', statusCode: 403 };
      }
      if (payload.permissions) {
        const callerPermSet = new Set(caller.permissions.map(p => p.toLowerCase()));
        const forbidden = payload.permissions.filter(p => !callerPermSet.has(p.toLowerCase()));
        if (forbidden.length > 0) {
          return {
            success: false,
            error: `Forbidden: You cannot assign permissions you don't have: ${forbidden.join(', ')}`,
            statusCode: 403
          };
        }
      }
    }

    const role = await settingsRepository.updateRole(roleId, payload);
    revalidatePath('/settings/roles');
    return { success: true, data: role };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update role' };
  }
}

/**
 * Toggle role status (Active <-> Inactive).
 */
export async function toggleRoleStatusAction(roleId: string, status: 'Active' | 'Inactive', callerUserId?: string) {
  try {
    const caller = await resolveCallerPermissions(callerUserId);
    if (!caller.isSuperAdmin && !caller.permissions.includes('role.delete')) {
      return { success: false, error: 'Forbidden: You do not have role.delete permission.', statusCode: 403 };
    }
    await settingsRepository.setRoleStatus(roleId, status);
    revalidatePath('/settings/roles');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update role status' };
  }
}

/**
 * Delete (soft-delete) a role by setting status = 'Deleted'.
 * System roles cannot be deleted.
 */
export async function deleteRoleAction(roleId: string, callerUserId?: string) {
  try {
    const caller = await resolveCallerPermissions(callerUserId);
    if (!caller.isSuperAdmin && !caller.permissions.includes('role.delete')) {
      return { success: false, error: 'Forbidden: You do not have role.delete permission.', statusCode: 403 };
    }
    // Check if system role
    const { query } = await import('@/config/database');
    const roleRes = await query(`SELECT is_system FROM roles WHERE id = $1`, [roleId]);
    if (roleRes.rows.length > 0 && roleRes.rows[0].is_system && !caller.isSuperAdmin) {
      return { success: false, error: 'Cannot delete a system role.', statusCode: 403 };
    }
    await settingsRepository.setRoleStatus(roleId, 'Deleted');
    revalidatePath('/settings/roles');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete role' };
  }
}

/**
 * Clone an existing role into a new role.
 */
export async function cloneRoleAction(sourceRoleId: string, newName: string, callerUserId?: string) {
  try {
    const caller = await resolveCallerPermissions(callerUserId);
    if (!caller.isSuperAdmin && !caller.permissions.includes('role.create')) {
      return { success: false, error: 'Forbidden: You do not have role.create permission.', statusCode: 403 };
    }
    const newRole = await settingsRepository.cloneRole(sourceRoleId, newName, callerUserId);
    revalidatePath('/settings/roles');
    return { success: true, data: newRole };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to clone role' };
  }
}

/**
 * Assign a role to a user.
 */
export async function assignRoleToUserAction(userId: string, roleId: string, callerUserId?: string) {
  try {
    const caller = await resolveCallerPermissions(callerUserId);
    if (!caller.isSuperAdmin && !caller.permissions.includes('user.update')) {
      return { success: false, error: 'Forbidden: You do not have user.update permission.', statusCode: 403 };
    }
    await settingsRepository.assignRoleToUser(userId, roleId);
    revalidatePath('/settings/users');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to assign role' };
  }
}

/**
 * Remove a role from a user.
 */
export async function removeRoleFromUserAction(userId: string, roleId: string, callerUserId?: string) {
  try {
    const caller = await resolveCallerPermissions(callerUserId);
    if (!caller.isSuperAdmin && !caller.permissions.includes('user.update')) {
      return { success: false, error: 'Forbidden: You do not have user.update permission.', statusCode: 403 };
    }
    await settingsRepository.removeRoleFromUser(userId, roleId);
    revalidatePath('/settings/users');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove role' };
  }
}

/**
 * Get effective permissions for a specific user (union of all active role permissions).
 */
export async function getUserEffectivePermissionsAction(userId: string, callerUserId?: string) {
  try {
    const caller = await resolveCallerPermissions(callerUserId);
    if (!caller.isSuperAdmin && !caller.permissions.includes('user.view')) {
      return { success: false, error: 'Forbidden: You do not have user.view permission.', statusCode: 403 };
    }
    const permissions = await settingsRepository.getUserEffectivePermissions(userId);
    // Also fetch user role info
    const { query } = await import('@/config/database');
    const userRolesRes = await query(`
      SELECT r.id, r.name, r.category, r.status
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `, [userId]);
    return { success: true, data: { permissions, roles: userRolesRes.rows } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get effective permissions' };
  }
}

/**
 * Seed system roles and permissions catalog (run during setup).
 */
export async function seedRbacAction() {
  try {
    await settingsRepository.seedSystemRoles();
    return { success: true, message: 'RBAC seeded successfully.' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to seed RBAC' };
  }
}

/**
 * Get caller's own effective permissions (used for authority boundary UI).
 */
export async function getCallerPermissionsAction(callerUserId: string) {
  try {
    const caller = await resolveCallerPermissions(callerUserId);
    return { success: true, data: { permissions: caller.permissions, isSuperAdmin: caller.isSuperAdmin } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get caller permissions' };
  }
}
