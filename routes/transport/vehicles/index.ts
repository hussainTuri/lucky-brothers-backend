import express, {Request} from 'express';
import { authenticate } from '../../../middleware/authenticate';
import {
  normalizeCreateData,
  validateCreateVehicle,
  normalizeUpdateData,
  validateUpdateVehicle,
} from '../../../middleware/transport/vehicleValidators';
import { createVehicle } from './createVehicle';
import { getVehicles } from './getVehicles';
import { getVehicle } from './getVehicle';
import { updateVehicle } from './updateVehicle';
import reservationRoutes from './reservations';
import transactionRoutes from './transactions';
import reservationCycleRoutes from './reservationCycles';
import multer from 'multer';
import path from 'path';
import { uploadPdf } from './mulkiyaUpload';
import { createUploadsFolder } from '../../../lib/utils/fileUpload';

const router = express.Router();

// Ensure uploads directory exists
const pdfUploadPath = path.join( process.env.PDF_UPLOAD_PATH as string);
createUploadsFolder(pdfUploadPath);

// PDF Upload Configuration (for vehicle Mulkiya)
const mulkiyaStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, pdfUploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'mulkiya-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const pdfFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log('File received for upload:', file);
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const uploadMulkiya = multer({
  storage: mulkiyaStorage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 5MB limit (adjust as needed)
  }
});

router.use('/:vehicleId(\\d+)/transactions', transactionRoutes);
router.use('/:vehicleId(\\d+)/reservations', reservationRoutes);
router.use('/reservations/:reservationId(\\d+)/cycles', reservationCycleRoutes);
router.get('/', authenticate, getVehicles);
router.post('/', authenticate, normalizeCreateData, validateCreateVehicle, createVehicle);
router.put(
  '/:vehicleId(\\d+)',
  authenticate,
  normalizeUpdateData,
  validateUpdateVehicle,
  updateVehicle,
);
router.get('/:vehicleId(\\d+)', authenticate, getVehicle);
router.post('/uploadMulkiyaPdf', uploadMulkiya.single('file'), uploadPdf);

export default router;
