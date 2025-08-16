import express from 'express';
import { authenticate } from '../../../middleware/authenticate';
import { getDashboardCustomers } from './getCustomers';
import { getDashboardVehicles } from './getVehicles';
import { getDashboardStats } from './getStats';

const router = express.Router();

router.get('/customers', authenticate, getDashboardCustomers);
router.get('/vehicles', authenticate, getDashboardVehicles);
router.get('/stats', authenticate, getDashboardStats);

export default router;
