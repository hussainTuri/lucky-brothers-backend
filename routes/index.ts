import express from 'express';
const router = express.Router();
import productRoutes from './products';
import customerRoutes from './customers';

router.use('/products', productRoutes);
router.use('/customers', customerRoutes);

export default router;
