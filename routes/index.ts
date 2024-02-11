import express from 'express';
const router = express.Router();
import productRoutes from './products';
import customerRoutes from './customers';
import invoiceRoutes from './invoices';
import userRoutes from './users';
import useJournalRoutes from './journal';
import useDashboardRoutes from './dashboard';

router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/users', userRoutes);
router.use('/journal', useJournalRoutes);
router.use('/dashboard', useDashboardRoutes);
export default router;
