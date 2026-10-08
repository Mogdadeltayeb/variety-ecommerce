import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// 1. إنشاء طلب جديد من عربة التسوق الخاصة بالمستخدم الحالي
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { addressId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide addressId for shipping',
      });
    }

    // جلب العنوان والتأكد أنه يتبع لهذا المستخدم الحالي
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address or unauthorized',
      });
    }

    // جلب عربة المستخدم مع العناصر والـ variant باستخدام الـ userId المستخرج من التوكن
    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty or not found',
      });
    }

    // حساب إجمالي المبلغ وتجهيز عناصر الطلب
    let totalAmount = 0;
    const orderItemsData = cart.items.map((item: any) => {
      const price = Number(item.variant.price);
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtPurchase: price,
      };
    });

    // إنشاء الطلب ومعاملة تفريغ العربة
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          totalAmount: totalAmount,
          status: 'PENDING',
          shippingAddressSnapshot: JSON.parse(JSON.stringify(address)),
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // تفريغ العربة بعد إتمام الطلب
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// 2. جلب جميع طلبات المستخدم الحالي
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// 3. تحديث حالة الطلب
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing order status',
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: String(orderId) },
      data: { status },
    });

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};