import { Prisma } from '@prisma/client';
import { QueryOptions, QuerySort } from '../../../types';
import { InvoiceStatusEnum } from '../../../lib/enums/invoice';
import prisma from '../../../middleware/prisma';

export const getInvoices = async (options: QueryOptions, sort: QuerySort) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Set time to midnight in UTC for the start of the day
  let whereCreated = {} as Prisma.InvoiceWhereInput;
  let whereVehicleRegistrationNumber = {} as Prisma.InvoiceWhereInput;

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
      ? { dueDate: { lt: today, not: null }, statusId: InvoiceStatusEnum.Pending }
      : {}),
  });

  if (options?.today) {
    whereCreated = Prisma.validator<Prisma.InvoiceWhereInput>()({
      ...(options?.today ? { createdAt: { gte: today } } : {}),
    });
  } else if (options?.startDate || options?.endDate) {
    whereCreated = {
      AND: [
        // Start Date condition
        ...(options?.startDate ? [{ createdAt: { gte: options.startDate } }] : []),
        // End Date condition
        ...(options?.endDate ? [{ createdAt: { lte: options.endDate } }] : []),
      ],
    };
  }

  if (options?.vehicleRegistrationNumber) {
    whereVehicleRegistrationNumber = Prisma.validator<Prisma.InvoiceWhereInput>()({
      ...{ vehicleRegistrationNumber: { startsWith: options.vehicleRegistrationNumber } },
    });
  }

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
        ...whereCreated,
        ...whereOverdue,
        ...whereVehicleRegistrationNumber,
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
        ...whereCreated,
        ...whereOverdue,
        ...whereVehicleRegistrationNumber,
      },
    }),
  ]);

  return { invoices, totalCount };
};
