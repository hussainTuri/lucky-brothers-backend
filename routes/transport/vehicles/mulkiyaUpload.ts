import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { response } from '../../../lib/response';

export const uploadPdf = async (req: Request, res: Response) => {
  const resp = response();
  const { file } = req;

  if (!file) {
    resp.success = false;
    resp.message = 'Failed to upload PDF';
    return res.status(400).json(resp);
  }

  // Verify it's a PDF
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf') {
    // Delete the uploaded file if it's not PDF
    fs.unlinkSync(file.path);
    resp.success = false;
    resp.message = 'Only PDF files are allowed';
    return res.status(400).json(resp);
  }

  try {
    resp.data = {
      path: path.join('uploads','pdf', file.filename),
      filename: file.filename,
      originalname: file.originalname,
      destination: file.destination,
      size: file.size,
      mimetype: file.mimetype,
    };

    return res.json(resp);
  } catch (err) {
    console.error('PDF upload error: ', err);
    // Clean up the file if something went wrong
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    resp.success = false;
    resp.message = 'Failed to process PDF upload';
    return res.status(500).json(resp);
  }
};
