import { PrismaClient } from '@prisma/client';
import type { Invoice } from '@prisma/client';
import { getRelatedData } from './getRelatedData';
import { InvoiceWithRelations } from '../../../types';
import { updateStockQuantity } from './common';

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

export const refundInvoice = async (id: number): Promise<Invoice | null> => {
  const dbInvoice = await prisma.invoice.findUnique({
    where: {
      id: id,
    },
    include: {
      items: true,
    },
  });

  if (!dbInvoice) {
    throw new Error('رسید نہیں ملی');
  }

  const updatedInvoice = await updateInvoiceTransaction(dbInvoice);

  return updatedInvoice;
};

const updateInvoiceTransaction = async (invoice: InvoiceWithRelations) => {
  return prisma.$transaction(async (tx) => {
    const data = await getRelatedData();

    // 1. update invoice
    const updatedInvoice = await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        statusId: data.statuses.find((i) => i.statusName === 'Refunded')?.id!,
        refundedAt: new Date(),
      },
    });

    // 2. update stock quantity
    await Promise.all(
      invoice.items!.map(async (item) => {
        const reason = `Invoice #${invoice.id} - Products returned (refunded)  - Qty: ${item.quantity}`;
        await updateStockQuantity(tx, item.productId, item.quantity, invoice.id, reason);
      }),
    );

    return updatedInvoice;
  });
};
