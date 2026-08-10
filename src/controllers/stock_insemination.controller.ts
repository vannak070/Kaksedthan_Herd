import { Request, Response } from 'express';
import { herdbookRepository } from '../repositories/herdbook.repository';

export class StockInseminationController {
  async getAllStockInsemination(req: Request, res: Response) {
    try {
      const list = await herdbookRepository.getStockInsemination();
      res.status(200).json({ success: true, data: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async createStockInsemination(req: Request, res: Response) {
    try {
      const body = req.body;
      if (!body.sireId) {
        return res.status(400).json({ success: false, message: 'sireId is required' });
      }
      const semId = body.id || `SEM-${Math.floor(100 + Math.random() * 900)}`;
      const item = await herdbookRepository.createStockInsemination({ ...body, id: semId });
      res.status(201).json({ success: true, data: item });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateStockInsemination(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await herdbookRepository.updateStockInsemination(id, req.body);
      res.status(200).json({ success: true, message: 'Insemination stock updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const stockInseminationController = new StockInseminationController();
