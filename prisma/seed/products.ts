import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const productTypeData: Prisma.ProductTypeCreateInput[] = [
  {
    typeName: 'Tyre',
    products: {
      create: {
        productName: 'Michelin Pilot Sport 4 205/55R16 91V',
        sku: 'TYR-001',
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
    },
  },
  {
    typeName: 'Battery',
    products: {
      create: {
        productName: 'Exide Start-Stop EFB EL700 70 Ah',
        sku: 'BAT-001',
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
    },
  },
  {
    typeName: 'Filter',
    products: {
      create: {
        productName: 'RIDEX 7O0028 Oil filter',
        sku: 'FLT-001',
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
    },
  },
  {
    typeName: 'Service',
  },
];
