import prisma from '../../../../../middleware/prisma';

export const deleteReservation = async (id: string) => {
  const reservation = await prisma.transportVehicleReservation.delete({
    where: {
      id: Number(id),
    },
  });
  return reservation;
};
