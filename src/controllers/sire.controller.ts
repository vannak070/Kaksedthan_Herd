import { Request, Response } from 'express';
import { herdbookRepository } from '../repositories/herdbook.repository';

export class SireController {
  async getAllSires(req: Request, res: Response) {
    try {
      const sires = await herdbookRepository.getSires();
      res.status(200).json({ success: true, data: sires });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getSireById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const sire = await herdbookRepository.getSireById(id);
      if (!sire) {
        return res.status(404).json({ success: false, message: 'Sire not found' });
      }
      res.status(200).json({ success: true, data: sire });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createSire(req: Request, res: Response) {
    try {
      const body = req.body;
      if (!body.name || !body.breed) {
        return res.status(400).json({ success: false, message: 'Sire name and breed are required' });
      }
      const sireId = body.id || `SIR-${Math.floor(100 + Math.random() * 900)}`;
      const sire = await herdbookRepository.createSire({ ...body, id: sireId });
      res.status(201).json({ success: true, data: sire });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateSire(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const sire = await herdbookRepository.updateSire(id, req.body);
      res.status(200).json({ success: true, data: sire });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const sireController = new SireController();
