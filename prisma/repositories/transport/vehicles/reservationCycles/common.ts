import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getReservationCyclesDueAmounts = async (vehicleReservationIds: number[]) => {
  const reservationCycles = await prisma.transportVehicleReservationRentalCycle.findMany({
    where: {
      id: {
        in: vehicleReservationIds,
      },
    },
    include: {
      rentalCyclePayments: true,
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
