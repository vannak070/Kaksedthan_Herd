import { Request, Response } from 'express';
import { herdbookRepository } from '../repositories/herdbook.repository';

export class CalfController {
  async getAllCalves(req: Request, res: Response) {
    try {
      const calves = await herdbookRepository.getCalves();
      res.status(200).json({ success: true, data: calves });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async confirmCalfTransaction(req: Request, res: Response) {
    try {
      const body = req.body;
      if (!body.sireId || !body.damId || !body.sex || !body.breed) {
        return res.status(400).json({ success: false, message: 'Sire ID, Dam ID, Sex, and Breed are required' });
      }

      // Validate Pedigree Parentage Relationships
      const val = herdbookRepository.validatePedigreeRelationships(body.id, body.sireId, body.damId);
      if (!val.valid) {
        return res.status(400).json({ success: false, message: val.error });
      }

      const calfId = body.id || `CLF-2026-${Math.floor(100 + Math.random() * 900)}`;
      const result = await herdbookRepository.confirmCalfTransaction({ ...body, id: calfId });

      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const calfController = new CalfController();
