import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// إتمام الدفع وتحديث الطلب مباشرة باستخدام جدول الطلبات
export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { orderId, paymentIntentId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!orderId || !paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide orderId and paymentIntentId',
      });
    }

    // التأكد من أن الطلب موجود ويخص المستخدم الحالي
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized',
      });
    }

    // إذا كان الطلب مدفوعاً مسبقاً
    if (order.status === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid',
      });
    }

    // تحديث الطلب ليصبح مدفوعاً وتخزين رقم عملية الدفع
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentIntentId: paymentIntentId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Payment recorded successfully and order status updated to PAID',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};