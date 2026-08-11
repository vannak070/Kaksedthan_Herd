import { Request, Response } from 'express';
import { herdbookRepository } from '../repositories/herdbook.repository';

export class HerdbookController {
  async getHerdbookRegistrations(req: Request, res: Response) {
    try {
      const registrations = await herdbookRepository.getHerdbookRegistrations();
      res.status(200).json({ success: true, data: registrations });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getPedigreeByAnimalId(req: Request, res: Response) {
    try {
      const animalId = req.params.animalId as string;
      const pedigree = await herdbookRepository.getPedigreeByAnimalId(animalId);
      res.status(200).json({ success: true, data: pedigree });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const herdbookController = new HerdbookController();
