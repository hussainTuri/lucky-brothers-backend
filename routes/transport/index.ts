import express from 'express';
import vehicleRoutes from './vehicle';

const router = express.Router();

// Vehicles
router.use('/vehicles', vehicleRoutes);

export default router;
