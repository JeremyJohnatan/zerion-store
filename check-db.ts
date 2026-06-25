import { prisma } from './src/lib/prisma';
import { config } from 'dotenv';
config();

async function main() {
  const newService = await prisma.service.create({
    data: {
      gameName: "Test Game",
      category: "Test",
      name: "Test Name",
      basePrice: 1000,
      type: "JOKI"
    }
  });
  console.log("Created:", newService.id);
  await prisma.service.delete({ where: { id: newService.id } });
}

main().catch(console.error).finally(() => prisma.$disconnect());
