import express from 'express';
import { getCashes } from './getCash';
import { authenticate } from '../../middleware/authenticate';
import {
  normalizeCreateData,
  normalizeUpdateData,
  validateCreateCash,
  validateUpdateCash,
} from '../../middleware/cashValidators';
import { createCash } from './createCash';
import { updateCash } from './updateCash';

const router = express.Router();

router.get('/', authenticate, getCashes);
router.post('/', authenticate, normalizeCreateData, validateCreateCash, createCash);
router.post('/:cashId/update', authenticate, normalizeUpdateData, validateUpdateCash, updateCash);
export default router;
