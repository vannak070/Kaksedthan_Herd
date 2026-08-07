import { ModuleConfig } from './types';
import { animalsConfig } from './animals.config';
import { breedingConfig } from './breeding.config';
import { healthConfig } from './health.config';
import { weightConfig } from './weight.config';
import { batchesConfig } from './batches.config';
import { feedConfig } from './feed.config';
import { expensesConfig } from './expenses.config';
import { salesConfig } from './sales.config';

export * from './types';
export {
  animalsConfig,
  breedingConfig,
  healthConfig,
  weightConfig,
  batchesConfig,
  feedConfig,
  expensesConfig,
  salesConfig,
};

export const modulesRegistry: Record<string, ModuleConfig> = {
  animals: animalsConfig,
  breeding: breedingConfig,
  health: healthConfig,
  weight: weightConfig,
  batches: batchesConfig,
  feed: feedConfig,
  expenses: expensesConfig,
  sales: salesConfig,
};

export function getModuleConfig(moduleName: string): ModuleConfig | undefined {
  return modulesRegistry[moduleName.toLowerCase()];
}
