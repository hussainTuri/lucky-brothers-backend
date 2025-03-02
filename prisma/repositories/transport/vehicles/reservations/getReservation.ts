import prisma from '../../../../../middleware/prisma';

export const getVehicleReservation = async (id: number) => {
  return prisma.transportVehicleReservation.findUniqueOrThrow({
    where: {
      id,
    },
  });
};
