import express from 'express';
import { getDashboard } from './getDashboard';
import { authenticate } from '../../middleware/authenticate';

const router = express.Router();

router.get('/', authenticate, getDashboard);

export default router;
