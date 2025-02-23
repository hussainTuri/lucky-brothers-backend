import { TransportVehicle, TransportVehicleReservation } from '@prisma/client';

export interface TransportVehicleWithReservations extends TransportVehicle {
  activeReservation?: TransportVehicleReservation;
  reservations?: TransportVehicleReservation[];
}
