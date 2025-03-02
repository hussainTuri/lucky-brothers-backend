import prisma from '../../../../../middleware/prisma';

export const getReservationCycle = async (id: number) => {
  return prisma.transportVehicleReservationRentalCycle.findUniqueOrThrow({
    where: {
      id,
    },
  });
};
