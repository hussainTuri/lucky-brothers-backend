import express from 'express';
import { authenticate } from '../../../../middleware/authenticate';
import {
  normalizeCreateData,
  normalizeUpdateData,
  validateCreateVehicleReservation,
  validateUpdateVehicleReservation,
  validateDeleteVehicleReservation,
} from '../../../../middleware/transport/vehicleReservationValidators';
import { createVehicleReservation } from './createReservation';
import { updateVehicleReservation } from './updateReservation';
import { deleteVehicleReservation } from './deleteReservation';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  authenticate,
  normalizeCreateData,
  validateCreateVehicleReservation,
  createVehicleReservation,
);
router.put(
  '/:reservationId(\\d+)/update',
  authenticate,
  normalizeUpdateData,
  validateUpdateVehicleReservation,
  updateVehicleReservation,
);
router.delete(
  '/:reservationId(\\d+)/delete',
  authenticate,
  validateDeleteVehicleReservation,
  deleteVehicleReservation,
);
export default router;
