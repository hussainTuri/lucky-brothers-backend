import { ProductSkuPrefixEnum } from '../../../lib/enums';
import { incrementSku } from '../../../lib/utils';
import type { Product } from '@prisma/client';
import prisma from '../../../middleware/prisma';

export const saveProduct = async (product: Product): Promise<Product | null> => {
  product.sku = await getSku(product.productTypeId);
  product.imagePath = product.imagePath ?? '';
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
