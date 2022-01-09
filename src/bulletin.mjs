import Prisma from '@prisma/client';

const { PrismaClient } = Prisma;
const prisma = new PrismaClient();

export const get = async (option, data) => {
  if (option === '') {
    const result = await prisma.bulletin.findMany({
      orderBy: {
        id: 'desc',
      },
      take: data.take,
      skip: data.skip,
    });
    return result;
  }
  return [];
};

export const save = async (data) => {
  const result = await prisma.bulletin.create({ data });
  return result;
};
