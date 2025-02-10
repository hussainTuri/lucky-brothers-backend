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

const router = express.Router();

router.get('/', authenticate, getVehicles);
router.get('/:vehicleId', authenticate, getVehicle);
router.post('/', authenticate, normalizeCreateData, validateCreateVehicle, createVehicle);
router.put('/:vehicleId', authenticate, normalizeUpdateData, validateUpdateVehicle, updateVehicle);

export default router;
