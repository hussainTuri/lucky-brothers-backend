import { PrismaClient } from '@prisma/client';
import type { Invoice, InvoicePayment } from '@prisma/client';
import { InvoiceIncludeOptions } from '../../../../types/includeOptions';
import { getInvoice } from '../getInvoice';
import { getRelatedData } from '../getRelatedData';

const prisma = new PrismaClient();

export const savePayment = async (payment: InvoicePayment): Promise<InvoicePayment> => {
  // Check if invoice ultimate invoice balance is 0, then status = paid
  const includeOptions: InvoiceIncludeOptions = {
    payments: true,
  };
  const invoice = await getInvoice(payment.invoiceId, includeOptions);
  const data = await getRelatedData();
  const balance =
    payment.amount + (invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0);
  if (balance === invoice.totalAmount) {
    invoice.statusId = data.statuses.find((i) => i.statusName === 'Paid')?.id!;
  }

  await savePaymentTransaction(invoice, payment);
  return payment;
};

const savePaymentTransaction = async (invoice: Invoice, payment: InvoicePayment) => {
  return prisma.$transaction(async (tx) => {
    // 1 save payment
    await tx.invoicePayment.create({
      data: payment,
    });

    // 2 update invoice status
    await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        statusId: invoice.statusId,
      },
    });
  });
};
