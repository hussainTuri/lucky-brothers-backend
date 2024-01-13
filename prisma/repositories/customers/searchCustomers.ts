import { Prisma, PrismaClient } from '@prisma/client';
import { SearchQuery } from '../../../types';

if (process.env.NODE_ENV === 'development') {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
}

export const searchCustomers = async (query: SearchQuery) => {
  const whereNameContains = Prisma.validator<Prisma.CustomerWhereInput>()({
    ...(query.customerName ? { customerName: { search: query.customerName } } : {}),
  });

  const wherePhoneStartsWith = Prisma.validator<Prisma.CustomerWhereInput>()({
    ...(query.customerPhone ? { phone: { startsWith: query.customerPhone } } : {}),
  });

  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [whereNameContains, wherePhoneStartsWith],
      },
      orderBy: {
        _relevance: {
          fields: ['customerName'],
          search: query.customerName ?? '',
          sort: 'asc',
        },
      },
      take: query.take,
    });
    return customers;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
