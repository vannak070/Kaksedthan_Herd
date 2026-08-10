import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { requirePermission } from '../middleware/auth.middleware';

const router = Router();

router.get('/', (req, res, next) => settingsController.get(req, res).catch(next));
router.put('/', requirePermission('manage:system'), (req, res, next) => settingsController.update(req, res).catch(next));
router.get('/key/:key', (req, res, next) => settingsController.getByKey(req, res).catch(next));
router.post('/key/:key', requirePermission('manage:system'), (req, res, next) => settingsController.setByKey(req, res).catch(next));
router.put('/key/:key', requirePermission('manage:system'), (req, res, next) => settingsController.setByKey(req, res).catch(next));

export default router;
