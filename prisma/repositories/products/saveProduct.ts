import { Prisma, PrismaClient } from '@prisma/client';
import { ProductTypesEnum, ProductSkuPrefixEnum } from '../../../lib/enums';
import { incrementSku } from '../../../lib/utils';
import type { Product } from '@prisma/client';

const prisma = new PrismaClient();

export const saveProduct = async (product: Product): Promise<Product | null> => {
  try {
    product.sku = await getSku(product.productTypeId as number);
    product.imagePath = product.imagePath ?? 'src/assets/no-image.jpg';
    const result = await prisma.product.create({
      data: product,
    });
    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getSku = async (productTypeId: number) => {
  try {
    const result = await prisma.product.findFirst({
      where: {
        productTypeId: productTypeId,
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (!result) {
      return `${ProductSkuPrefixEnum[productTypeId]}-001`;
    }

    return incrementSku(result.sku as string);
  } catch (e) {
    console.error(e);
    throw e;
  }
};
