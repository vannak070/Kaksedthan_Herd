import { StockItem, WeightRecord, SalesRecord } from './stock.types';
import { BatchItem } from './batch.types';
import { HealthLogItem } from './health.types';
import { ExpenseItem } from './finance.types';
import { MasterSetup } from './settings.types';
import { FeedProductItem, FeedStockTransaction } from './feed.types';

export * from './stock.types';
export * from './batch.types';
export * from './health.types';
export * from './finance.types';
export * from './settings.types';
export * from './feed.types';
export * from './breeding.types';

export interface ERPLivestockData {
  stock: StockItem[];
  weightTracking: WeightRecord[];
  salesTracking: SalesRecord[];
  common: Record<string, unknown>; // original reference sheets
  batches: BatchItem[];
  healthLogs: HealthLogItem[];
  expenses: ExpenseItem[];
  settings: MasterSetup;
  feedProducts?: FeedProductItem[];
  feedTransactions?: FeedStockTransaction[];
  breedingRecords?: import('./breeding.types').BreedingRecord[];
}
