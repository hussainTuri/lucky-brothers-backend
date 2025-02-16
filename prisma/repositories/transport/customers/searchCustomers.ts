import { Prisma, PrismaClient } from '@prisma/client';
import { SearchQuery } from '../../../../types';

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
//   console.log(`${e.query} duration: ${e.duration/100} s`);
// });

export const searchTransportCustomers = async (query: SearchQuery) => {
  const whereNameContains: Prisma.TransportCustomerWhereInput = query.customerName
    ? { customerName: { search: `${query.customerName}*` } }
    : {}; // Add wildcard

  const wherePhoneStartsWith: Prisma.TransportCustomerWhereInput = query.customerPhone
    ? { phone: { startsWith: query.customerPhone } }
    : {};

  const customers = await prisma.transportCustomer.findMany({
    where: {
      OR: [
        ...(query.customerName ? [whereNameContains] : []),
        ...(query.customerPhone ? [wherePhoneStartsWith] : []),
      ],
    },
    orderBy: query.customerName
      ? {
          _relevance: {
            fields: ['customerName'],
            search: `${query.customerName}*`, // Add wildcard for partial matches
            sort: 'desc',
          },
        }
      : undefined,
    take: query.take,
  });

  return customers;
};
