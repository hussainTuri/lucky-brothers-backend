import express, { Request, RequestHandler, Response } from 'express';
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

router.get('/', getProducts);
router.post('/', normalizeCreateData, validateCreateProduct, createProduct);
router.post('/image', upload.single('image'), uploadImage);
router.get('/:productId', getProduct);
router.put('/:productId', normalizeUpdateData, validateUpdateProduct, updateProduct);

export default router;
