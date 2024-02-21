import express from 'express';
const router = express.Router();
import dailyRoutes from './daily';
import monthlyRoutes from './monthly';

router.use('/daily', dailyRoutes);
router.use('/monthly', monthlyRoutes);

export default router;
