import { OmitPrismaClient } from '../../../../../types';

export const getTransportCustomerPreviousTransaction = async (
  customerId: number,
  id: number,
  tx: OmitPrismaClient,
) => {
  const lastTransaction = await tx.transportCustomerTransaction.findFirst({
    where: {
      id: {
        lt: id,
      },
      customerId,
    },
    orderBy: {
      id: 'desc',
    },
  });

  return lastTransaction;
};
