import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const productData: Prisma.ProductCreateInput[] = [
  {
    productName: 'Exide Start-Stop EFB EL700 70 Ah',
    sku: 'BAT-001',
    productTypeId: 2,
    stockQuantity: 10,
    manufacturer: 'Exide',
    manufacturingYear: 2019,
    imagePath: 'src/assets/no-image.jpg',
    width: 175,
    height: 190,
    length: 278,
    startStop: 1,
    buyingPrice: 100,
    sellingPrice: 200,
    priceHistory: {
      create: [
        {
          buyingPrice: 100,
          sellingPrice: 200,
        },
      ],
    },
  },
  {
    productName: 'Varta Blue Dynamic D24 60 Ah',
    sku: 'BAT-002',
    productTypeId: 2,
    stockQuantity: 10,
    manufacturer: 'Varta',
    manufacturingYear: 2019,
    imagePath: 'src/assets/no-image.jpg',
    width: 175,
    height: 190,
    length: 278,
    startStop: 1,
    buyingPrice: 100,
    sellingPrice: 200,
    priceHistory: {
      create: [
        {
          buyingPrice: 100,
          sellingPrice: 200,
        },
      ],
    },
  },
  {
    productName: 'Michelin Pilot Sport 4 205/55R16 91V',
    sku: 'TYR-001',
    productTypeId: 1,
    stockQuantity: 10,
    manufacturer: 'Michelin',
    manufacturingYear: 2019,
    imagePath: 'src/assets/no-image.jpg',
    size: '205/55R16',
    diameter: 16,
    speedIndex: 'V',
    loadIndex: '91',
    season: 'Summer',
    buyingPrice: 200,
    sellingPrice: 220,
    priceHistory: {
      create: [
        {
          buyingPrice: 100,
          sellingPrice: 200,
        },
      ],
    },
  },
  {
    productName: 'Michelin Pilot Sport 4 205/55R16 91V',
    sku: 'TYR-002',
    productTypeId: 1,
    stockQuantity: 10,
    manufacturer: 'Michelin',
    manufacturingYear: 2019,
    imagePath: 'src/assets/no-image.jpg',
    size: '205/55R16',
    diameter: 16,
    speedIndex: 'V',
    loadIndex: '91',
    season: 'Summer',
    buyingPrice: 200,
    sellingPrice: 220,
    priceHistory: {
      create: [
        {
          buyingPrice: 100,
          sellingPrice: 200,
        },
      ],
    },
  },

  {
    productName: 'RIDEX 7O0028 Oil filter',
    sku: 'FLT-001',
    productTypeId: 3,
    stockQuantity: 10,
    manufacturer: 'RIDEX',
    manufacturingYear: 2019,
    imagePath: 'src/assets/no-image.jpg',
    design: 'Spin-on Filter',
    height: 80,
    diameter: 76,
    threadSize: '3 / 4"-16',
    buyingPrice: 10,
    sellingPrice: 12,
    priceHistory: {
      create: [
        {
          buyingPrice: 100,
          sellingPrice: 200,
        },
      ],
    },
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const u of productData) {
    const product = await prisma.product.create({
      data: u,
    });
    console.log(`Created user with id: ${product.id}`);
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
