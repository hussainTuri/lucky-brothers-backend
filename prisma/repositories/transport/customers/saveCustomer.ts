import type { TransportCustomer } from '@prisma/client';
import prisma from '../../../../middleware/prisma';

export const saveTransportCustomer= async (entry: TransportCustomer): Promise<TransportCustomer | null> => {
  return await saveTransportCustomerEntry(entry);
};

const saveTransportCustomerEntry = async (entry: TransportCustomer): Promise<TransportCustomer | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 save customer
    const entryCreated = await tx.transportCustomer.create({
      data: entry,
    });

    return entryCreated;
  });
};
