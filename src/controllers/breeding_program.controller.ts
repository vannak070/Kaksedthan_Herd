import { Request, Response } from 'express';
import { herdbookRepository } from '../repositories/herdbook.repository';

export class BreedingProgramController {
  async getAllPrograms(req: Request, res: Response) {
    try {
      const programs = await herdbookRepository.getBreedingPrograms();
      res.status(200).json({ success: true, data: programs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createProgram(req: Request, res: Response) {
    try {
      const body = req.body;
      if (!body.sireId || !body.damId) {
        return res.status(400).json({ success: false, message: 'Sire ID and Dam ID are required' });
      }

      const id = body.id || `BP-${Date.now()}`;
      const programNumber = body.programNumber || `BP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // Calculate expected calving date if breeding date is provided (~283 days)
      let expectedCalvingDate = body.expectedCalvingDate;
      if (!expectedCalvingDate && body.breedingDate) {
        const d = new Date(body.breedingDate);
        d.setDate(d.getDate() + 283);
        expectedCalvingDate = d.toISOString().split('T')[0];
      }

      const program = await herdbookRepository.createBreedingProgram({
        ...body,
        id,
        programNumber,
        expectedCalvingDate
      });

      res.status(201).json({ success: true, data: program });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateProgramStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, actualCalvingDate, result } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }
      await herdbookRepository.updateBreedingProgramStatus(id, status, actualCalvingDate, result);
      res.status(200).json({ success: true, message: 'Program status updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const breedingProgramController = new BreedingProgramController();
