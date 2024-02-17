import express from 'express';
import { getMonthlyProfits } from './getMonthlyProfits';
import { authenticate } from '../../middleware/authenticate';

const router = express.Router();

router.get('/monthly', authenticate, getMonthlyProfits);

export default router;
