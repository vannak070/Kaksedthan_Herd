import { Request, Response } from 'express';
import { breedingRepository } from '../repositories/breeding.repository';

export class BreedingController {
  async getAll(req: Request, res: Response) {
    const records = await breedingRepository.findAll();
    res.json({ success: true, data: records });
  }

  async getById(req: Request, res: Response) {
    const id = String(req.params.id);
    const record = await breedingRepository.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Breeding record not found' });
    }
    res.json({ success: true, data: record });
  }

  async getByDamId(req: Request, res: Response) {
    const damId = String(req.params.damId);
    const records = await breedingRepository.findByDamId(damId);
    res.json({ success: true, data: records });
  }

  async create(req: Request, res: Response) {
    const newRecord = await breedingRepository.create(req.body);
    res.status(201).json({ success: true, data: newRecord });
  }

  async update(req: Request, res: Response) {
    const id = String(req.params.id);
    const updated = await breedingRepository.update(id, req.body);
    res.json({ success: true, data: updated });
  }

  async delete(req: Request, res: Response) {
    const id = String(req.params.id);
    const success = await breedingRepository.delete(id);
    res.json({ success });
  }
}

export const breedingController = new BreedingController();
