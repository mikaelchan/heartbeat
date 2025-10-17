import prisma from '../lib/prisma.js';

export const findRelationshipForUser = (userId: string) =>
  prisma.relationship.findFirst({
    where: {
      OR: [{ userOneId: userId }, { userTwoId: userId }]
    }
  });
