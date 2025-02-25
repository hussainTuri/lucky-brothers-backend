import { Prisma, PrismaClient } from '@prisma/client';

const logQueries = process.env.LOG_PRISMA_QUERIES === 'true';

const prisma = new PrismaClient({
  log: logQueries ? ['query'] : [],
}) as PrismaClient;

if (logQueries) {
  // @ts-ignore
  prisma.$on('query', (e: Prisma.QueryEvent) => {
    console.log(`Params: ${e.params}`);
    console.log(`Duration: ${e.duration / 1000}s`);
    console.log('-'.repeat(50));
  });
}

export default prisma;
