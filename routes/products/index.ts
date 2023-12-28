import express, { Request, RequestHandler, Response } from 'express';
import { getProducts } from './getProducts';
import { getProduct } from './getProduct';

const router = express.Router();

router.get('/', getProducts);

router.post('/', (req: Request, res: Response) => {
  console.log('Product created!', req.body);
  return res.json({ success: true });
});

router.get('/:productId', getProduct);
// router.get('/:productId', (req: Request, res: Response) => {
//   return res.json({ id: req.params.productId, name: 'Product 1' });
// });

router.put('/:productId', (req: Request, res: Response) => {
  console.log('Product updated');
  return res.json({ id: req.params.productId, name: req.body.name });
});

export default router;
