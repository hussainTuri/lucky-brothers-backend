import { PrismaClient } from '@prisma/client';
import type { Invoice as PrismaInvoice, InvoiceItem } from '@prisma/client';
import { InvoicePayload, InvoiceWithRelations } from '../../../types';
import { updateInvoiceStatus, updateProfit } from './common';
import { addToStock, removeFromStock } from '../products';
import { updateCustomerBalance } from '../customers/common';

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

export const updateInvoice = async (payload: InvoicePayload): Promise<PrismaInvoice | null> => {
  const { invoice, items } = payload;
  const dbInvoice = await prisma.invoice.findUnique({
    where: {
      id: invoice.id,
    },
    include: {
      items: true,
    },
  });

  if (!dbInvoice) {
    throw new Error('رسید نہیں ملی');
  }

  // Find matching and new and removed items between db and payload
  const matchingItems = items.filter((item) =>
    dbInvoice.items.find((i) => i.id === item.id),
  ) as InvoiceItem[];

  const newItems = items.filter(
    (item) => !dbInvoice.items.find((i) => i.id === item.id),
  ) as InvoiceItem[];

  const removedItems = dbInvoice.items.filter((item) => !items.find((i) => i.id === item.id));

  const updatedInvoice = await updateInvoiceTransaction(
    invoice as PrismaInvoice,
    matchingItems,
    newItems,
    removedItems,
    dbInvoice,
  );

  return updatedInvoice;
};

const updateInvoiceTransaction = async (
  invoice: PrismaInvoice,
  updateItems: InvoiceItem[],
  createItem: InvoiceItem[],
  removeItem: InvoiceItem[],
  invoiceBeforeUpdate: InvoiceWithRelations,
) => {
  return prisma.$transaction(async (tx) => {
    // 1. update existing items
    await Promise.all(
      updateItems.map(async (item) => {
        return tx.invoiceItem.update({
          where: {
            id: item.id,
          },
          data: {
            quantity: item.quantity,
            price: item.price,
            subTotal: item.subTotal,
          },
        });
      }),
    );

    // 2. create new items
    await Promise.all(
      createItem.map(async (item) => {
        return tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            productId: item.productId,
            quantity: item.quantity ?? 0,
            price: item.price ?? 0,
            subTotal: item.subTotal ?? 0,
          },
        });
      }),
    );

    // 3. Add stock back to inventory ( should go before removing items as there is foreign key constraint)
    await addToStock(tx, invoiceBeforeUpdate.items!);

    // 4. remove items
    await Promise.all(
      removeItem.map(async (item) => {
        return tx.invoiceItem.delete({
          where: {
            id: item.id,
          },
        });
      }),
    );

    await tx.invoicePayment.findMany({
      where: {
        invoiceId: invoice.id,
      },
    });

    // 5. update invoice
    const updatedInvoice = await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        totalAmount: invoice.totalAmount,
        dueDate: invoice.dueDate,
        comment: invoice.comment,
        driverName: invoice.driverName,
        vehicleName: invoice.vehicleName,
        vehicleRegistrationNumber: invoice.vehicleRegistrationNumber,
      },
      include: {
        items: true,
      },
    });

    // 6. status update
    await updateInvoiceStatus(tx, invoice.id);

    // 7. Remove stock from inventory
    await removeFromStock(tx, updatedInvoice.items);

    // 8. update profit
    await updateProfit(tx, updatedInvoice.id);

    // 9. update transaction
    if (invoice.customerId) {
      const transaction = await tx.customerTransaction.findFirst({
        where: {
          invoiceId: invoice.id,
        },
      });
      if (transaction) {
        await tx.customerTransaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            amount: invoice.totalAmount * -1,
          },
        });
      }

      // 10. update customer balance
      await updateCustomerBalance(tx, invoice.customerId);
    }

    return updatedInvoice;
  });
};
