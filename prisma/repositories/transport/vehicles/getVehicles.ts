import prisma from '../../../../middleware/prisma';
import { QueryOptions, QuerySort } from '../../../../types';
import { TransportVehicleWithReservations } from '../../../../types/transport/vehicle';

export const getVehicles = async (options: QueryOptions, sort?: QuerySort) => {
  let orderBy: { [key: string]: 'asc' | 'desc' }[] = [];

  if (sort) {
    if (sort.id) {
      orderBy.push({ id: sort.id });
    }
    if (sort.createdAt) {
      orderBy.push({ createdAt: sort.createdAt });
    }
  }

  const [vehicles, totalCount] = await Promise.all([
    await prisma.transportVehicle.findMany({
      include: {
        reservations: {
          orderBy: {
            id: 'desc',
          },
          where: {
            deleted: null, // Exclude soft-deleted reservations as they are applied by our middleware only to top level entities
            reservationStart: {
              lte: new Date(),
            },
            OR: [
              {
                reservationEnd: {
                  gte: new Date(),
                },
              },
              {
                reservationEnd: {
                  equals: null,
                },
              },
            ],
          },
        },
      },
      orderBy,
      skip: options?.skip ?? 0,
      take: options?.take ?? 1000,
    }),
    prisma.transportVehicle.count(),
  ]);

  vehicles.forEach((vehicle: TransportVehicleWithReservations) => {
    vehicle.activeReservation = vehicle.reservations?.length ? vehicle.reservations[0] : undefined;
    delete vehicle.reservations;
  });

  const banks = await prisma.transportBank.findMany();
  const transactionTypes = await prisma.transportVehicleTransactionType.findMany();

  return { vehicles, totalCount, additionalData: { banks, transactionTypes } };
};
