import { Prisma, PrismaClient } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../types';
import { InvoiceStatusEnum } from '../../../lib/enums/invoice';

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

export const getInvoices = async (options: QueryOptions, sort: QuerySort) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Set time to midnight in UTC for the start of the day

  const whereStatus = Prisma.validator<Prisma.InvoiceWhereInput>()({
    ...(options?.status && options.status === 'pending'
      ? { statusId: InvoiceStatusEnum.Pending }
      : {}),
    ...(options?.status && options.status === 'paid' ? { statusId: InvoiceStatusEnum.Paid } : {}),
    ...(options?.status && options.status === 'cancelled'
      ? { statusId: InvoiceStatusEnum.Cancelled }
      : {}),
    ...(options?.status && options.status === 'refunded'
      ? { statusId: InvoiceStatusEnum.Refunded }
      : {}),
  });

  const whereOverdue = Prisma.validator<Prisma.InvoiceWhereInput>()({
    ...(options?.status && options.status === 'overdue'
      ? { dueDate: { lt: today, not: null } }
      : {}),
  });

  const whereToday = Prisma.validator<Prisma.InvoiceWhereInput>()({
    ...(options?.today ? { createdAt: { gte: today } } : {}),
  });

  const [invoices, totalCount] = await Promise.all([
    prisma.invoice.findMany({
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
        ...whereOverdue,
      },
      orderBy: {
        ...(sort.id && { id: sort.id }),
        ...(sort.createdAt && { createdAt: sort.createdAt }),
      },
      skip: options?.skip || 0,
      take: options?.take || 1000,
    }),
    prisma.invoice.count({
      where: {
        ...whereStatus,
        ...whereToday,
        ...whereOverdue,
      },
    }),
  ]);

  return { invoices, totalCount };
};
