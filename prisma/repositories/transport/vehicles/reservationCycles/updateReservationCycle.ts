import type { TransportVehicleReservationRentalCycle } from '@prisma/client';
import prisma from '../../../../../middleware/prisma';
import {
  getTransportCustomerTransaction,
  updateTransportCustomerTransactionWithBalances,
} from '../../customers';
import { OmitPrismaClient } from '../../../../../types';

export const updateVehicleReservationCycleWithRelations = async (
  entry: TransportVehicleReservationRentalCycle,
): Promise<TransportVehicleReservationRentalCycle | null> => {
  return prisma.$transaction(async (tx) => {
    // 1. Update cycle
    const entryUpdated = await updateVehicleReservationCycle(entry, tx);

    // Update customer transaction
    const customerTransaction = await getTransportCustomerTransaction(
      entry.customerTransactionId,
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
