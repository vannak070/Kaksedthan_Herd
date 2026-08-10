import { Router } from 'express';
import { stockInseminationController } from '../controllers/stock_insemination.controller';

const router = Router();

router.get('/', stockInseminationController.getAllStockInsemination.bind(stockInseminationController));
router.post('/', stockInseminationController.createStockInsemination.bind(stockInseminationController));
router.put('/:id', stockInseminationController.updateStockInsemination.bind(stockInseminationController));

export default router;
