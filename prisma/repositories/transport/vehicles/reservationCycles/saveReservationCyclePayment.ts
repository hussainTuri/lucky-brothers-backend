import { TransportVehicleReservationRentalCyclePayment } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';
import prisma from '../../../../../middleware/prisma';

export const saveVehicleReservationCyclePayment = async (
  entry: TransportVehicleReservationRentalCyclePayment,
): Promise<TransportVehicleReservationRentalCyclePayment | null> => {
  return prisma.$transaction(async (tx) => {
    return saveVehicleReservationCyclePaymentEntry(entry, tx);
  });
};

export const saveVehicleReservationCyclePaymentEntry = async (
  entry: TransportVehicleReservationRentalCyclePayment,
  tx: OmitPrismaClient,
): Promise<TransportVehicleReservationRentalCyclePayment | null> => {
  const entryCreated = await tx.transportVehicleReservationRentalCyclePayment.create({
    data: entry,
  });

  return entryCreated;
};
