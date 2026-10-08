import { PrismaClient } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient) {
  await prisma.category.createMany({
    data: [
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Clothing', slug: 'clothing' },
    ],
    skipDuplicates: true,
  });

  console.log('Categories seeded successfully! 🏷️');
}