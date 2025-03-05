import prisma from '../../../../../middleware/prisma';

export const getReservationCyclesDueAmounts = async (vehicleReservationIds: number[]) => {
  const reservationCycles = await prisma.transportVehicleReservationRentalCycle.findMany({
    where: {
      id: {
        in: vehicleReservationIds,
      },
    },
    include: {
      rentalCyclePayments: {
        where: {
          deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
        },
      },
    },
  });

  return reservationCycles.map((cycle) => {
    const paidAmount = cycle.rentalCyclePayments.reduce((acc, payment) => acc + payment.amount, 0);
    return {
      id: cycle.id,
      dueAmount: cycle.amount - paidAmount,
    };
  });
};
