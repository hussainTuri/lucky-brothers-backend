import { PrismaClient } from '@prisma/client';
import { DefaultArgs, PrismaClientOptions } from '@prisma/client/runtime/library';

export const getRemainingStockQuantity = async (
  tx: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  productId: number,
): Promise<number> => {
  const stockQuantity = await tx.productStock.aggregate({
    where: {
      productId: productId,
    },
    _sum: {
      remainingQuantity: true,
    },
  });

  return stockQuantity._sum.remainingQuantity || 0;
};
