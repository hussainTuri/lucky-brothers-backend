import prisma from '../../../../../middleware/prisma';

export const deleteReservationCycle = async (id: string) => {
  const cycle = await prisma.transportVehicleReservationRentalCycle.delete({
    where: {
      id: Number(id),
    },
  });
  return cycle;
};
