import { Router } from 'express';
import { publicController } from '../controllers/public.controller';

const router = Router();

router.get('/verify/:token', publicController.verifyPublicToken.bind(publicController));
router.get('/animal/:token', publicController.verifyPublicToken.bind(publicController));

export default router;
