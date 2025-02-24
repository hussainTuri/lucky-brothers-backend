import { PrismaClient, TransportCustomer } from '@prisma/client';

const prisma = new PrismaClient();

export const updateTransportCustomer = async (
  entry: TransportCustomer,
): Promise<TransportCustomer | null> => {
  return await updateTransportCustomerEntry(entry);
};

const updateTransportCustomerEntry = async (
  entry: TransportCustomer,
): Promise<TransportCustomer | null> => {
  return prisma.$transaction(async (tx) => {
    // 1 update customer
    const entryUpdated = await tx.transportCustomer.update({
      where: {
        id: entry.id,
      },
      data: {
        customerName: entry.customerName,
        contact1: entry.contact1,
        contact1Phone: entry.contact1Phone,
        contact2: entry.contact2,
        contact2Phone: entry.contact2Phone,
        phone: entry.phone,
        address: entry.address,
      },
    });

    return entryUpdated;
  });
};
