import { Request, Response } from 'express';
import { herdbookRepository } from '../repositories/herdbook.repository';

export class CertificateController {
  async getAllCertificates(req: Request, res: Response) {
    try {
      const certs = await herdbookRepository.getCertificates();
      res.status(200).json({ success: true, data: certs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async applyCertificate(req: Request, res: Response) {
    try {
      const { animalType, animalId } = req.body;
      if (!animalType || !animalId) {
        return res.status(400).json({ success: false, message: 'animalType and animalId are required' });
      }
      const cert = await herdbookRepository.applyCertificateForAnimal(animalType, animalId);
      res.status(201).json({ success: true, data: cert });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const certificateController = new CertificateController();
