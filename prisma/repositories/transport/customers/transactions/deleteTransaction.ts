import { PrismaClient } from '@prisma/client';
import { OmitPrismaClient } from '../../../../../types';
import _ from 'lodash';
import { getCustomerTransactionByCustomer } from './getCustomerTransactionByCustomer';
import { getTransportCustomerPreviousTransaction } from './getPreviousTransaction';
import { updateTransportCustomerTransaction } from './updateTransaction';
import { getTransportCustomerTransactionsAfterId } from './getTransactionsAfterId';


const prisma = new PrismaClient();
// const prisma = new PrismaClient({
//   log: [
//     {
//       emit: 'event',
//       level: 'query',
//     },
//   ],
// });
// prisma.$on('query', async (e: Prisma.QueryEvent) => {
//   console.log(`${e.query} ${e.params} duration: ${e.duration / 100}s`);
//   console.log('------------------------------------------------------\n');
//   console.log(`${e.query} duration: ${e.duration / 100} s`);
// });

export const deleteTransportCustomerTransaction = async (
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

    // TODO: I didn't think much on the process of deleting a transaction. Give it a thought if what other records should be deleted or updated
    // Here is a rough idea of what I think should be done:
    // 1. Do not allow deletions of Rent transactions
    // 2. For a customer Payment transaction type, records are added to customerTransaction, rentalCyclePayment and vehicleTransaction tables
    // therefore a deletion should cause removal of these records

    // 1. get previous transaction
    const previousTransaction = await getTransportCustomerPreviousTransaction(customerId, transactionId, tx);

    // 2. delete intended transaction
    await deleteTransaction(customerId, transactionId, tx);

    // 3. Update balance in all transactions after this transaction
    let balance = previousTransaction?.balance ?? 0;
    const transactions = await getTransportCustomerTransactionsAfterId(customerId, transactionId, tx);
    transactions.forEach((transaction) => {
      transaction.balance = balance + transaction.amount;
      balance = transaction.balance;
    });
    for (const transaction of transactions) {
      await updateTransportCustomerTransaction(transaction, tx);
    }
  });
};

const deleteTransaction = async (customerId: number, id: number, tx: OmitPrismaClient) => {
  return await tx.transportCustomerTransaction.delete({
    where: {
      id,
      customerId,
    },
  });
};
