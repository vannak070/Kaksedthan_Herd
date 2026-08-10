import { Router } from 'express';
import { damController } from '../controllers/dam.controller';

const router = Router();

router.get('/', damController.getAllDams.bind(damController));
router.get('/eligible', damController.getEligibleDams.bind(damController));
router.post('/', damController.createDam.bind(damController));

export default router;
