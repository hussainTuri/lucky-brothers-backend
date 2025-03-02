import type { CustomerTransaction, Invoice, InvoicePayment, Prisma } from '@prisma/client';
import { getCustomer } from '../getCustomer';
import { saveInvoicePayment } from '../../invoices';
import { InvoiceWithRelations } from '../../../../types';
import { InvoiceStatusEnum } from '../../../../lib/enums/invoice';
import { updateCustomerBalance } from '../common';
import prisma from '../../../../middleware/prisma';

export const saveTransaction = async (
  transaction: CustomerTransaction,
): Promise<CustomerTransaction> => {
  transaction = await saveCustomerTransactionTransaction(transaction);
  return transaction;
};

const saveCustomerTransactionTransaction = async (transaction: CustomerTransaction) => {
  return prisma.$transaction(async (tx) => {
    const customer = await getCustomer(transaction.customerId);

    // 1. save transaction
    const createdTransaction = await tx.customerTransaction.create({
      data: transaction,
    });

    // 2. go through each pending invoice and pay it as long as there is enough balance
    const pendingInvoices = customer.invoices?.filter(
      (invoice: Invoice) => invoice.statusId === InvoiceStatusEnum.Pending,
    ) as InvoiceWithRelations[];
    pendingInvoices.sort((a, b) => a.id - b.id);

    let transactionBalance = transaction.amount;
    for (const invoice of pendingInvoices) {
      if (transactionBalance <= 0) {
        break;
      }
      const pendingAmount =
        invoice.totalAmount - (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0);
      const payment = {} as InvoicePayment;
      payment.invoiceId = invoice.id;
      payment.customerTransactionId = createdTransaction.id;
      payment.amount = transactionBalance > pendingAmount ? pendingAmount : transactionBalance;
      transactionBalance -= payment.amount;
      payment.comment = `Through transaction # ${createdTransaction.id}`;
      payment.mode = transaction.mode;
      payment.updatedById = transaction.updatedById;
      await saveInvoicePayment(tx, invoice.id, payment);
    }

    // 3. update customer balance
    await updateCustomerBalance(tx, customer.id);

    return createdTransaction;
  });
};
