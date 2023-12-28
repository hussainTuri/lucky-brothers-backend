import express from 'express';
const router = express.Router();
import productRoutes from './products';

const authorize = () => {
  return true;
};

router.use('/products', productRoutes);

export default router;
