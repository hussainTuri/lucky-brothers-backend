import { PrismaClient, Prisma } from '@prisma/client';
import { productTypeData } from './products';
import { invoiceData } from './invoice';
import { customerData } from './customer';

const prisma = new PrismaClient();

async function seedProductTypes() {
  console.log(`Seeding Product Types...`);
  for (const productType of productTypeData) {
    const createdProductType = await prisma.productType.create({
      data: productType,
    });
    console.log(`Created Product Type with id: ${createdProductType.id}`);
  }
  console.log(`Product Types seeding finished.`);
}

async function main() {
  console.log(`Start seeding ...`);
  // Products
  for (const u of productTypeData) {
    const i = await prisma.productType.create({
      data: u,
    });
    console.log(`Created product type with id: ${i.id}`);
  }

  // Invoices
  for (const u of invoiceData) {
    const i = await prisma.invoiceStatus.create({
      data: u,
    });
    console.log(`Created invoice type with id: ${i.id}`);
  }

  // Customers
  for (const u of customerData) {
    const i = await prisma.customer.create({
      data: u,
    });
    console.log(`Created customer with id: ${i.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
