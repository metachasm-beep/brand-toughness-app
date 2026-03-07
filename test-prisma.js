const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const list = await prisma.$queryRaw`SELECT current_database()`;
    console.log('Database connected:', list);
  } catch (e) {
    console.error('Prisma connection error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
