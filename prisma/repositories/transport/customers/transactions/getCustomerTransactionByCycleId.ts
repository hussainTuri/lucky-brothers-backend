import { OmitPrismaClient } from '../../../../../types';

/**
 * Get customer transaction by cycle id and transaction type id. [reservationRentalCycleId,customerTransactionTypeId] is unique.
 *
 * @param reservationRentalCycleId
 * @param transactionTypeId
 * @param tx
 * @returns
 */
export const getCustomerTransactionByCycleId = async (
  reservationRentalCycleId: number,
  customerTransactionTypeId: number,
  tx: OmitPrismaClient,
) => {
  const transaction = await tx.transportCustomerTransaction.findFirst({
    where: {
      reservationRentalCycleId,
      customerTransactionTypeId,
    },
    orderBy: {
      id: 'desc',
    },
  });

  return transaction;
};
