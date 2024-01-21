import { PrismaClient } from '@prisma/client';
import { DefaultArgs, PrismaClientOptions } from '@prisma/client/runtime/library';

/**
 * Pay attention to quantiySold. For adding items use positive number and for removing items use negative number.
 *
 * @param tx
 * @param productId
 * @param quantitySold
 * @param invoiceId
 * @param reason
 */
export const updateStockQuantity = async (
  tx: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  productId: number,
  quantitySold: number,
  invoiceId: number,
  reason?: string,
): Promise<void> => {
  const dbProduct = await tx.product.findUnique({
    where: {
      id: productId,
    },
  });

  const dbInventory = await tx.inventory.findFirst({
    where: {
      productId,
    },
    orderBy: {
      id: 'desc',
    },
  });

  if (!dbProduct) {
    throw new Error('پروڈکٹ نہیں ملا');
  }

  let currentInventoryQuantity = 0;
  if (dbInventory) {
    currentInventoryQuantity = dbInventory.quantity;
  }

  const newInventoryQuantity = currentInventoryQuantity + quantitySold;

  // Add inventory
  await tx.inventory.create({
    data: {
      productId: dbProduct.id,
      quantity: newInventoryQuantity,
      reason: reason || `Invoice #${invoiceId}`,
    },
  });

  // Update product stock quantity
  await tx.product.update({
    where: {
      id: dbProduct.id,
    },
    data: {
      stockQuantity: newInventoryQuantity,
    },
  });
};
