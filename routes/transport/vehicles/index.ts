import express from 'express';
import { authenticate } from '../../../middleware/authenticate';
import {
  normalizeCreateData,
  validateCreateVehicle,
  normalizeUpdateData,
  validateUpdateVehicle
} from '../../../middleware/transport/vehicleValidators';
import { createVehicle } from './createVehicle';
import { getVehicles } from './getVehicles';
import { getVehicle } from './getVehicle';
import { updateVehicle } from './updateVehicle';
import reservationRoutes from './reservations';
import reservationCycleRoutes from './reservationCycles';

const router = express.Router();

router.use('/:vehicleId(\\d+)/reservations', reservationRoutes);
router.use('/reservations/:reservationId(\\d+)/cycles', reservationCycleRoutes);
router.get('/', authenticate, getVehicles);
router.post('/', authenticate, normalizeCreateData, validateCreateVehicle, createVehicle);
router.put('/:vehicleId(\\d+)', authenticate, normalizeUpdateData, validateUpdateVehicle, updateVehicle);
router.get('/:vehicleId(\\d+)', authenticate, getVehicle);


export default router;
