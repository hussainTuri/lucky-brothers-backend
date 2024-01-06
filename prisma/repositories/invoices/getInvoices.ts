import { Prisma, PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../types';
import { getRelatedData } from './getRelatedData';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

prisma.$on('query', async (e: Prisma.QueryEvent) => {
  console.log(`${e.query} ${e.params} duration: ${e.duration / 100}s`);
  // console.log(`${e.query} duration: ${e.duration/100} s`);
});

export const getInvoices = async (options: QueryOptions, sort: QuerySort) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Set time to midnight in UTC for the start of the day
  const relatedData = await getRelatedData();

  const whereStatus = Prisma.validator<Prisma.InvoiceWhereInput>()({
    ...(options?.status && options.status === 'pending'
      ? { statusId: relatedData.statuses.find((i) => i.statusName === 'Pending')?.id }
      : {}),
    ...(options?.status && options.status === 'paid'
      ? { statusId: relatedData.statuses.find((i) => i.statusName === 'Paid')?.id }
      : {}),
    ...(options?.status && options.status === 'overdue'
      ? { statusId: relatedData.statuses.find((i) => i.statusName === 'Overdue')?.id }
      : {}),
  });

  const whereToday = Prisma.validator<Prisma.InvoiceWhereInput>()({
    ...(options?.today ? { createdAt: { gte: today } } : {}),
  });

  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        payments: true,
      },
      where: {
        ...whereStatus,
        ...whereToday,
      },
      orderBy: {
        ...(sort.id && { createdAt: sort.id }),
        ...(sort.createdAt && { createdAt: sort.createdAt }),
      },
      take: options?.take || 1000,
    });
    return invoices;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
