import { PrismaClient } from '@prisma/client';
import { InvoiceStatusEnum } from '../../../../lib/enums/invoice';
import { updateInvoiceStatus } from '../../invoices';
import { updateCustomerBalance } from '../common';
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

export const deleteTransaction = async (id: number) => {
  return prisma.$transaction(async (tx) => {
    // 1. Get all invoice payments where this transaction was used - exclude cancelled and refunded invoices
    const invoicePayments = await tx.invoicePayment.findMany({
      where: {
        AND: [
          {
            customerTransactionId: id,
          },
          {
            customerTransactionId: { not: null },
          },
          {
            invoice: {
              statusId: {
                notIn: [InvoiceStatusEnum.Cancelled, InvoiceStatusEnum.Refunded],
              },
            },
          },
        ],
      },
    });

    // 2. Delete invoice payments and re-evaluate invoice status
    if (invoicePayments) {
      for (const payment of invoicePayments) {
        await tx.invoicePayment.delete({
          where: {
            id: payment.id,
          },
        });

        // 3. update invoice status
        await updateInvoiceStatus(tx, payment.invoiceId);
      }
    }

    // 4. delete transaction
    const deletedTransaction = await tx.customerTransaction.delete({
      where: {
        id: id,
      },
    });

    // 5. update customer balance
    await updateCustomerBalance(tx, deletedTransaction.customerId);

    return deletedTransaction;
  });
};
