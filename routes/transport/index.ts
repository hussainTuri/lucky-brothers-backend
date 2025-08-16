import express from 'express';
import vehicleRoutes from './vehicles';
import customerRoutes from './customers';
import dashboardRoutes from './dashboard';

const router = express.Router();

// Vehicles
router.use('/vehicles', vehicleRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
