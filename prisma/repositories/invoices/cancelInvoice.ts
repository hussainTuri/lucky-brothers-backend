import { PrismaClient } from '@prisma/client';
import type { Invoice } from '@prisma/client';
import { addToStock } from '../products';
import { InvoiceWithRelations } from '../../../types';
import { InvoiceStatusEnum } from '../../../lib/enums/invoice';
import { updateCustomerBalance } from '../customers/common';
import { CustomerTransactionTypesEnum } from '../../../lib/enums';

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
//   console.log('------------------------------------------------------\n')
//   // console.log(`${e.query} duration: ${e.duration/100} s`);
// });

export const cancelInvoice = async (id: number, canceledById: number): Promise<Invoice | null> => {
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

  const updatedInvoice = await updateInvoiceTransaction(dbInvoice, canceledById);

  return updatedInvoice;
};

const updateInvoiceTransaction = async (invoice: InvoiceWithRelations, updatedById: number) => {
  return prisma.$transaction(async (tx) => {
    // 1. update invoice
    const updatedInvoice = await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        statusId: InvoiceStatusEnum.Cancelled,
        cancelledAt: new Date(),
        updatedById: updatedById,
      },
    });

    // 2. update stock quantity
    await addToStock(tx, invoice.items!);

    // 3. Reset canceled invoice transaction to 0
    // if we don't do this, this will count towards the customer balance
    if (invoice.customerId) {
      const transactionId = await tx.customerTransaction.findFirst({
        where: {
          invoiceId: invoice.id,
          typeId: CustomerTransactionTypesEnum.Invoice,
        },
      });
      if (transactionId) {
        await tx.customerTransaction.update({
          where: {
            id: transactionId.id,
          },
          data: {
            amount: 0,
          },
        });
      }
    }

    // 3. update customer balance
    if (invoice.customerId) await updateCustomerBalance(tx, invoice.customerId);

    return updatedInvoice;
  });
};
