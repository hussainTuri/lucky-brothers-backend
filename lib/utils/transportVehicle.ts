import { TransportVehicleReservation } from '@prisma/client';

export const isReservationOverlapping = (
  reservation: TransportVehicleReservation,
  existingReservations: TransportVehicleReservation[],
): boolean => {
  if (existingReservations.length === 0) return false; // No existing reservations

  const newStart = reservation.reservationStart;
  const newEnd = reservation.reservationEnd ?? null;
  console.info('newStart', newStart);
  console.info('newEnd', newEnd);

  for (const r of existingReservations) {
    if (r.id === reservation.id) continue; // Skip the reservation being updated
    const existingStart = r.reservationStart;
    const existingEnd = r.reservationEnd ?? null;

    // if (
    //   (newEnd === null && newStart >= existingStart && (existingEnd === null || newStart < existingEnd)) || // New reservation is forever and starts within an existing period
    //   (existingEnd === null && newStart <= existingStart && (newEnd === null || newEnd > existingStart)) || // Existing reservation is forever and new starts before or at its start
    //   (newEnd !== null && existingEnd !== null && newStart < existingEnd && newEnd > existingStart) || // Both have finite periods and overlap
    //   (newEnd !== null && existingEnd === null && newEnd > existingStart) || // New has an end, but existing is forever
    //   (newEnd === null && existingEnd !== null && newStart < existingEnd) // New is forever, existing has an end
    // ) {
    //   return true; // Overlapping detected
    // }
    // separate the conditions
    if (
      newEnd === null &&
      newStart >= existingStart &&
      (existingEnd === null || newStart < existingEnd)
    ) {
      console.debug(
        'newEnd === null && newStart >= existingStart && (existingEnd === null || newStart < existingEnd)',
      );
      return true;
    }
    if (
      existingEnd === null &&
      newStart <= existingStart &&
      (newEnd === null || newEnd > existingStart)
    ) {
      console.debug(
        'existingEnd === null && newStart <= existingStart && (newEnd === null || newEnd > existingStart)',
      );
      return true;
    }
    if (
      newEnd !== null &&
      existingEnd !== null &&
      newStart < existingEnd &&
      newEnd > existingStart
    ) {
      console.debug(
        'newEnd !== null && existingEnd !== null && newStart < existingEnd && newEnd > existing',
      );
      return true;
    }
    if (newEnd !== null && existingEnd === null && newEnd > existingStart) {
      console.debug('newEnd !== null && existingEnd === null && newEnd > existing');
      return true;
    }
    if (newEnd === null && existingEnd !== null && newStart < existingEnd) {
      console.debug('newEnd === null && existingEnd !== null && newStart < existingEnd');
      return true;
    }
  }

  console.debug('No overlaps');

  return false; // No overlaps
};
