import { TransportCustomerTransactionTypes } from '../../../../../lib/enums/transportCustomer';
import prisma from '../../../../../middleware/prisma';
import { OmitPrismaClient } from '../../../../../types';
import { deleteCustomerTransaction, getCustomerTransactionByCycleId } from '../../customers';

export const deleteReservationCycleWithRelations = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    // 1. Delete reservation cycle
    const affected = await deleteReservationCycle(id, tx);

    // 2. Delete customer transaction
    const customerTransaction = await getCustomerTransactionByCycleId(Number(id), TransportCustomerTransactionTypes.Rent, tx);
    if (!customerTransaction) {
      return { affected, message: 'Reservation cycle deleted, no customer transaction found.' };
    }
    await deleteCustomerTransaction(customerTransaction.customerId, customerTransaction.id, tx);

    return { affected, message: 'Reservation cycle and customer transaction deleted.' };
  });
};

export const deleteReservationCycle = async (id: string, tx: OmitPrismaClient) => {
  const cycle = await tx.transportVehicleReservationRentalCycle.delete({
    where: {
      id: Number(id),
    },
  });

  return cycle;
};
