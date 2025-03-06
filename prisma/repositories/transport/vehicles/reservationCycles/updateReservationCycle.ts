import type { TransportVehicleReservationRentalCycle } from '@prisma/client';
import prisma from '../../../../../middleware/prisma';
import {
  getCustomerTransactionByCycleAndType,
  updateTransportCustomerTransactionWithBalances,
} from '../../customers';
import { OmitPrismaClient } from '../../../../../types';
import { TransportCustomerTransactionTypes } from '../../../../../lib/enums/transportCustomer';

export const updateVehicleReservationCycleWithRelations = async (
  entry: TransportVehicleReservationRentalCycle,
): Promise<TransportVehicleReservationRentalCycle | null> => {
  return prisma.$transaction(async (tx) => {
    // 1. Update cycle
    const entryUpdated = await updateVehicleReservationCycle(entry, tx);

    // Update customer transaction
    // Assumptions: today customer transaction is either payment or rent. But it's optional to allow for other types of transactions in future.
    // A rent transaction is added ONLY ONCE when a cycle is created. So know for sure that there will be only one rent type transaction for a cycle.
    // So when we update a cycle and we also want to update associated customer transaction, we can find the transaction by reservationRentalCycleId, TransportCustomerTransactionTypes.Rent
    const customerTransaction = await getCustomerTransactionByCycleAndType(
      entry.id,
      TransportCustomerTransactionTypes.Rent,
      tx,
    );
    if (!customerTransaction) {
      throw new Error('Customer transaction not found');
    }

    customerTransaction.amount = -Math.abs(entry.amount);
    await updateTransportCustomerTransactionWithBalances(customerTransaction, tx);

    return entryUpdated;
  });
};

export const updateVehicleReservationCycle = async (
  entry: TransportVehicleReservationRentalCycle,
  tx: OmitPrismaClient,
): Promise<TransportVehicleReservationRentalCycle | null> => {
  const entryUpdated = await tx.transportVehicleReservationRentalCycle.update({
    where: {
      id: entry.id,
    },
    data: {
      vehicleReservationId: entry.vehicleReservationId,
      customerId: entry.customerId,
      rentFrom: entry.rentFrom,
      rentTo: entry.rentTo,
      amount: entry.amount,
      comment: entry.comment,
    },
  });

  return entryUpdated;
};
