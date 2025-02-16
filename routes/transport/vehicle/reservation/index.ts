import express from 'express';
import { authenticate } from '../../../../middleware/authenticate';
import {normalizeCreateData, normalizeUpdateData, validateCreateVehicleReservation, validateUpdateVehicleReservation} from '../../../../middleware/transport/vehicleReservationValidators'
import { createVehicleReservation } from './createReservation';
import { updateVehicleReservation } from './updateReservation';

const router = express.Router();

router.post('/', authenticate, normalizeCreateData, validateCreateVehicleReservation, createVehicleReservation );
router.put('/:reservationId/update', authenticate, normalizeUpdateData, validateUpdateVehicleReservation, updateVehicleReservation );

export default router;
