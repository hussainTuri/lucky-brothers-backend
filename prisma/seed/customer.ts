// import { PrismaClient, Prisma, Product, InvoiceItem } from '@prisma/client';
// import { faker } from '@faker-js/faker';
// import { maxRecords } from './seed';

// const prisma = new PrismaClient();

// export const seedCustomers = async () => {
//   // Seed Customers
//   const customers = Array.from({ length: maxRecords.customers }, () => generateFakeCustomer());
//   await prisma.customer.createMany({ data: customers });
// };

// const generateFakeCustomer = () => {
//   return {
//     customerName: `${faker.person.firstName()} ${faker.person.lastName()}`,
//     trn: faker.string.numeric,
//     phone: faker.phone.number(),
//     address: faker.location.streetAddress(),
//   };
// };
