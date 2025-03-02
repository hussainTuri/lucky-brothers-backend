import { OmitPrismaClient } from '../../../../../types';
import _ from 'lodash';
import { getCustomerTransactionByCustomer } from './getCustomerTransactionByCustomer';
import { getTransportCustomerPreviousTransaction } from './getPreviousTransaction';
import { updateTransportCustomerTransaction } from './updateTransaction';
import { getTransportCustomerTransactionsAfterId } from './getTransactionsAfterId';
import prisma from '../../../../../middleware/prisma';
import { deleteReservationCyclePayment } from '../../vehicles/reservationCycles/deleteReservationCyclePayment';
import { deleteVehicleTransactionDbTransaction } from '../../vehicles';

export const deleteTransportCustomerTransactionWithRelation = async (
  customerIdentifier: string | number,
  id: string | number,
) => {
  const transactionId = Number(id);
  const customerId = Number(customerIdentifier);
  const entry = await getCustomerTransactionByCustomer(customerId, transactionId);

  if (_.isEmpty(entry)) {
    throw new Error(`Transport customer transaction with id ${id} not found.`);
  }

  return prisma.$transaction(async (tx) => {
    // Do not allow deletions of Rent transactions (Done at validation level)
    // For a customer Payment transaction type, records are added to customerTransaction, rentalCyclePayment and vehicleTransaction tables
    // therefore a deletion should cause removal of these records

    // 1. delete reservation cycle payment entry.
    // With a payment transaction, there is always a reservation cycle payment associated with it
    if (entry.reservationRentalCyclePayment?.id) {
      await deleteReservationCyclePayment(entry.reservationRentalCyclePayment.id, tx);
    }

    // 2. delete vehicle transaction entry
    // With a payment transaction, there is always a vehicle transaction associated with it
    if (entry.vehicleTransaction?.id) {
      await deleteVehicleTransactionDbTransaction(entry.vehicleId, entry.vehicleTransaction.id, tx);
    }

    // 3. delete customer transaction entry
    // get previous transaction
    const previousTransaction = await getTransportCustomerPreviousTransaction(
      customerId,
      transactionId,
      tx,
    );
    // delete intended transaction
    await deleteCustomerTransaction(customerId, transactionId, tx);
    // Update balance in all transactions after this transaction
    let balance = previousTransaction?.balance ?? 0;
    const transactions = await getTransportCustomerTransactionsAfterId(
      customerId,
      transactionId,
      tx,
    );
    transactions.forEach((transaction) => {
      transaction.balance = balance + transaction.amount;
      balance = transaction.balance;
    });
    for (const transaction of transactions) {
      await updateTransportCustomerTransaction(transaction, tx);
    }
  });
};

export const deleteCustomerTransaction = async (customerId: number, id: number, tx: OmitPrismaClient) => {
  return await tx.transportCustomerTransaction.delete({
    where: {
      id,
      customerId,
    },
  });
};
