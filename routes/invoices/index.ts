import express, { Request, RequestHandler, Response } from 'express';
import { getRelatedData } from './getRelatedData';
const router = express.Router();

router.get('/related-data', getRelatedData);

export default router;
