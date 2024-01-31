import { PrismaClient } from '@prisma/client';
import type { InvoicePayment } from '@prisma/client';
import { saveInvoicePayment } from '../common';
import { getInvoice } from '../getInvoice';
import { CustomerTransactionTypesEnum } from '../../../../lib/enums';
import { updateCustomerBalance } from '../../customers/common';

const prisma = new PrismaClient();

// Only non-customer invoice payments use this
export const savePayment = async (payment: InvoicePayment): Promise<InvoicePayment> => {
  return await savePaymentTransaction(payment.invoiceId, payment);
};

const savePaymentTransaction = async (invoiceId: number, payment: InvoicePayment) => {
  return prisma.$transaction(async (tx) => {
    const createdPayment = await saveInvoicePayment(tx, invoiceId, payment);
    // Save as customer transaction - This is a safty meaure, otherwise payments(registered customers) should be made through customer payments
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
      // Update customer balance
      await updateCustomerBalance(tx, invoice.customerId);
    }

    return createdPayment;
  });
};
