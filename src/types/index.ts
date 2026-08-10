import { StockItem, WeightRecord, SalesRecord } from './stock.types';
import { BatchItem } from './batch.types';
import { HealthLogItem } from './health.types';
import { ExpenseItem } from './finance.types';
import { MasterSetup } from './settings.types';
import { FeedProductItem, FeedStockTransaction } from './feed.types';
import {
  SireItem,
  StockInseminationItem,
  DamItem,
  BreedingProgramItem,
  CalfItem,
  HerdbookRegistrationItem,
  PedigreeTree,
  HerdbookCertificateItem
} from './breeding.types';

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
  common: Record<string, unknown>;
  batches: BatchItem[];
  healthLogs: HealthLogItem[];
  expenses: ExpenseItem[];
  settings: MasterSetup;
  feedProducts?: FeedProductItem[];
  feedTransactions?: FeedStockTransaction[];
  sires?: SireItem[];
  stockInsemination?: StockInseminationItem[];
  dams?: DamItem[];
  breedingPrograms?: BreedingProgramItem[];
  calves?: CalfItem[];
  herdbookRegistrations?: HerdbookRegistrationItem[];
  pedigrees?: PedigreeTree[];
  certificates?: HerdbookCertificateItem[];
}
