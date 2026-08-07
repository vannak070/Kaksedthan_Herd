import { Router } from 'express';
import { breedingController } from '../controllers/breeding.controller';

const router = Router();

router.get('/', (req, res, next) => breedingController.getAll(req, res).catch(next));
router.get('/dam/:damId', (req, res, next) => breedingController.getByDamId(req, res).catch(next));
router.get('/:id', (req, res, next) => breedingController.getById(req, res).catch(next));
router.post('/', (req, res, next) => breedingController.create(req, res).catch(next));
router.put('/:id', (req, res, next) => breedingController.update(req, res).catch(next));
router.delete('/:id', (req, res, next) => breedingController.delete(req, res).catch(next));

export default router;
