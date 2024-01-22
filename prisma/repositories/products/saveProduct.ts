import { PrismaClient } from '@prisma/client';
import { ProductSkuPrefixEnum } from '../../../lib/enums';
import { incrementSku } from '../../../lib/utils';
import type { Product } from '@prisma/client';

const prisma = new PrismaClient();
// const prisma = new PrismaClient({
//   log: [
//     {
//       emit: 'event',
//       level: 'query',
//     },
//   ],
// });
// prisma.$on('query', async (e: Prisma.QueryEvent) => {
//   console.log(`${e.query} ${e.params} duration: ${e.duration / 100}s`);
//   // console.log(`${e.query} duration: ${e.duration/100} s`);
// });

export const saveProduct = async (product: Product): Promise<Product | null> => {
  product.sku = await getSku(product.productTypeId as number);
  product.imagePath = product.imagePath ?? 'src/assets/no-image.jpg';
  product.productName = product.productName;
  const result = await prisma.product.create({
    data: product,
  });
  return result;
};

export const getSku = async (productTypeId: number) => {
  const result = await prisma.product.findFirst({
    where: {
      sku: {
        startsWith: ProductSkuPrefixEnum[productTypeId],
      },
    },
    orderBy: {
      id: 'desc',
    },
  });

  if (!result) {
    return `${ProductSkuPrefixEnum[productTypeId]}-001`;
  }

  return incrementSku(result.sku as string);
};
