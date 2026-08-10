import { Router } from 'express';
import { herdbookController } from '../controllers/herdbook.controller';

const router = Router();

router.get('/registrations', herdbookController.getHerdbookRegistrations.bind(herdbookController));
router.get('/pedigree/:animalId', herdbookController.getPedigreeByAnimalId.bind(herdbookController));

export default router;
