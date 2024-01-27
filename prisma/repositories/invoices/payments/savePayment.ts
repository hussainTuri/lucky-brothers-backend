import { PrismaClient } from '@prisma/client';
import type { InvoicePayment } from '@prisma/client';
import { saveInvoicePayment } from '../common';
import { getInvoice } from '../getInvoice';
import { CustomerTransactionTypesEnum } from '../../../../lib/enums';

const prisma = new PrismaClient();

// The API using this function is not used in the app anymore. Paymnents for non-customer invoices are not supported.
// where for registered customers, payments are added as customer transactions.
export const savePayment = async (payment: InvoicePayment): Promise<InvoicePayment> => {
  return await savePaymentTransaction(payment.invoiceId, payment);
};

const savePaymentTransaction = async (invoiceId: number, payment: InvoicePayment) => {
  return prisma.$transaction(async (tx) => {
    const createdPayment = await saveInvoicePayment(tx, invoiceId, payment);
    // Save as customer transaction
    const invoice = await getInvoice(invoiceId);
    if (invoice.customerId) {
      await tx.customerTransaction.create({
        data: {
          customerId: invoice.customerId,
          typeId: CustomerTransactionTypesEnum.Payment,
          amount: payment.amount,
          comment: `Added to invoice #${invoice.id} as invoice payment`,
        },
      });
    }

    return createdPayment;
  });
};
