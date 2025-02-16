import express from 'express';
import { authenticate } from '../../../../middleware/authenticate';
import {normalizeCreateData, normalizeUpdateData, validateCreateVehicleReservation, validateUpdateVehicleReservation, validateDeleteVehicleReservation} from '../../../../middleware/transport/vehicleReservationValidators'
import { createVehicleReservation } from './createReservation';
import { updateVehicleReservation } from './updateReservation';
import { deleteVehicleReservation } from './deleteReservation';

const router = express.Router();

router.post('/', authenticate, normalizeCreateData, validateCreateVehicleReservation, createVehicleReservation);
router.put('/:reservationId/update', authenticate, normalizeUpdateData, validateUpdateVehicleReservation, updateVehicleReservation);
router.delete('/:reservationId/delete', authenticate, validateDeleteVehicleReservation, deleteVehicleReservation);
export default router;
