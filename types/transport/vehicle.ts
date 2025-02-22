import { TransportVehicle, TransportVehicleReservation } from '@prisma/client';

export interface TransportVehicleWithReservations extends TransportVehicle {
  activeReservation?: TransportVehicleReservation;
  reservations?: TransportVehicleReservation[];
}

export enum VehicleTransactionTypes {
  BankInstallment = 1,
  BankLoan = 2,
  CustomerPayment = 3,
  Expense = 4,
}
