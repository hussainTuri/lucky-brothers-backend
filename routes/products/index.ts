import express, { Request } from 'express';
import { getProducts } from './getProducts';
import { getProduct } from './getProduct';
import { createProduct } from './createProduct';
import { updateProduct } from './updateProduct';
import { uploadImage } from './uploadImage';
import {
  normalizeCreateData,
  normalizeUpdateData,
  validateCreateProduct,
  validateUpdateProduct,
} from '../../middleware/productValidators';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../../middleware/authenticate';
import stockRoutes from './stock';
import { getProductSales } from './getProductSales';
import { getMinimalProducts } from './getProductsMinimal';

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, process.env.IMAGE_UPLOAD_PATH as string);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const router = express.Router();

// Payments
router.use('/:productId/stock', stockRoutes);

router.get('/:productId/sales', authenticate, getProductSales);

router.get('/', authenticate, getProducts);
router.get('/minimal', authenticate, getMinimalProducts);
router.post('/', authenticate, normalizeCreateData, validateCreateProduct, createProduct);
router.post('/image', authenticate, upload.single('image'), uploadImage);
router.get('/:productId', authenticate, getProduct);
router.put('/:productId', authenticate, normalizeUpdateData, validateUpdateProduct, updateProduct);
// router.get('/related-data', getProductRelatedData); // return product types and so for client to cache

export default router;
