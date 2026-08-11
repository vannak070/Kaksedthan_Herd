import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';

const router = Router();

// Customer / Cow Owner Management Routes
router.get('/', (req, res) => customerController.getCustomers(req, res));
router.post('/', (req, res) => customerController.createCustomer(req, res));
router.get('/:id', (req, res) => customerController.getCustomerById(req, res));
router.put('/:id', (req, res) => customerController.updateCustomer(req, res));
router.patch('/:id/status', (req, res) => customerController.setCustomerStatus(req, res));
router.get('/:id/animals', (req, res) => customerController.getCustomerAnimals(req, res));
router.get('/:id/breeding-programs', (req, res) => customerController.getCustomerBreedingPrograms(req, res));
router.get('/:id/certificates', (req, res) => customerController.getCustomerCertificates(req, res));

export default router;
