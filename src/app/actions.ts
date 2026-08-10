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

export async function fetchBreedingProgramsAction() {
  return herdbookRepository.getBreedingPrograms();
}

export async function createBreedingProgramAction(program: BreedingProgramItem) {
  const id = program.id || `BP-${Date.now()}`;
  const programNumber = program.programNumber || `BP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const res = await herdbookRepository.createBreedingProgram({ ...program, id, programNumber });
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

export async function applyCertificateAction(animalType: 'Sire' | 'Dam' | 'Calf', animalId: string) {
  const cert = await herdbookRepository.applyCertificateForAnimal(animalType, animalId);
  revalidatePath('/certificates');
  revalidatePath('/sires');
  revalidatePath('/dams');
  revalidatePath('/calves');
  return cert;
}

// ─────────────────────────────────────────────────────────────
// User Level Management Actions (Database Driven)
// ─────────────────────────────────────────────────────────────
export async function getUserLevelsAction() {
  try {
    const levels = await herdbookRepository.getUserLevels();
    return { success: true, data: levels };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch user levels' };
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
}) {
  try {
    const level = await herdbookRepository.createUserLevel(data);
    revalidatePath('/admin/user-levels');
    revalidatePath('/settings/user-levels');
    return { success: true, data: level };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create user level' };
  }
}

export async function updateUserLevelAction(id: string, updates: { name?: string; description?: string; purpose?: string; sortOrder?: number; status?: 'Active' | 'Inactive' }) {
  try {
    const level = await herdbookRepository.updateUserLevel(id, updates, 'admin');
    revalidatePath('/admin/user-levels');
    revalidatePath(`/admin/user-levels/${id}`);
    revalidatePath('/settings/user-levels');
    revalidatePath(`/settings/user-levels/${id}`);
    return { success: true, data: level };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update user level' };
  }
}

export async function setUserLevelStatusAction(id: string, status: 'Active' | 'Inactive') {
  try {
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

export async function createFarmAction(farm: { name: string; code?: string; ownerId?: string; ownerName?: string; address?: string; capacity?: number; imageUrl?: string; notes?: string }) {
  try {
    const created = await herdbookRepository.createFarm(farm);
    revalidatePath('/farms');
    revalidatePath('/settings/organization');
    return { success: true, data: created };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create farm' };
  }
}

export async function updateFarmAction(id: string, updates: { name?: string; ownerId?: string; ownerName?: string; address?: string; capacity?: number; imageUrl?: string; notes?: string; status?: string }) {
  try {
    const updated = await herdbookRepository.updateFarm(id, updates);
    revalidatePath('/farms');
    revalidatePath('/settings/organization');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update farm' };
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
// Customer / Cow Owner Server Actions
// ─────────────────────────────────────────────────────────────

export async function fetchCustomersAction() {
  try {
    const customers = await herdbookRepository.getCustomers();
    return { success: true, data: customers };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customers' };
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

