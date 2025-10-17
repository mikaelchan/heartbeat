import prisma from '../lib/prisma.js';
import env from './env.js';

export const connectDatabase = async () => {
  await prisma.$connect();
  console.log(`Connected to database at ${env.databaseUrl.replace(/:[^:@/]+@/, ':***@')}`);
};
