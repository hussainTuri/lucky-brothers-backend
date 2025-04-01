import {
  TransportVehicleReservation,
  TransportVehicleReservationRentalCycle,
} from '@prisma/client';
import { DateTime } from 'luxon';

// All the months data has been added manually up until Feb, 2025, so we start with march 2025
const includeMonthsAfterInclusive = '2025-03-01';
// Prisma always stores dates in UTC format, that means we are only dealing UTC on backend
export const getReservationCyclesObjects = (
  reservation: TransportVehicleReservation,
): TransportVehicleReservationRentalCycle[] => {
  if (!reservation?.id) return [];
  const MAX_CYCLES = 1000; // Safety stop to prevent infinite loops

  // Convert reservation start & end
  const reservationStart = DateTime.fromJSDate(reservation.reservationStart, {
    zone: 'utc',
  }).startOf('day');

  const reservationEnd = reservation.reservationEnd
    ? DateTime.fromJSDate(reservation.reservationEnd, { zone: 'utc' }).endOf('day')
    : DateTime.now().setZone('utc').endOf('day');

  let currentStart = reservationStart;
  const end = reservationEnd;

  const cycles: TransportVehicleReservationRentalCycle[] = [];

  // console.log('Reservation:', reservation, {
  //   reservationStart: reservationStart.toJSDate(),
  //   reservationEnd,
  // });

  let cycleCount = 0;
  while (currentStart <= end && cycleCount < MAX_CYCLES) {
    // Bail if currentStart is in present month - cycle for present month will be generated at the start of next month
    if (currentStart.year === DateTime.now().setZone('utc').year && currentStart.month >= DateTime.now().setZone('utc').month) {
      break;
    }

    // Set period end at the last day of the current month
    const currentEnd = currentStart.endOf('month');
    const periodEnd = currentEnd > end ? end : currentEnd;

    // Calculate days in the cycle
    const days = Math.round(periodEnd.diff(currentStart, 'days').days);
    const daysInMonth = currentStart.daysInMonth ?? 30;

    // Generate rental cycle entry
    const cycle = {
      vehicleReservationId: reservation.id,
      customerId: reservation.customerId,
      rentFrom: currentStart.toJSDate(),
      rentTo: periodEnd.toJSDate(),
      amount: Math.round(days * (reservation.monthlyRate / daysInMonth)),
    } as TransportVehicleReservationRentalCycle;

    // console.log('Cycle:', { ...cycle, days, daysInMonth });

    // only include if currentStart is after Feb 2025 ie currentStart >= 2025-03-01
    if (currentStart >= DateTime.fromISO(includeMonthsAfterInclusive, { zone: 'utc' })) {
      cycles.push(cycle);
    }

    // Move to the first day of the next month
    currentStart = currentStart.plus({ months: 1 }).startOf('month');

    cycleCount++; // Prevent infinite loops
  }

  return cycles;
};
