import { Router } from 'express';
import { sireController } from '../controllers/sire.controller';

const router = Router();

router.get('/', sireController.getAllSires.bind(sireController));
router.get('/:id', sireController.getSireById.bind(sireController));
router.post('/', sireController.createSire.bind(sireController));
router.put('/:id', sireController.updateSire.bind(sireController));

export default router;
