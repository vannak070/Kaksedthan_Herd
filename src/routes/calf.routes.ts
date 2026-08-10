import { Router } from 'express';
import { calfController } from '../controllers/calf.controller';

const router = Router();

router.get('/', calfController.getAllCalves.bind(calfController));
router.post('/confirm', calfController.confirmCalfTransaction.bind(calfController));

export default router;
