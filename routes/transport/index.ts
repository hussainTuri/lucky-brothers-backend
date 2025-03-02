import express from 'express';
import vehicleRoutes from './vehicles';
import customerRoutes from './customers';

const router = express.Router();

// Vehicles
router.use('/vehicles', vehicleRoutes);
router.use('/customers', customerRoutes);

export default router;
