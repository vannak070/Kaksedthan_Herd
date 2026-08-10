import { Router } from 'express';
import sireRoutes from './sire.routes';
import damRoutes from './dam.routes';
import stockInseminationRoutes from './stock_insemination.routes';
import breedingProgramRoutes from './breeding_program.routes';
import calfRoutes from './calf.routes';
import herdbookRoutes from './herdbook.routes';
import certificateRoutes from './certificate.routes';
import publicRoutes from './public.routes';

import stockRoutes from './stock.routes';
import weightRoutes from './weight.routes';
import salesRoutes from './sales.routes';
import batchRoutes from './batch.routes';
import healthRoutes from './health.routes';
import expenseRoutes from './expense.routes';
import settingsRoutes from './settings.routes';
import breedingRoutes from './breeding.routes';
import genericRoutes from './generic.routes';
import systemRoutes from './system.routes';

const router = Router();

// Core Livestock Lifecycle Feature Routes
router.use('/sires', sireRoutes);
router.use('/dams', damRoutes);
router.use('/stock-insemination', stockInseminationRoutes);
router.use('/breeding-programs', breedingProgramRoutes);
router.use('/calves', calfRoutes);
router.use('/herdbook', herdbookRoutes);
router.use('/certificates', certificateRoutes);
router.use('/public', publicRoutes);

// Legacy & Enterprise Module Routes
router.use('/stock', stockRoutes);
router.use('/weight', weightRoutes);
router.use('/sales', salesRoutes);
router.use('/batches', batchRoutes);
router.use('/health', healthRoutes);
router.use('/expenses', expenseRoutes);
router.use('/settings', settingsRoutes);
router.use('/breeding', breedingRoutes);
router.use('/system', systemRoutes);
router.use('/modules', genericRoutes);

export default router;
