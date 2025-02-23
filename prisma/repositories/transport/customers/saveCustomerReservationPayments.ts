import { PrismaClient } from '@prisma/client';
import type {
  TransportCustomerTransaction,
  TransportVehicleReservationRentalCyclePayment,
  TransportVehicleTransaction,
} from '@prisma/client';

import { getCustomerCurrentTransactionBalance } from './common';
import {
  getCurrentBalance as getVehicleCurrentBalance,
  saveTransaction as saveVehicleTransaction,
} from '../vehicles/transactions';
import { saveVehicleReservationCyclePaymentEntry } from '../vehicles/reservationCycles/saveReservationCyclePayment';
import { CustomerReservationPayment, OmitPrismaClient } from '../../../../types';
import { TransportVehicleTransactionTypes } from '../../../../lib/enums/transportVehicle';

const prisma = new PrismaClient();

/**
 * When we add a customer reservation payment, we need to do the following:
 * 1. Add a customer transaction entry
 * 2. Add a reservation cycle payment entry
 * 3. Add a vehicle transaction entry
 *
 * We need to do this to maintain transaction history for Customer, vehicle and reservation cycle.
 * These are the 3 main entities.
 *
 * @param entries
 * @returns
 */
export const saveCustomerReservationPayments = async (
  entries: CustomerReservationPayment[],
): Promise<CustomerReservationPayment[] | null> => {
  return prisma.$transaction(async (tx) => {
    const created: any = [];
    for (const entry of entries) {
      const createdEntry: any = {};
      // 1. Add customer transaction entry
      const customerTransaction: Partial<TransportCustomerTransaction> = {
        customerId: entry.customerId,
        reservationRentalCycleId: entry.reservationCycleId,
        vehicleId: entry.vehicleId,
        customerTransactionTypeId: entry.customerTransactionTypeId,
        amount: entry.amount,
      };
      const createdCustomerTransaction = await saveCustomerTransaction(customerTransaction, tx);
      createdEntry.customerTransaction = createdCustomerTransaction;

      // 2. Add vehicle transaction entry
      const vehicleBalance = await getVehicleCurrentBalance(entry.vehicleId, tx);
      const vehicleTransaction: Partial<TransportVehicleTransaction> = {
        vehicleId: entry.vehicleId,
        customerTransactionId: createdCustomerTransaction.id,
        transactionTypeId: TransportVehicleTransactionTypes.CustomerPayment,
        amount: entry.amount,
        balance: vehicleBalance + entry.amount,
      };
      createdEntry.vehicleTransaction = await saveVehicleTransaction(
        vehicleTransaction as TransportVehicleTransaction,
        tx,
      );

      // 3. Add reservation cycle payment entry
      const reservationCyclePayment: Partial<TransportVehicleReservationRentalCyclePayment> = {
        vehicleReservationRentalCycleId: entry.reservationCycleId,
        customerTransactionId: createdCustomerTransaction.id,
        paymentDate: new Date(),
        amount: entry.amount,
      };
      createdEntry.reservationCyclePayment = await saveVehicleReservationCyclePaymentEntry(
        reservationCyclePayment as TransportVehicleReservationRentalCyclePayment,
        tx,
      );

      created.push(createdEntry);
    }

    return created;
  });
};

const saveCustomerTransaction = async (
  entry: Partial<TransportCustomerTransaction>,
  tx: OmitPrismaClient,
) => {
  const balance = await getCustomerCurrentTransactionBalance(entry.customerId!, tx);
  entry.balance = balance + (entry?.amount ?? 0);

  const entryCreated = await tx.transportCustomerTransaction.create({
    data: entry as TransportCustomerTransaction,
  });

  return entryCreated;
};
