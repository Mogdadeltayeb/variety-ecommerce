import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// 1. جلب عربة التسوق الخاصة بالمستخدم الحالي
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true, // لجلب تفاصيل المنتج الأساسي واسمه
              },
            },
          },
        },
      },
    });

    if (!cart) {
      // لو مافي عربة للمستخدم، ننشئ وحدة جديدة فاضية
      cart = await prisma.cart.create({
        data: { userId },
        include: { 
          items: { 
            include: { 
              variant: { 
                include: { 
                  product: true 
                } 
              } 
            } 
          } 
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// 2. إضافة منتج (Variant) إلى العربة للمستخدم الحالي
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { variantId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!variantId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide variantId and quantity',
      });
    }

    // البحث عن عربة المستخدم أو إنشاؤها إن لم تكن موجودة
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // التحقق هل المنتج موجود مسبقاً في العربة
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId,
      },
    });

    let cartItem;
    if (existingItem) {
      // تحديث الكمية لو المنتج موجود
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + Number(quantity) },
      });
    } else {
      // إضافة عنصر جديد للعربة
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity: Number(quantity),
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cartItem,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// 3. حذف عنصر من العربة
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const itemId = String(req.params.itemId);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // (اختياري إضافي للأمان): التأكد من أن الـ CartItem يتبع لعربة هذا المستخدم فعلياً
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found or unauthorized',
      });
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};