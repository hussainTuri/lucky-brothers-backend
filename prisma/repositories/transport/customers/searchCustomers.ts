import { Prisma, PrismaClient } from '@prisma/client';
import { SearchQuery } from '../../../../types';

const prisma = new PrismaClient();
// const prisma = new PrismaClient({
//   log: ['query', 'info', 'warn', 'error'],
// });

export const searchTransportCustomers = async (query: SearchQuery) => {
  const whereNameContains = Prisma.validator<Prisma.TransportCustomerWhereInput>()({
    ...(query.customerName ? { customerName: { search: query.customerName } } : {}),
  });

  const wherePhoneStartsWith = Prisma.validator<Prisma.TransportCustomerWhereInput>()({
    ...(query.customerPhone ? { phone: { startsWith: query.customerPhone } } : {}),
  });

  const customers = await prisma.transportCustomer.findMany({
    where: {
      OR: [whereNameContains, wherePhoneStartsWith],
    },
    orderBy: {
      _relevance: {
        fields: ['customerName'],
        search: query.customerName ?? '',
        sort: 'desc',
      },
    },
    take: query.take,
  });
  return customers;
};
