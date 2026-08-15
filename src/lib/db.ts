import fs from 'fs';
import path from 'path';
import { ERPLivestockData, BatchItem, HealthLogItem, ExpenseItem, MasterSetup } from './types';
import { StockItem, WeightRecord, SalesRecord } from './xlsx-parser';

import { stockService } from '../services/stock.service';
import { weightService } from '../services/weight.service';
import { salesService } from '../services/sales.service';
import { batchService } from '../services/batch.service';
import { healthService } from '../services/health.service';
import { expenseService } from '../services/expense.service';
import { settingsService } from '../services/settings.service';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

/**
 * Reads data from db.json as instant fallback if PostgreSQL is offline
 */
function getJsonDbData(): ERPLivestockData {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file not found at ${dbPath}`);
  }
  const content = fs.readFileSync(dbPath, 'utf8');
  const parsed = JSON.parse(content);

  if (!parsed.batches) parsed.batches = [];
  if (!parsed.healthLogs) parsed.healthLogs = [];
  if (!parsed.expenses) parsed.expenses = [];
  if (!parsed.settings) parsed.settings = {};

  parsed.settings.breeds = parsed.settings.breeds || parsed.common?.breeds || ['គោទន្លេ', 'កាត់ Brahman', 'កាត់ Wagyu'];
  parsed.settings.locations = parsed.settings.locations || ['រទាំង', 'ព្រៃវែង', 'បន្ទាយមានជ័យ', 'ក្រោល A', 'ក្រោល B'];
  parsed.settings.buyTypes = parsed.settings.buyTypes || parsed.common?.buyTypes || ['Lumsum', 'Weight', 'Born in Farm', 'Transfer', 'Partnership'];
  parsed.settings.healthStatuses = parsed.settings.healthStatuses || parsed.common?.healthStatuses || ['Good', 'Fair', 'Poor', 'Dead'];
  parsed.settings.vaccineTypes = parsed.settings.vaccineTypes || ['Foot and Mouth', 'Brucellosis', 'Anthrax', 'Dewormer A', 'Vitamin Boost'];
  parsed.settings.feedTypes = parsed.settings.feedTypes || ['Silage', 'Concentrate Feed', 'Fresh Grass', 'Hay Mix'];
  parsed.settings.expenseCategories = parsed.settings.expenseCategories || ['Bank interest', 'forage', 'Straw', 'Water-Fire', 'Asset', 'Salary', 'Other', 'Corn / grass', 'Vaccines and medicines'];
  parsed.settings.paymentMethods = parsed.settings.paymentMethods || ['ABA Pay', 'Cash', 'Bank Transfer'];
  parsed.settings.sexes = parsed.settings.sexes || ['Male', 'Female'];
  parsed.settings.diseaseTypes = parsed.settings.diseaseTypes || ['Foot and Mouth Disease (FMD)', 'Brucellosis', 'Anthrax', 'Pneumonia', 'Parasite Infection'];
  parsed.settings.batchTypes = ['Fattening Program', 'Quanrantin & Vet Card', 'Selling Pool'];
  parsed.settings.weightUnits = parsed.settings.weightUnits || ['kg', 'lbs'];
  parsed.settings.revenueTypes = parsed.settings.revenueTypes || ['Livestock Sale', 'Manure Sale', 'Milk Sale', 'Partnership Share'];
  parsed.settings.purchaseTypes = parsed.settings.purchaseTypes || ['Purchase', 'Born in Farm', 'Transfer', 'Partnership'];
  parsed.settings.users = parsed.settings.users || [
    { id: '1', name: 'Vannak Admin', email: 'vannak@snrfarm.com', role: 'Super Admin', status: 'Active', password: 'password123' }
  ];

  return parsed as ERPLivestockData;
}

function writeJsonDbData(data: ERPLivestockData): void {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

import { feedRepository } from '../repositories/feed.repository';
import { FeedProductItem, FeedStockTransaction } from './types';

import { processDailyFeedStockOuts } from './daily-feed-cron';

import { herdbookRepository } from '../repositories/herdbook.repository';

// ─── In-memory cache for getDbData() ─────────────────────────────────────────
// Running 15+ parallel DB queries on every request is expensive. Cache the result
// for 30 seconds so rapid navigation and hot-reload don't hammer PostgreSQL.
let _dbDataCache: ERPLivestockData | null = null;
let _dbDataCacheTime = 0;
const DB_DATA_CACHE_TTL_MS = 120_000; // 2 minutes in-memory cache for fast reload

export function invalidateDbDataCache() {
  _dbDataCache = null;
  _dbDataCacheTime = 0;
}

export async function getDbData(): Promise<ERPLivestockData> {
  try {
    const jsonDb = getJsonDbData();
    const [
      stock, weightTracking, salesTracking, batches, healthLogs, expenses, settings,
      feedProducts, feedTransactions,
      sires, stockInsemination, dams, breedingPrograms, calves, herdbookRegistrations, certificates
    ] = await Promise.all([
      stockService.getAllStock().catch(() => []),
      weightService.getAllWeightRecords().catch(() => []),
      salesService.getAllSales().catch(() => []),
      batchService.getAllBatches().catch(() => []),
      healthService.getAllHealthLogs().catch(() => []),
      expenseService.getAllExpenses().catch(() => []),
      settingsService.getSettings().catch(() => ({}) as any),
      feedRepository.getProducts().catch(() => []),
      feedRepository.getTransactions().catch(() => []),
      herdbookRepository.getSires().catch(() => []),
      herdbookRepository.getStockInsemination().catch(() => []),
      herdbookRepository.getDams().catch(() => []),
      herdbookRepository.getBreedingPrograms().catch(() => []),
      herdbookRepository.getCalves().catch(() => []),
      herdbookRepository.getHerdbookRegistrations().catch(() => []),
      herdbookRepository.getCertificates().catch(() => [])
    ]);

    const common = {
      breeds: settings.breeds || [],
      healthStatuses: settings.healthStatuses || [],
      statuses: ['Active', 'Sold', 'Transferred', 'Quarantined'],
      buyTypes: settings.buyTypes || [],
      sexes: settings.sexes || []
    };

    const erpData: ERPLivestockData = {
      stock,
      weightTracking,
      salesTracking,
      common,
      batches,
      healthLogs,
      expenses,
      settings,
      feedProducts: feedProducts || [],
      feedTransactions: feedTransactions || [],
      sires,
      stockInsemination,
      dams,
      breedingPrograms,
      calves,
      herdbookRegistrations,
      certificates
    };

    // Auto-calculate daily feed stock outs based on Daily Feed Ration
    await processDailyFeedStockOuts(erpData).catch(e => console.warn('[Daily Feed Cron] Non-blocking error:', e));

    return erpData;
  } catch (err) {
    console.warn('[getDbData] PostgreSQL read error:', err);
    return getJsonDbData();
  }
}

export async function saveFeedProduct(product: FeedProductItem): Promise<FeedProductItem> {
  try {
    await feedRepository.saveProduct(product);
  } catch (err) {
    console.warn('[saveFeedProduct] DB error, writing to JSON:', err);
  }
  const jsonDb = getJsonDbData();
  if (!jsonDb.feedProducts) jsonDb.feedProducts = [];
  const idx = jsonDb.feedProducts.findIndex(p => p.id === product.id);
  if (idx >= 0) {
    jsonDb.feedProducts[idx] = product;
  } else {
    jsonDb.feedProducts.push(product);
  }
  writeJsonDbData(jsonDb);
  return product;
}

export async function deleteFeedProduct(productId: string): Promise<void> {
  try {
    await feedRepository.deleteProduct(productId);
  } catch (err) {
    console.warn('[deleteFeedProduct] DB error, removing from JSON:', err);
  }
  const jsonDb = getJsonDbData();
  if (jsonDb.feedProducts) {
    jsonDb.feedProducts = jsonDb.feedProducts.filter(p => p.id !== productId);
    writeJsonDbData(jsonDb);
  }
}

export async function addFeedTransaction(tx: FeedStockTransaction): Promise<FeedStockTransaction> {
  try {
    await feedRepository.addTransaction(tx);
  } catch (err) {
    console.warn('[addFeedTransaction] DB error, writing to JSON:', err);
  }
  const jsonDb = getJsonDbData();
  if (!jsonDb.feedTransactions) jsonDb.feedTransactions = [];
  jsonDb.feedTransactions.unshift(tx);
  writeJsonDbData(jsonDb);
  return tx;
}

// 1. Stock / Inventory Functions
export async function addStockItem(item: Omit<StockItem, 'no'>): Promise<StockItem> {
  try {
    return await stockService.createStock(item);
  } catch (err) {
    const data = getJsonDbData();
    const maxNo = data.stock.reduce((max, c) => Math.max(max, parseInt(c.no, 10) || 0), 0);
    const newItem: StockItem = { ...item, no: String(maxNo + 1).padStart(2, '0') };
    data.stock.push(newItem);
    writeJsonDbData(data);
    return newItem;
  }
}

export async function updateStockItem(id: string, updates: Partial<StockItem>): Promise<StockItem> {
  try {
    return await stockService.updateStock(id, updates);
  } catch (err) {
    const data = getJsonDbData();
    const idx = data.stock.findIndex(c => c.id === id);
    if (idx !== -1) {
      data.stock[idx] = { ...data.stock[idx], ...updates };
      writeJsonDbData(data);
      return data.stock[idx];
    }
    throw err;
  }
}

export async function deleteStockItem(cowId: string): Promise<void> {
  try {
    await stockService.deleteStock(cowId);
  } catch (err) {
    const data = getJsonDbData();
    data.stock = data.stock.filter(c => c.id !== cowId);
    writeJsonDbData(data);
  }
}

export async function updateStockLocation(oldLocation: string, newLocation: string): Promise<void> {
  try {
    await stockService.updateStockLocation(oldLocation, newLocation);
  } catch (err) {
    const data = getJsonDbData();
    data.stock.forEach(c => {
      if (c.location === oldLocation) {
        c.location = newLocation;
      }
    });
    writeJsonDbData(data);
  }
}

// 2. Weight Tracking History
export async function addWeightRecord(cowId: string, currentWeight: number, healthStatus: string, trackingDate?: string): Promise<WeightRecord> {
  try {
    return await weightService.addWeightRecord(cowId, currentWeight, healthStatus, trackingDate);
  } catch (err) {
    const data = getJsonDbData();
    const cow = data.stock.find(c => c.id === cowId);
    const oldWeight = cow ? cow.weight : 0;
    if (cow) { cow.weight = currentWeight; cow.healthStatus = healthStatus; }
    const rec: WeightRecord = {
      cowId,
      breed: cow?.breed || '',
      age: cow?.age || '',
      oldWeight,
      currentWeight,
      gainLoss: oldWeight > 0 ? (currentWeight - oldWeight) / oldWeight : 0,
      healthStatus,
      status: cow?.status || 'Active',
      trackingDate: trackingDate || new Date().toISOString()
    };
    data.weightTracking.push(rec);
    writeJsonDbData(data);
    return rec;
  }
}

export async function updateWeightRecord(cowId: string, trackingDate: string, currentWeight: number, healthStatus: string): Promise<void> {
  try {
    await weightService.updateWeightRecord(cowId, trackingDate, currentWeight, healthStatus);
  } catch (err) {
    const data = getJsonDbData();
    const rec = data.weightTracking.find(w => w.cowId === cowId && w.trackingDate === trackingDate);
    if (rec) {
      rec.currentWeight = currentWeight;
      rec.healthStatus = healthStatus;
      writeJsonDbData(data);
    }
  }
}

export async function deleteWeightRecord(cowId: string, trackingDate: string): Promise<void> {
  try {
    await weightService.deleteWeightRecord(cowId, trackingDate);
  } catch (err) {
    const data = getJsonDbData();
    data.weightTracking = data.weightTracking.filter(w => !(w.cowId === cowId && w.trackingDate === trackingDate));
    writeJsonDbData(data);
  }
}

// 3. Sales Tracking
export async function recordSale(cowId: string, unitPrice: number, saleType: 'Weight' | 'Lumpsum', salesDate?: string, buyer?: string): Promise<SalesRecord> {
  try {
    return await salesService.recordSale(cowId, unitPrice, saleType, salesDate, buyer);
  } catch (err) {
    const data = getJsonDbData();
    const cow = data.stock.find(c => c.id === cowId);
    if (cow) cow.status = 'Sold';
    const totalPrice = saleType === 'Weight' && cow ? cow.weight * unitPrice : unitPrice;
    const saleRecord: SalesRecord = {
      cowId,
      breed: cow?.breed || '',
      age: cow?.age || '',
      weight: cow?.weight || 0,
      unitPrice,
      totalPrice,
      status: 'Sold',
      salesDate: salesDate || new Date().toISOString(),
      saleType: saleType === 'Weight' ? 'Scale' : 'Lumpsum',
      buyer: buyer || 'Local Market'
    };
    data.salesTracking.push(saleRecord);
    writeJsonDbData(data);
    return saleRecord;
  }
}

export async function recordBatchSale(batchId: string, unitPrice: number, saleType: 'Weight' | 'Lumpsum', salesDate?: string): Promise<SalesRecord[]> {
  try {
    return await salesService.recordBatchSale(batchId, unitPrice, saleType, salesDate);
  } catch (err) {
    const data = getJsonDbData();
    const batch = data.batches.find(b => b.id === batchId);
    if (!batch) throw err;
    const activeCows = data.stock.filter(c => batch.cowIds.includes(c.id) && c.status.toLowerCase() === 'active');
    const records: SalesRecord[] = [];
    activeCows.forEach(cow => {
      cow.status = 'Sold';
      const totalPrice = saleType === 'Weight' ? cow.weight * unitPrice : unitPrice;
      const rec: SalesRecord = { cowId: cow.id, breed: cow.breed, age: cow.age, weight: cow.weight, unitPrice, totalPrice, status: 'Sold', salesDate: salesDate || new Date().toISOString() };
      data.salesTracking.push(rec);
      records.push(rec);
    });
    batch.status = 'Closed';
    writeJsonDbData(data);
    return records;
  }
}

export async function updateSalesRecord(cowId: string, updates: Partial<SalesRecord>): Promise<SalesRecord> {
  try {
    return await salesService.updateSalesRecord(cowId, updates);
  } catch (err) {
    const data = getJsonDbData();
    const idx = data.salesTracking.findIndex(s => s.cowId === cowId);
    if (idx !== -1) {
      data.salesTracking[idx] = { ...data.salesTracking[idx], ...updates };
      writeJsonDbData(data);
      return data.salesTracking[idx];
    }
    throw err;
  }
}

export async function deleteSalesRecord(cowId: string): Promise<void> {
  try {
    await salesService.deleteSalesRecord(cowId);
  } catch (err) {
    const data = getJsonDbData();
    data.salesTracking = data.salesTracking.filter(s => s.cowId !== cowId);
    const cow = data.stock.find(c => c.id === cowId);
    if (cow) cow.status = 'Active';
    writeJsonDbData(data);
  }
}

// 4. Batch Management
export async function createBatch(batch: Omit<BatchItem, 'cowIds'>): Promise<BatchItem> {
  try {
    return await batchService.createBatch(batch);
  } catch (err) {
    const data = getJsonDbData();
    const newBatch: BatchItem = { ...batch, cowIds: [] };
    data.batches.push(newBatch);
    writeJsonDbData(data);
    return newBatch;
  }
}

export async function updateBatch(batchId: string, updates: Partial<BatchItem>): Promise<BatchItem> {
  try {
    return await batchService.updateBatch(batchId, updates);
  } catch (err) {
    const data = getJsonDbData();
    const idx = data.batches.findIndex(b => b.id === batchId);
    if (idx !== -1) {
      data.batches[idx] = { ...data.batches[idx], ...updates };
      writeJsonDbData(data);
      return data.batches[idx];
    }
    throw err;
  }
}

export async function assignCowsToBatch(batchId: string, cowIds: string[]): Promise<BatchItem> {
  try {
    return await batchService.assignCowsToBatch(batchId, cowIds);
  } catch (err) {
    const data = getJsonDbData();
    const batch = data.batches.find(b => b.id === batchId);
    if (!batch) throw err;
    data.batches.forEach(b => { b.cowIds = b.cowIds.filter(id => !cowIds.includes(id)); });
    batch.cowIds = [...new Set([...batch.cowIds, ...cowIds])];
    writeJsonDbData(data);
    return batch;
  }
}

export async function removeCowFromBatch(batchId: string, cowId: string): Promise<BatchItem> {
  try {
    return await batchService.removeCowFromBatch(batchId, cowId);
  } catch (err) {
    const data = getJsonDbData();
    const batch = data.batches.find(b => b.id === batchId);
    if (batch) {
      batch.cowIds = batch.cowIds.filter(id => id !== cowId);
      writeJsonDbData(data);
      return batch;
    }
    throw err;
  }
}

export async function recordBatchWeights(records: { cowId: string; currentWeight: number; healthStatus: string; trackingDate?: string }[]): Promise<void> {
  try {
    await batchService.recordBatchWeights(records);
  } catch (err) {
    for (const rec of records) {
      await addWeightRecord(rec.cowId, rec.currentWeight, rec.healthStatus, rec.trackingDate);
    }
  }
}

export async function recordBatchHealthLog(batchId: string, log: Omit<HealthLogItem, 'id' | 'cowId'>): Promise<HealthLogItem[]> {
  try {
    return await batchService.recordBatchHealthLog(batchId, log);
  } catch (err) {
    const data = getJsonDbData();
    const batch = data.batches.find(b => b.id === batchId);
    if (!batch) throw err;
    const activeCows = data.stock.filter(c => batch.cowIds.includes(c.id) && c.status.toLowerCase() === 'active');
    const logs: HealthLogItem[] = [];
    activeCows.forEach(cow => {
      const newLog: HealthLogItem = { id: `HL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, cowId: cow.id, ...log };
      data.healthLogs.push(newLog);
      logs.push(newLog);
    });
    writeJsonDbData(data);
    return logs;
  }
}

export async function deleteBatch(batchId: string): Promise<void> {
  try {
    await batchService.deleteBatch(batchId);
  } catch (err) {
    const data = getJsonDbData();
    data.batches = data.batches.filter(b => b.id !== batchId);
    writeJsonDbData(data);
  }
}

// 5. Health Logs
export async function addHealthLog(log: Omit<HealthLogItem, 'id'>): Promise<HealthLogItem> {
  try {
    return await healthService.addHealthLog(log);
  } catch (err) {
    const data = getJsonDbData();
    const newLog: HealthLogItem = { ...log, id: `HL-${Math.random().toString(36).substr(2, 9).toUpperCase()}` };
    data.healthLogs.push(newLog);
    writeJsonDbData(data);
    return newLog;
  }
}

export async function updateHealthLog(logId: string, updates: Partial<HealthLogItem>): Promise<HealthLogItem> {
  try {
    return await healthService.updateHealthLog(logId, updates);
  } catch (err) {
    const data = getJsonDbData();
    const idx = data.healthLogs.findIndex(h => h.id === logId);
    if (idx !== -1) {
      data.healthLogs[idx] = { ...data.healthLogs[idx], ...updates };
      writeJsonDbData(data);
      return data.healthLogs[idx];
    }
    throw err;
  }
}

export async function deleteHealthLog(logId: string): Promise<void> {
  try {
    await healthService.deleteHealthLog(logId);
  } catch (err) {
    const data = getJsonDbData();
    data.healthLogs = data.healthLogs.filter(h => h.id !== logId);
    writeJsonDbData(data);
  }
}

// 6. Expenses
export async function addExpense(expense: Omit<ExpenseItem, 'id'>): Promise<ExpenseItem> {
  try {
    return await expenseService.addExpense(expense);
  } catch (err) {
    const data = getJsonDbData();
    const newExpense: ExpenseItem = { ...expense, id: `EXP-${Math.random().toString(36).substr(2, 9).toUpperCase()}` };
    data.expenses.push(newExpense);
    writeJsonDbData(data);
    return newExpense;
  }
}

export async function updateExpense(id: string, updates: Partial<ExpenseItem>): Promise<ExpenseItem> {
  try {
    return await expenseService.updateExpense(id, updates);
  } catch (err) {
    const data = getJsonDbData();
    const idx = data.expenses.findIndex(e => e.id === id);
    if (idx !== -1) {
      data.expenses[idx] = { ...data.expenses[idx], ...updates };
      writeJsonDbData(data);
      return data.expenses[idx];
    }
    throw err;
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    await expenseService.deleteExpense(id);
  } catch (err) {
    const data = getJsonDbData();
    data.expenses = data.expenses.filter(e => e.id !== id);
    writeJsonDbData(data);
  }
}

// 7. Master Setup / Settings
export async function updateSettings(settings: MasterSetup): Promise<MasterSetup> {
  try {
    return await settingsService.updateSettings(settings);
  } catch (err) {
    const data = getJsonDbData();
    data.settings = settings;
    writeJsonDbData(data);
    return data.settings;
  }
}
