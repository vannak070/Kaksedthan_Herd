import { Request, Response } from 'express';
import { herdbookRepository } from '../repositories/herdbook.repository';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class CustomerController {
  // GET /api/v1/customers — List breeder's customers
  async getCustomers(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      const breederId = (user?.role === 'Super Admin' || user?.role === 'Admin') ? undefined : (user?.id || 'BREEDER-01');
      const customers = await herdbookRepository.getCustomers(breederId);
      res.status(200).json({ success: true, data: customers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch customers' });
    }
  }

  // GET /api/v1/customers/:id — Get customer detail with data access security
  async getCustomerById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;
      const breederId = (user?.role === 'Super Admin' || user?.role === 'Admin') ? undefined : (user?.id || 'BREEDER-01');
      const customer = await herdbookRepository.getCustomerById(id, breederId);

      if (!customer) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN',
          message: `403 Forbidden: Customer ${id} does not exist or does not belong to authorized breeder.`
        });
      }

      res.status(200).json({ success: true, data: customer });
    } catch (error: any) {
      res.status(403).json({ success: false, message: error.message || 'Access denied' });
    }
  }

  // POST /api/v1/customers — Create new customer under authenticated breeder
  async createCustomer(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      const breederId = user?.id || 'BREEDER-01';
      const customer = await herdbookRepository.createCustomer(req.body, breederId);
      res.status(201).json({ success: true, data: customer });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to create customer' });
    }
  }

  // PUT /api/v1/customers/:id — Update customer
  async updateCustomer(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;
      const breederId = (user?.role === 'Super Admin' || user?.role === 'Admin') ? undefined : (user?.id || 'BREEDER-01');
      const customer = await herdbookRepository.updateCustomer(id, req.body, breederId);
      res.status(200).json({ success: true, data: customer });
    } catch (error: any) {
      res.status(403).json({ success: false, message: error.message || '403 Forbidden: Cannot update customer' });
    }
  }

  // PATCH /api/v1/customers/:id/status — Toggle status (Active / Inactive)
  async setCustomerStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user;
      const breederId = (user?.role === 'Super Admin' || user?.role === 'Admin') ? undefined : (user?.id || 'BREEDER-01');
      const customer = await herdbookRepository.setCustomerStatus(id, status, breederId);
      res.status(200).json({ success: true, data: customer });
    } catch (error: any) {
      res.status(403).json({ success: false, message: error.message || '403 Forbidden: Status change denied' });
    }
  }

  // GET /api/v1/customers/:id/animals — Get customer's animals
  async getCustomerAnimals(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;
      const breederId = (user?.role === 'Super Admin' || user?.role === 'Admin') ? undefined : (user?.id || 'BREEDER-01');
      const customer = await herdbookRepository.getCustomerById(id, breederId);

      if (!customer) {
        return res.status(403).json({ success: false, message: '403 Forbidden: Access denied' });
      }

      const animals = await herdbookRepository.getCustomerAnimals(id);
      res.status(200).json({ success: true, data: animals });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/v1/customers/:id/breeding-programs — Get customer's breeding programs
  async getCustomerBreedingPrograms(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;
      const breederId = (user?.role === 'Super Admin' || user?.role === 'Admin') ? undefined : (user?.id || 'BREEDER-01');
      const customer = await herdbookRepository.getCustomerById(id, breederId);

      if (!customer) {
        return res.status(403).json({ success: false, message: '403 Forbidden: Access denied' });
      }

      const programs = await herdbookRepository.getCustomerBreedingPrograms(id);
      res.status(200).json({ success: true, data: programs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/v1/customers/:id/certificates — Get customer's certificates
  async getCustomerCertificates(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;
      const breederId = (user?.role === 'Super Admin' || user?.role === 'Admin') ? undefined : (user?.id || 'BREEDER-01');
      const customer = await herdbookRepository.getCustomerById(id, breederId);

      if (!customer) {
        return res.status(403).json({ success: false, message: '403 Forbidden: Access denied' });
      }

      const certs = await herdbookRepository.getCustomerCertificates(id);
      res.status(200).json({ success: true, data: certs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const customerController = new CustomerController();
