import { PrismaClient } from '@prisma/client';

export async function seedProducts(prisma: PrismaClient) {
  const electronics = await prisma.category.findUnique({
    where: { slug: 'electronics' },
  });

  const clothing = await prisma.category.findUnique({
    where: { slug: 'clothing' },
  });

  if (!electronics || !clothing) {
    throw new Error('Categories must be seeded before products!');
  }

  await prisma.product.create({
    data: {
      title: 'Wireless Bluetooth Headphones',
      slug: 'wireless-bluetooth-headphones',
      description: 'High-quality sound with active noise cancellation.',
      basePrice: 99.99, // تم التعديل هنا
      isPublished: true, // وتم التعديل هنا أيضاً لتتوافق مع الـ camelCase
      categoryId: electronics.id, // وهنا أيضاً categoryId
      variants: {
        create: [
          {
            sku: 'AUDIO-HP-BLK-01',
            price: 99.99,
            stockQuantity: 25,
            attributes: { color: 'Black' },
          },
          {
            sku: 'AUDIO-HP-WHT-02',
            price: 99.99,
            stockQuantity: 15,
            attributes: { color: 'White' },
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      title: 'Classic Cotton T-Shirt',
      slug: 'classic-cotton-t-shirt',
      description: '100% organic breathable cotton t-shirt for daily wear.',
      basePrice: 19.99, // تم التعديل هنا
      isPublished: true,
      categoryId: clothing.id, // وهنا أيضاً
      variants: {
        create: [
          {
            sku: 'CLOTH-TSHIRT-M-01',
            price: 19.99,
            stockQuantity: 30,
            attributes: { size: 'M' },
          },
          {
            sku: 'CLOTH-TSHIRT-L-02',
            price: 19.99,
            stockQuantity: 40,
            attributes: { size: 'L' },
          },
        ],
      },
    },
  });

  console.log('Products and Variants seeded successfully! 📦🔥');
}