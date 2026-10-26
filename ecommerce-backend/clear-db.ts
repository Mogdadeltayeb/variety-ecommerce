

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('⏳ جاري مسح جميع بيانات قاعدة البيانات...');

  try {
    // الحذف بالترتيب العكسي للعلاقات لتجنب أخطاء الـ Foreign Keys
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('✅ تم تفريغ جميع جداول قاعدة البيانات بنجاح!');
  } catch (error) {
    console.error('❌ حدث خطأ أثناء مسح البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();