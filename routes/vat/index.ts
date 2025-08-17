import express from 'express';
import { getVatReport } from './report';
import { authenticate } from '../../middleware/authenticate';

const router = express.Router();

router.get('/', authenticate, getVatReport);

export default router;
