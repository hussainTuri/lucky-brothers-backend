import { Prisma, PrismaClient } from '@prisma/client';
import { ProductTypesEnum, ProductSkuPrefixEnum } from '../../../lib/enums';
import { incrementSku } from '../../../lib/utils';
import type { Product } from '@prisma/client';

const prisma = new PrismaClient();

export const updateProduct = async (product: Product): Promise<Product | null> => {
  try {
    const updateData = JSON.parse(JSON.stringify(product));
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.sku;

    const result = await prisma.product.update({
      where: {
        id: product.id,
      },
      data: updateData,
    });

    // Get last recored and compare with current record to check if history needs to be updated
    const lastRecord = await prisma.priceHistory.findFirst({
      where: {
        productId: product.id,
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (lastRecord) {
      const shouldAddHistory =
        lastRecord.buyingPrice !== product.buyingPrice ||
        lastRecord.sellingPrice !== product.sellingPrice;
      if (shouldAddHistory) {
        await addHistory(product);
      }
    } else if (product.buyingPrice || product.sellingPrice) {
      // first record
      await addHistory(product);
    }

    return result;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const addHistory = async (product: Product) => {
  await prisma.priceHistory.create({
    data: {
      productId: product.id,
      buyingPrice: product.buyingPrice ?? 0,
      sellingPrice: product.sellingPrice ?? 0,
    },
  });
};
