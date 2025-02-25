import { Prisma, PrismaClient } from '@prisma/client';
import { softDeleteMiddleware } from './softDelete';
import { filterDeletedMiddleware } from './filterDeleted';
import { updateMiddleware } from './update';

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

prisma.$use(softDeleteMiddleware);
prisma.$use(filterDeletedMiddleware);
prisma.$use(updateMiddleware);

export default prisma;
