import { PrismaClient } from '@prisma/client';
import { seedCategories } from './seeds/category.seed';
import { seedProducts } from './seeds/product.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // تنظيف الجداول بالعكس لتجنب مشاكل الـ Foreign Keys
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 1. إنشاء التصنيفات أولاً
  await seedCategories(prisma);

  // 2. إنشاء المنتجات بعدها
  await seedProducts(prisma);

  console.log('Seeding finished successfully! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });