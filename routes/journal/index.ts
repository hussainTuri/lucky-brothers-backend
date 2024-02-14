import express from 'express';
import { getJournal } from './getJournal';
import { validateQueryParams } from '../../middleware/invoiceValidators';
import { authenticate } from '../../middleware/authenticate';

const router = express.Router();

router.get('/', authenticate, validateQueryParams, getJournal);

export default router;
