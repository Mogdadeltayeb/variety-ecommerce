import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. جلب كل التصنيفات
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true, // لعرض التصنيفات الفرعية التابعة إن وجدت
        products: true, // لعرض المنتجات التابعة لهذا التصنيف
      },
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// 2. جلب تصنيف واحد بواسطة الـ ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// 3. إنشاء تصنيف جديد
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, parentId, imageUrl } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, slug',
      });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        imageUrl,
        parentId: parentId ? Number(parentId) : null, // التأكد من أنه رقم أو null
      },
      include: {
        parent: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory,
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    // التحقق من تكرار الـ Slug
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Category slug must be unique',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// 4. تعديل تصنيف موجود
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, slug, parentId, imageUrl } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(parentId !== undefined && { parentId: parentId ? Number(parentId) : null }),
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error or category not found',
    });
  }
};

// 5. حذف تصنيف
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error (make sure no products or sub-categories are linked to it)',
    });
  }
};