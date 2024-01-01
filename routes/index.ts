import express from 'express';
const router = express.Router();
import productRoutes from './products';
import customerRoutes from './customers';
import invoiceRoutes from './invoices';

router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/invoices', invoiceRoutes);

export default router;
