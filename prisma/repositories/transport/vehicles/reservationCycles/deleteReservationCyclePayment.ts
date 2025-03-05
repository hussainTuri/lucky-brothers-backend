import { OmitPrismaClient } from '../../../../../types';

export const deleteReservationCyclePayment = async (id: string | number, tx: OmitPrismaClient) => {
  const cycle = await tx.transportVehicleReservationRentalCyclePayment.delete({
    where: {
      id: Number(id),
    },
  });
  return cycle;
};
