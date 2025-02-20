import express from 'express';
import { authenticate } from '../../../../middleware/authenticate';
import { normalizeUpdateData, validateUpdateReservationCycle, validateDeleteReservationCycle} from '../../../../middleware/transport/vehicleReservationCycleValidators'
import { updateReservationCycle } from './updateCycle';
import { deleteReservationCycle } from './deleteCycle';

const router = express.Router();

router.delete('/:cycleId/delete', authenticate, validateDeleteReservationCycle, deleteReservationCycle);
router.put('/:cycleId/update', authenticate, normalizeUpdateData, validateUpdateReservationCycle, updateReservationCycle);
export default router;
