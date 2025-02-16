import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const deleteReservation = async (id: string) => {
  const reservation = await prisma.transportVehicleReservation.delete({
    where: {
      id: Number(id),
    },
  });
  return reservation;
};
