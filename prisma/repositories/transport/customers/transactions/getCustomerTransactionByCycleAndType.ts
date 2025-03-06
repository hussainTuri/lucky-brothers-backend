import { OmitPrismaClient } from '../../../../../types';

/**
 * Assumptions: today customer transaction is either payment or rent. But it's optional to allow for other types of transactions in future.
 * A rent transaction is added ONLY ONCE when a cycle is created. So know for sure that there will be only one rent type transaction for a cycle.
 * So when we update a cycle and we also want to update associated customer transaction, we can find the transaction by reservationRentalCycleId, TransportCustomerTransactionTypes.Rent
 *
 * For types other than rent, there may be more zero or more transactions for a cycle.
 *
 * @param cycleId
 * @param typeId
 * @param tx
 * @returns
 */
export const getCustomerTransactionByCycleAndType = async (
  cycleId: number,
  typeId: number,
  tx: OmitPrismaClient,
) => {
  const transaction = await tx.transportCustomerTransaction.findFirst({
    where: {
      reservationRentalCycleId: cycleId,
      customerTransactionTypeId: typeId,
    },
  });

  return transaction;
};
