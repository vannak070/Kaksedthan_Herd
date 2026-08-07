import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';

const router = Router();

router.get('/', (req, res, next) => settingsController.get(req, res).catch(next));
router.put('/', (req, res, next) => settingsController.update(req, res).catch(next));
router.get('/key/:key', (req, res, next) => settingsController.getByKey(req, res).catch(next));
router.post('/key/:key', (req, res, next) => settingsController.setByKey(req, res).catch(next));
router.put('/key/:key', (req, res, next) => settingsController.setByKey(req, res).catch(next));

export default router;
