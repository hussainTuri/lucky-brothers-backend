import prisma from '../../../../../middleware/prisma';

export const getReservationCyclePaidAmount = async (id: string) => {
  const payments = await prisma.transportVehicleReservationRentalCyclePayment.findMany({
    where: {
      vehicleReservationRentalCycleId: Number(id),
    },
  });

  return payments.reduce((acc, payment) => acc + payment.amount, 0);
};
