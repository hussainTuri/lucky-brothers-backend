import type { TransportVehicleReservationRentalCycle } from '@prisma/client';
import prisma from '../../../../../middleware/prisma';
import { TransportCustomerTransactionTypes } from '../../../../../lib/enums/transportCustomer';
import { saveCustomerTransaction } from '../../customers/saveCustomerReservationPayments';
import { getVehicleReservation } from '../reservations';

export const saveVehicleReservationCycle = async (
  entry: TransportVehicleReservationRentalCycle,
): Promise<TransportVehicleReservationRentalCycle | null> => {
  return await saveVehicleReservationCycleEntry(entry);
};

const saveVehicleReservationCycleEntry = async (
  entry: TransportVehicleReservationRentalCycle,
): Promise<TransportVehicleReservationRentalCycle | null> => {
  return prisma.$transaction(async (tx) => {
    // 1. save a customer transaction
    const reservation = await getVehicleReservation(entry.vehicleReservationId);
    const customerTransaction = {
      customerId: entry.customerId,
      vehicleId: reservation.vehicleId,
      customerTransactionTypeId: TransportCustomerTransactionTypes.Rent,
      amount: -Math.abs(entry.amount),
    };
    const customerTransactionCreated = await saveCustomerTransaction(customerTransaction, tx);

    // 2 save cycle
    entry.customerTransactionId = customerTransactionCreated.id;
    const entryCreated = await tx.transportVehicleReservationRentalCycle.create({
      data: entry,
      include: {
        vehicleReservation: true,
      },
    });

    return entryCreated;
  });
};
