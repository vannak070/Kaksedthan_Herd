import { Router } from 'express';
import { certificateController } from '../controllers/certificate.controller';

const router = Router();

router.get('/', certificateController.getAllCertificates.bind(certificateController));
router.post('/apply', certificateController.applyCertificate.bind(certificateController));

export default router;
