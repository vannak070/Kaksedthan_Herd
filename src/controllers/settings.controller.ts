import { Request, Response } from 'express';
import { settingsService } from '../services/settings.service';

export class SettingsController {
  async get(req: Request, res: Response): Promise<void> {
    const settings = await settingsService.getSettings();
    res.status(200).json({
      success: true,
      message: 'Settings retrieved successfully',
      data: settings
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    const updated = await settingsService.updateSettings(req.body);
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: updated
    });
  }

  async getByKey(req: Request, res: Response): Promise<void> {
    const key = String(req.params.key);
    const data = await settingsService.getCustomKey(key);
    res.status(200).json({
      success: true,
      message: `Setting for ${key} retrieved successfully`,
      data
    });
  }

  async setByKey(req: Request, res: Response): Promise<void> {
    const key = String(req.params.key);
    const data = await settingsService.setCustomKey(key, req.body);
    res.status(200).json({
      success: true,
      message: `Setting for ${key} updated successfully`,
      data
    });
  }
}

export const settingsController = new SettingsController();
