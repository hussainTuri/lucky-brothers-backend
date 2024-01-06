import { PrismaClient, Prisma, Product, InvoiceItem } from '@prisma/client';
import { seedCustomers } from './customer';
import { seedProducts } from './products';
import { seedInvoices } from './invoice';

const prisma = new PrismaClient();
export const maxRecords = {
  products: 50,
  customers: 1000,
  invoices: 100000,
};

const seedDatabase = async () => {
  try {
    console.log('Database seeding started...');

    await seedCustomers();
    await seedProducts();
    await seedInvoices();

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
