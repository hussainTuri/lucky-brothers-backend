import { PrismaClient, PrismaPromise } from '@prisma/client';

const prisma = new PrismaClient();

// Should only be used in development
const seedDatabase = async () => {
  try {
    console.log('Database cleaning started...');
    const tables = [
      `Cash`,
      `CashOut`,
      `Customer`,
      `CustomerTransaction`,
      `DailyReport`,
      `Expense`,
      `Inventory`,
      `Invoice`,
      `InvoiceItem`,
      `InvoiceItemProductStock`,
      `InvoicePayment`,
      `InvoiceStatus`,
      `MonthlyReport`,
      `PriceHistory`,
      `_prisma_migrations`,
      `Product`,
      `ProductStock`,
      `ProductType`,
    ];
    const transactions: PrismaPromise<any>[] = [];
    transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`);

    for (const name of tables) {
      try {
        transactions.push(prisma.$executeRawUnsafe(`TRUNCATE ${name};`));
      } catch (error) {
        console.error({ error });
      }
    }

    try {
      await prisma.$transaction(transactions);
      transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`);
    } catch (error) {
      console.error({ error });
    } finally {
      transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`);
    }

    console.log('Database cleaning successfully!');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
