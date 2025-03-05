import prisma from '../../../../../middleware/prisma';

export const checkIfReservationCycleByMonthExists = async (
  vehicleReservationId: number,
  month: Date,
): Promise<boolean> => {
  const monthNumber = month.getMonth() + 1;
  const year = month.getFullYear();

  const exists = await prisma.$queryRaw<
    { 1: number }[]
  >`SELECT 1 FROM TransportVehicleReservationRentalCycle
      WHERE vehicleReservationId = ${vehicleReservationId}
      AND deleted IS NULL
      AND (
        (MONTH(rentFrom) = ${monthNumber} AND YEAR(rentFrom) = ${year})
        OR (MONTH(rentTo) = ${monthNumber} AND YEAR(rentTo) = ${year})
      )
      LIMIT 1`;

  return exists.length > 0;
};
