import { settingsRepository } from '../repositories/settings.repository';
import { MasterSetup } from '../lib/types';

export class SettingsService {
  async getSettings(): Promise<MasterSetup> {
    return settingsRepository.getSettings();
  }

  async updateSettings(settings: MasterSetup): Promise<MasterSetup> {
    return settingsRepository.updateSettings(settings);
  }

  async getCustomKey(key: string): Promise<any> {
    return settingsRepository.getCustomKey(key);
  }

  async setCustomKey(key: string, data: any): Promise<any> {
    return settingsRepository.setCustomKey(key, data);
  }
}

export const settingsService = new SettingsService();
