import express from 'express';
import { authenticate } from '../../../../middleware/authenticate';
import {normalizeCreateData, validateCreateVehicleReservation} from '../../../../middleware/transport/vehicleReservationValidators'
import { createVehicleReservation } from './createReservation';

const router = express.Router();

router.post('/', authenticate, normalizeCreateData, validateCreateVehicleReservation, createVehicleReservation );

export default router;
