import { Request, Response } from 'express';
import { herdbookRepository } from '../repositories/herdbook.repository';

export class DamController {
  async getAllDams(req: Request, res: Response) {
    try {
      const dams = await herdbookRepository.getDams();
      res.status(200).json({ success: true, data: dams });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getEligibleDams(req: Request, res: Response) {
    try {
      const eligible = await herdbookRepository.getEligibleDams();
      res.status(200).json({ success: true, data: eligible });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createDam(req: Request, res: Response) {
    try {
      const body = req.body;
      if (!body.breed) {
        return res.status(400).json({ success: false, message: 'Dam breed is required' });
      }
      const damId = body.id || `DAM-${Math.floor(100 + Math.random() * 900)}`;
      const dam = await herdbookRepository.createDam({ ...body, id: damId });
      res.status(201).json({ success: true, data: dam });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const damController = new DamController();
