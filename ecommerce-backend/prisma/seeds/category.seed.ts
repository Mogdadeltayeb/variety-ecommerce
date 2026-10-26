import { PrismaClient } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient) {
  console.log('🌱 جاري إدخال الأقسام الـ 6 مع الصور المطابقة للتصميم...');

  const categories = [
    {
      name: 'Autumn Outerwear',
      slug: 'autumn-outerwear',
      imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Casual Knitwear',
      slug: 'casual-knitwear',
      imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Footwear & Boots',
      slug: 'footwear-boots',
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Bottoms & Trousers',
      slug: 'bottoms-trousers',
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Luxury Accessories',
      slug: 'luxury-accessories',
      imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800',
    },
    {
      name: 'Active & Sportswear',
      slug: 'active-sportswear',
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        imageUrl: category.imageUrl,
      },
      create: category,
    });
  }

  console.log('✅ تمت مطابقة جميع الأقسام والصور بنجاح!');
}