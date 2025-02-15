import express from 'express';
import vehicleRoutes from './vehicle';
import customerRoutes from './customer';

const router = express.Router();

// Vehicles
router.use('/vehicles', vehicleRoutes);
router.use('/customers', customerRoutes);

export default router;
