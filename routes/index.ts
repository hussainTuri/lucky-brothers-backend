import express from 'express';
const router = express.Router();
import productRoutes from './products';
import customerRoutes from './customers';
import invoiceRoutes from './invoices';
import userRoutes from './users';

router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/users', userRoutes);
export default router;
