import { PrismaClient, Prisma, Product, InvoiceItem } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { maxRecords } from './seed';

const prisma = new PrismaClient();

const generateFakeInvoiceStatus = (
  statusName: string,
): Prisma.InvoiceStatusUncheckedCreateInput => {
  return {
    statusName,
  };
};

const generateFakeInvoice = (customerId?: number) => {
  return {
    customerId: customerId || faker.number.int({ min: 1, max: maxRecords.customers }),
    totalAmount: faker.number.int({ min: 100, max: 1000 }),
    dueDate: faker.date.future(),
    statusId: faker.number.int({ min: 1, max: 5 }),
    comment: faker.lorem.sentence(),
  };
};

const generateFakeInvoiceItem = (invoiceId: number, totalAmount: number) => {
  const getRandomNumber = (min: number, max: number) => Math.random() * (max - min) + min;
  const splitRatios: number[] = [];
  let remainingAmount = totalAmount;
  // Generate random split ratios
  for (let i = 0; i < 5; i++) {
    const ratio = getRandomNumber(0, 1);
    splitRatios.push(ratio);
  }
  // Calculate the total of split ratios
  const totalRatio = splitRatios.reduce((acc, ratio) => acc + ratio, 0);

  // Calculate subtotals based on the ratios
  const invoiceItems = splitRatios.map((ratio) => {
    const subTotal = Math.round((ratio / totalRatio) * totalAmount);
    remainingAmount -= subTotal;

    return {
      invoiceId,
      productId: faker.number.int({ min: 1, max: maxRecords.products }),
      quantity: faker.number.int({ min: 1, max: 2 }),
      subTotal: subTotal,
    };
  });

  // Distribute the remaining amount to the first subTotal
  invoiceItems[0].subTotal += remainingAmount;

  return invoiceItems;
};

const generateFakeInvoicePayment = (invoiceId: number, totalAmount: number) => {
  const getRandomNumber = (min: number, max: number) => Math.random() * (max - min) + min;

  let remainingAmount = totalAmount;
  let records = getRandomNumber(1, 5);
  const invoicePayments = [];

  while (remainingAmount > 0 && records > 0) {
    const subTotal = getRandomNumber(1, remainingAmount);
    remainingAmount -= subTotal;

    invoicePayments.push({
      invoiceId,
      amount: Math.round(subTotal),
      comment: faker.lorem.sentence(),
    });
    records--;
  }

  return invoicePayments;
};

export const seedInvoices = async () => {
  // See Invoice Statuses
  const invoiceStatuses = ['Pending', 'Paid', 'Overdue', 'Cancelled', 'Refunded'];
  await prisma.invoiceStatus.createMany({
    data: invoiceStatuses.map((statusName) => generateFakeInvoiceStatus(statusName)),
  });

  // Seed Invoices
  const invoices = Array.from({ length: maxRecords.invoices }, () => generateFakeInvoice());
  const createdInvoices = await prisma.invoice.createMany({ data: invoices });
  if (createdInvoices?.count > 0) {
    const invoiceIds = await prisma.invoice.findMany({
      select: {
        id: true,
        totalAmount: true,
      },
    });
    // Seeed Invoice Items
    const invoiceItems = invoiceIds.flatMap((invoice: any) =>
      generateFakeInvoiceItem(invoice.id, invoice.totalAmount),
    );
    const createdInvoiceItems = await prisma.invoiceItem.createMany({ data: invoiceItems });

    // Seed InvoicePayments
    const invoicePayments = invoiceIds.flatMap((invoice) =>
      generateFakeInvoicePayment(invoice.id, invoice.totalAmount),
    );
    await prisma.invoicePayment.createMany({ data: invoicePayments });
  }
};

// 1. Pending: The invoice has been sent to the customer but has not been paid yet.
// 2. Paid: The customer has made the payment, and the invoice is considered settled.
// 3. Overdue: The payment for the invoice is past the due date.
// 4. Canceled: The invoice has been canceled, possibly due to an error or change in circumstances.
// 5. Refunded: The payment for the invoice has been refunded to the customer.
