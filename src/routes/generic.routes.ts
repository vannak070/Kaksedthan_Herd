import { Router } from 'express';
import { GenericController } from '../controllers/generic.controller';

const router = Router();

router.get('/:module', GenericController.handleGetAll);
router.get('/:module/:id', GenericController.handleGetById);
router.post('/:module', GenericController.handleCreate);
router.put('/:module/:id', GenericController.handleUpdate);
router.delete('/:module/:id', GenericController.handleDelete);
router.post('/:module/:id/restore', GenericController.handleRestore);
router.post('/:module/:id/archive', GenericController.handleArchive);

export default router;
