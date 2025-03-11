import {
  TransportVehicleReservation,
  TransportVehicleReservationRentalCycle,
} from '@prisma/client';
import { DateTime } from 'luxon';
import { DUBAI_TZ } from '../../lib/constants';
import prisma from '../../middleware/prisma';

// Let's keep things simple and use UAE timezone for all calculations but return UTC
// UAE is +4 hours ahead of UTC
// Prisma always stores dates in UTC format, that means we are only dealing UTC on backend

export const getReservationCyclesObjects = (
  reservation: TransportVehicleReservation,
): TransportVehicleReservationRentalCycle[] => {
  if (!reservation?.id) return [];
  const MAX_CYCLES = 1000; // Safety stop to prevent infinite loops

  // Convert reservation start & end to Dubai time
  const reservationStart = DateTime.fromJSDate(reservation.reservationStart, { zone: 'utc' })
    .setZone(DUBAI_TZ)
    .startOf('day');

  const reservationEnd = reservation.reservationEnd
    ? DateTime.fromJSDate(reservation.reservationEnd, { zone: 'utc' })
        .setZone(DUBAI_TZ)
        .endOf('day')
    : DateTime.now().setZone(DUBAI_TZ).endOf('day');

  let currentStart = reservationStart;
  const end = reservationEnd;

  const cycles: TransportVehicleReservationRentalCycle[] = [];

  // console.log("Reservation:", reservation, { reservationStart: reservationStart.toJSDate(), reservationEnd });

  let cycleCount = 0;
  while (currentStart <= end && cycleCount < MAX_CYCLES) {
    // Set period end at the last day of the current month in Dubai
    const currentEnd = currentStart.endOf('month');
    const periodEnd = currentEnd > end ? end : currentEnd;

    // Calculate days in the cycle
    const days = Math.round(periodEnd.diff(currentStart, 'days').days);
    const daysInMonth = currentStart.daysInMonth ?? 30;

    // Convert Dubai time back to UTC for storage
    const rentFromUtc = currentStart.setZone('utc').toJSDate();
    const rentToUtc = periodEnd.setZone('utc').toJSDate();

    // Generate rental cycle entry
    const cycle = {
      vehicleReservationId: reservation.id,
      customerId: reservation.customerId,
      rentFrom: rentFromUtc,
      rentTo: rentToUtc,
      amount: Math.round(days * (reservation.monthlyRate / daysInMonth)),
    } as TransportVehicleReservationRentalCycle;

    // console.log("Cycle:", { ...cycle, days, daysInMonth });

    cycles.push(cycle);

    // Move to the first day of the next month in Dubai
    currentStart = currentStart.plus({ months: 1 }).startOf('month');

    cycleCount++; // Prevent infinite loops
  }

  return cycles;
};

// no need to fix reservations dates, they seem correct
// export const fixReservationsDates = async () => {
//   const reservations = await prisma.transportVehicleReservation.findMany({
//     where: {
//       deleted: null,
//     },
//   });
//   for (const reservation of reservations) {
//     const reservationStart = DateTime.fromJSDate(reservation.reservationStart, { zone: 'utc' })
//       .setZone(DUBAI_TZ);
//       // .startOf('day'); // we want to preserve the user selected time
//     const reservationEnd = reservation.reservationEnd
//       ? DateTime.fromJSDate(reservation.reservationEnd, { zone: 'utc' })
//           .setZone(DUBAI_TZ)
//           //.endOf('day') // we want to preserve the user selected time
//       : null;

//     console.log(
//       'update start date from: ',
//       reservation.reservationStart,
//       'to: ',
//       reservationStart.toJSDate(),
//     );
//     console.log(
//       'update end date from: ',
//       reservation.reservationEnd,
//       'to: ',
//       reservationEnd?.toJSDate() ?? null,
//     );
//     // update reservation
//     await prisma.transportVehicleReservation.update({
//       where: { id: reservation.id },
//       data: {
//         reservationStart: reservationStart.toJSDate(),
//         reservationEnd: reservationEnd?.toJSDate() ?? null,
//       },
//     });
//   }
// };

export const fixRentalCyclesDates = async () => {
  const reservations = await prisma.transportVehicleReservation.findMany({
    where: {
      deleted: null,
    },
    include: {
      rentalCycles: {
        where: {
          deleted: null,
        },
      },
    },
  });
  for (const reservation of reservations) {
    for (const cycle of reservation.rentalCycles) {
      // if(cycle.id !== 6) continue;
      const rentFrom = DateTime.fromJSDate(cycle.rentFrom, { zone: 'utc' })
        .plus({days: 1}) // add one day just to be sure we are not fucking up the data
        .setZone(DUBAI_TZ)
        .startOf('day');
        // clone the date to avoid mutation
      const rentTo = rentFrom.plus({}).endOf('month').endOf('day');

      console.log(
        cycle.id,
        'update cycle start and end date from: ',
        cycle.rentFrom,
        'to: ',
        rentFrom.toJSDate(),
        ' ',
        cycle.rentTo,
        'to: ',
        rentTo.toJSDate(),
      );
      // update cycle
      await prisma.transportVehicleReservationRentalCycle.update({
        where: { id: cycle.id },
        data: {
          rentFrom: rentFrom.toJSDate(),
          rentTo: rentTo.toJSDate(),
        },
      });
    }
  }
};
//
