import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. جلب جميع المنتجات مع الفلترة والبحث
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, search } = req.query;

    const products = await prisma.product.findMany({
      where: {
        categoryId: categoryId ? Number(categoryId) : undefined,
        title: search ? { contains: String(search), mode: 'insensitive' } : undefined,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// 2. جلب منتج محدد بواسطة الـ ID
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: String(id) },
      include: {
        category: true,
        variants: true,
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// 3. إنشاء منتج جديد مع متغيراته (Variants)
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, title, slug, description, basePrice, isPublished, variants } = req.body;

    const newProduct = await prisma.product.create({
      data: {
        categoryId: Number(categoryId),
        title,
        slug,
        description,
        basePrice: Number(basePrice),
        isPublished: isPublished ?? false,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v: any) => ({
            sku: v.sku,
            price: Number(v.price),
            stockQuantity: Number(v.stockQuantity),
            attributes: v.attributes || {},
          })),
        } : undefined,
      },
      include: {
        variants: true,
      },
    });

    return res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct });
  } catch (error) {
    next(error);
  }
};

// 4. تحديث منتج
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { categoryId, title, slug, description, basePrice, isPublished } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id: String(id) },
      data: {
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(basePrice && { basePrice: Number(basePrice) }),
        ...(isPublished !== undefined && { isPublished }),
      },
      include: {
        variants: true,
      },
    });

    return res.status(200).json({ success: true, message: 'Product updated successfully', data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// 5. حذف منتج
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: String(id) },
    });

    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// رفع صورة منتج وإرجاع رابطها
export const uploadImageHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'لم يتم إرفاق أي صورة' });
    }

    // بناء الرابط النسبي أو الكامل للصورة
    const imageUrl = `/uploads/products/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      data: { imageUrl },
    });
  } catch (error) {
    next(error);
  }
};