import { TransportCustomerTransactionTypes } from '../../../../../lib/enums';
import prisma from '../../../../../middleware/prisma';
import { OmitPrismaClient } from '../../../../../types';
import { deleteCustomerTransaction, getCustomerTransactionByCycleAndType } from '../../customers';
import { getReservationCycle } from './getReservationCycle';

export const deleteReservationCycleWithRelations = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    const cycle = await getReservationCycle(Number(id));

    // 1. Delete customer transaction
    const customerTransaction = await getCustomerTransactionByCycleAndType(
      cycle.id,
      TransportCustomerTransactionTypes.Rent,
      tx,
    );
    if (!customerTransaction) {
      throw new Error(
        `Customer transaction with reservationRentalCycleId: ${cycle.id} and customerTransactionTypeId: ${TransportCustomerTransactionTypes.Rent} not found.`,
      );
    }
    await deleteCustomerTransaction(customerTransaction.id, tx);

    // 2. Delete reservation cycle
    const affected = await deleteReservationCycle(cycle.id, tx);
    return { affected, message: 'Reservation cycle and customer transaction deleted.' };
  });
};

export const deleteReservationCycle = async (id: string | number, tx: OmitPrismaClient) => {
  const cycle = await tx.transportVehicleReservationRentalCycle.delete({
    where: {
      id: Number(id),
    },
  });

  return cycle;
};
