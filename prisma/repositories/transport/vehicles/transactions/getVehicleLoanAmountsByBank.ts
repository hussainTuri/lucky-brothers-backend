import { TransportVehicleTransactionTypes } from '../../../../../lib/enums';
import prisma from '../../../../../middleware/prisma';
import { Prisma } from '@prisma/client';

// Get both paid and due amounts
export const getVehicleLoanAmountsByBank = async (
  vehicleId: number,
  bankId: number,
  exceptIds?: number[],
) => {
  const exceptCondition = exceptIds?.length
    ? Prisma.sql`AND id NOT IN (${Prisma.join(exceptIds)})`
    : Prisma.empty;

  const [loan, paid] = await Promise.all([
    await prisma.$queryRaw<{ totalAmount: number | null }[]>`
    SELECT SUM(ABS(amount)) AS totalAmount
    FROM TransportVehicleTransaction
    WHERE vehicleId = ${vehicleId}
    AND bankId = ${bankId}
    AND deleted IS NULL
    ${exceptCondition}
    AND transactionTypeId = ${TransportVehicleTransactionTypes.BankLoan}`,
    await prisma.$queryRaw<{ totalAmount: number | null }[]>`
  SELECT SUM(ABS(amount)) AS totalAmount
  FROM TransportVehicleTransaction
  WHERE vehicleId = ${vehicleId}
  AND bankId = ${bankId}
  AND deleted IS NULL
  ${exceptCondition}
  AND transactionTypeId = ${TransportVehicleTransactionTypes.BankInstallment}`,
  ]);

  return {
    loanAmount: Number(loan[0]?.totalAmount ?? 0),
    paidAmount: Number(paid[0]?.totalAmount ?? 0),
  };
};
