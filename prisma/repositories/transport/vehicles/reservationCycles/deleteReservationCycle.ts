import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const deleteReservationCycle = async (id: string) => {
  const cycle = await prisma.transportVehicleReservationRentalCycle.delete({
    where: {
      id: Number(id),
    },
  });
  return cycle;
};
