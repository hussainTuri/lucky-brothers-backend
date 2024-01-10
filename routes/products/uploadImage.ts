import { NextFunction, Request, RequestHandler, Response } from 'express';
import { response } from '../../lib/response';
import path from 'path';
import sharp from 'sharp';

export const uploadImage = async (req: Request, res: Response) => {
  const resp = response();
  const { file } = req;

  if (!file) {
    resp.success = false;
    resp.message = 'Failed to upload image';
    return res.status(500).json(resp);
  }

  // let's create thumbnail too.
  const ext = path.extname(file.originalname);
  const resizedFileName = file.filename.replace(ext, '-300' + ext);
  const resizedFilePath = path.join(file.destination, resizedFileName);

  // Let's create thumbnail
  await sharp(file.path)
    .resize(300)
    .toFormat('png')
    .toFile(resizedFilePath)
    .then((data) => {})
    .catch((err) => {
      console.error('Image upload error: ', err);
      resp.success = false;
      resp.message = 'Failed to upload image';
      return res.status(500).json(resp);
    });

  resp.data = {
    path: path.join('uploads', file.filename),
    filename: file.filename,
    destination: file.destination,
    thumbnail: path.join('uploads', resizedFileName),
  };

  return res.json(resp);
};
