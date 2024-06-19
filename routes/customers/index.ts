import express, { Request } from 'express';
import { getCustomers } from './getCustomers';
import { getCustomer } from './getCustomer';
import { searchCustomers } from './searchCustomers';
import { updateCustomer } from './updateCustomer';
import { uploadImage } from './uploadImage';
import {
  cleanSearchInput,
  normalizeCreateData,
  normalizeUpdateData,
  validateCreateCustomer,
  validateUpdateCustomer,
} from '../../middleware/customerValidators';
import { createCustomer } from './createCustomer';
import { authenticate } from '../../middleware/authenticate';
import transactionRoutes from './transactions';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, process.env.IMAGE_UPLOAD_PATH as string);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'customer-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const router = express.Router();

router.get('/', authenticate, getCustomers);
router.post('/', authenticate, normalizeCreateData, validateCreateCustomer, createCustomer);

// Transactions
router.use('/', transactionRoutes);
router.get('/:customerId', authenticate, getCustomer);
router.post('/search', authenticate, cleanSearchInput, searchCustomers);
router.post('/image', authenticate, upload.single('image'), uploadImage);

router.put(
  '/:customerId',
  authenticate,
  normalizeUpdateData,
  validateUpdateCustomer,
  updateCustomer,
);

export default router;
