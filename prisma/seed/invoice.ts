
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const invoiceData: Prisma.InvoiceStatusCreateInput[] = [
  {
    statusName: 'Pending',
  },
  {
    statusName: 'Paid',
  },
  {
    statusName: 'Overdue',
  },
  {
    statusName: 'Canceled',
  },
  {
    statusName: 'Refunded',
  },
];

// 1. Pending: The invoice has been sent to the customer but has not been paid yet.
// 2. Paid: The customer has made the payment, and the invoice is considered settled.
// 3. Overdue: The payment for the invoice is past the due date.
// 4. Canceled: The invoice has been canceled, possibly due to an error or change in circumstances.
// 5. Refunded: The payment for the invoice has been refunded to the customer.





