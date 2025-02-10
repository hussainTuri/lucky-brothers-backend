import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getVehicle = async (id: number | string) => {
  const vehicle = await prisma.transportVehicle.findFirstOrThrow({
    where: {
      id: Number(id),
    },
  });
  return vehicle;
};
