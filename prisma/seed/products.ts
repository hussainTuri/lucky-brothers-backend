import { PrismaClient, Prisma, Product, InvoiceItem } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { maxRecords } from './seed';

const prisma = new PrismaClient();

const generateFakeProductType = (typeName: string): Prisma.ProductTypeUncheckedCreateInput => {
  return {
    typeName,
  };
};

const generateFakeProduct = (): Prisma.ProductUncheckedCreateInput => {
  return {
    sku: faker.string.alphanumeric(10),
    productName: faker.commerce.productName(),
    productTypeId: faker.number.int({ min: 1, max: 4 }),
    stockQuantity: faker.number.int({ min: 10, max: 100 }),
    manufacturer: faker.company.name(),
    manufacturingYear: faker.number.int({ min: 2000, max: 2021 }),
    size: String(faker.number.int({ min: 1, max: 10 })),
    diameter: faker.number.int({ min: 1, max: 10 }),
    speedIndex: String(faker.number.int({ min: 1, max: 100 })),
    loadIndex: String(faker.number.int({ min: 1000, max: 2000 })),
    season: faker.helpers.arrayElement(['Summer', 'Winter', 'All Season']),
    width: faker.number.int({ min: 100, max: 200 }),
    height: faker.number.int({ min: 10, max: 100 }),
    length: faker.number.int({ min: 100, max: 200 }),
    startStop: faker.helpers.arrayElement([1, 0]),
    design: faker.helpers.arrayElement(['Symmetric', 'Asymmetric', 'Directional']),
    threadSize: faker.helpers.arrayElement(['R', 'F', 'FR', 'RF']),
    buyingPrice: faker.number.int({ min: 10, max: 100 }),
    sellingPrice: faker.number.int({ min: 100, max: 200 }),
  };
};

const generateFakePriceHistory = (productId: number) => {
  return {
    productId,
    buyingPrice: faker.number.int({ min: 10, max: 100 }),
    sellingPrice: faker.number.int({ min: 100, max: 200 }),
  };
};

export const seedProducts = async () => {
  // Seed ProductTypes
  const productTypes = ['Tyre', 'Battery', 'Filter', 'Service'];
  const createdProductTypes = await prisma.productType.createMany({
    data: productTypes.map((typeName) => generateFakeProductType(typeName)),
  });

  // Seed Products
  const products = Array.from({ length: maxRecords.products }, () => generateFakeProduct());
  const createdProducts = await prisma.product.createMany({ data: products });
  if (createdProducts?.count > 0) {
    const productIds = await prisma.product.findMany({
      select: {
        id: true,
      },
    });

    // Seed PriceHistory
    const priceHistories = productIds.map((product: any) => generateFakePriceHistory(product.id));
    await prisma.priceHistory.createMany({ data: priceHistories });
  }
};
