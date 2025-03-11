import type { TransportVehicleReservationRentalCycle } from '@prisma/client';
import prisma from '../../../../../middleware/prisma';
import { TransportCustomerTransactionTypes } from '../../../../../lib/enums/transportCustomer';
import { saveCustomerTransaction } from '../../customers/saveCustomerReservationPayments';

export const saveVehicleReservationCycle = async (
  entry: TransportVehicleReservationRentalCycle,
): Promise<TransportVehicleReservationRentalCycle | null> => {
  return await saveVehicleReservationCycleEntry(entry);
};

const saveVehicleReservationCycleEntry = async (
  entry: TransportVehicleReservationRentalCycle,
): Promise<TransportVehicleReservationRentalCycle | null> => {
  return prisma.$transaction(async (tx) => {
    // 1. save cycle
    const entryCreated = await tx.transportVehicleReservationRentalCycle.create({
      data: entry,
      include: {
        vehicleReservation: true,
      },
    });

    // 2. save a customer transaction
    // const reservation = await getVehicleReservation(entry.vehicleReservationId);
    const customerTransaction = {
      reservationRentalCycleId: entryCreated.id,
      customerId: entry.customerId,
      vehicleId: entryCreated.vehicleReservation.vehicleId,
      customerTransactionTypeId: TransportCustomerTransactionTypes.Rent,
      amount: -Math.abs(entry.amount),
    };
    await saveCustomerTransaction(customerTransaction, tx);

    return entryCreated;
  });
};
