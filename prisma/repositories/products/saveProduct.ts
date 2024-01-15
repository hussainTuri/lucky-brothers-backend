import { Prisma, PrismaClient } from '@prisma/client';
import { ProductTypesEnum, ProductSkuPrefixEnum } from '../../../lib/enums';
import { incrementSku } from '../../../lib/utils';
import type { Product } from '@prisma/client';

// const prisma = new PrismaClient();
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});
prisma.$on('query', async (e: Prisma.QueryEvent) => {
  console.log(`${e.query} ${e.params} duration: ${e.duration / 100}s`);
  // console.log(`${e.query} duration: ${e.duration/100} s`);
});

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

    console.log('first Product', result);

    if (!result) {
      return `${ProductSkuPrefixEnum[productTypeId]}-001`;
    }

    return incrementSku(result.sku as string);
  } catch (e) {
    console.error(e);
    throw e;
  }
};
