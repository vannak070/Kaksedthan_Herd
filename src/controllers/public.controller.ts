import { Request, Response } from 'express';
import { herdbookRepository } from '../repositories/herdbook.repository';

export class PublicController {
  async verifyPublicToken(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const data = await herdbookRepository.getPublicVerificationByToken(token);
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'Official Kaksedthan Herdbook record or certificate not found',
          verified: false
        });
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message, verified: false });
    }
  }
}

export const publicController = new PublicController();
