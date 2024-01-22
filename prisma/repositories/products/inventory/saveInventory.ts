import { PrismaClient } from '@prisma/client';
import type { Inventory } from '@prisma/client';
import { updateStockQuantity } from '../../invoices';

const prisma = new PrismaClient();

export const saveInventory = async (inventory: Inventory): Promise<Inventory | null> => {
  return await saveInventoryTransaction(inventory);
};

const saveInventoryTransaction = async (inventory: Inventory): Promise<Inventory | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save Inventory
    await updateStockQuantity(tx, inventory.productId, inventory.quantity, 0, inventory.reason);

    const postUpdateInventory = await tx.inventory.findFirst({
      where: {
        productId: inventory.productId,
      },
      orderBy: {
        id: 'desc',
      },
    });

    // 2 update product quantity
    await tx.product.update({
      where: {
        id: inventory.productId,
      },
      data: {
        stockQuantity: postUpdateInventory?.quantity,
      },
    });

    return postUpdateInventory;
  });
};
