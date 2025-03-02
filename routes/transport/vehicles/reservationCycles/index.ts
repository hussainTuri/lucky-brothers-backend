import express from 'express';
import { authenticate } from '../../../../middleware/authenticate';
import {
  normalizeUpdateData,
  normalizeCreateData,
  validateUpdateReservationCycle,
  validateCreateReservationCycle,
  validateDeleteReservationCycle,
} from '../../../../middleware/transport/vehicleReservationCycleValidators';
import { updateReservationCycle } from './updateCycle';
import { deleteReservationCycle } from './deleteCycle';
import { createReservationCycle } from './createCycle';

const router = express.Router();

router.post(
  '/',
  authenticate,
  normalizeCreateData,
  validateCreateReservationCycle,
  createReservationCycle,
);
router.delete(
  '/:cycleId/delete',
  authenticate,
  validateDeleteReservationCycle,
  deleteReservationCycle,
);
router.put(
  '/:cycleId/update',
  authenticate,
  normalizeUpdateData,
  validateUpdateReservationCycle,
  updateReservationCycle,
);
export default router;
