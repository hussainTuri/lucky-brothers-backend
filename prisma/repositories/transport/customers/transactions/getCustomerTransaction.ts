import { OmitPrismaClient } from '../../../../../types';

export const getTransportCustomerTransaction = async (
  id: number,
  tx: OmitPrismaClient,
) => {
  const transaction = await tx.transportCustomerTransaction.findUnique({
    where: {
      id,
    },
  });

  return transaction;
};
