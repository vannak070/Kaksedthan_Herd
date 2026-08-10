import { Router } from 'express';
import { breedingProgramController } from '../controllers/breeding_program.controller';

const router = Router();

router.get('/', breedingProgramController.getAllPrograms.bind(breedingProgramController));
router.post('/', breedingProgramController.createProgram.bind(breedingProgramController));
router.put('/:id/status', breedingProgramController.updateProgramStatus.bind(breedingProgramController));

export default router;
