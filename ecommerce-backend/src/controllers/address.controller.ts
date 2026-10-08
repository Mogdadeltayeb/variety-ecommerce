import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// 1. جلب جميع عناوين المستخدم الحالي
export const getUserAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }, // العناوين الافتراضية تظهر أولاً
    });

    return res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// 2. إضافة عنوان جديد للمستخدم الحالي
export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { country, city, stateProvince, addressLine1, postalCode, isDefault } = req.body;

    if (!country || !city || !addressLine1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields: country, city, addressLine1',
      });
    }

    // إذا كان العنوان الجديد افتراضياً، نقوم بإلغاء حالة الافتراضي عن باقي عناوين المستخدم
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        country,
        city,
        stateProvince: stateProvince || null,
        addressLine1,
        postalCode: postalCode || null,
        isDefault: isDefault ?? false,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: newAddress,
    });
  } catch (error) {
    console.error('Error creating address:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// 3. تحديث عنوان مع التحقق من الملكية
export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const addressId = String(req.params.addressId);
    const { country, city, stateProvince, addressLine1, postalCode, isDefault } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // التأكد من وجود العنوان وملكيته للمستخدم الحالي
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress || existingAddress.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or unauthorized',
      });
    }

    // إذا تم تعيينه كافتراضي، نجعل باقي عناوين المستخدم غير افتراضية
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        ...(country && { country }),
        ...(city && { city }),
        ...(stateProvince !== undefined && { stateProvince }),
        ...(addressLine1 && { addressLine1 }),
        ...(postalCode !== undefined && { postalCode }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: updatedAddress,
    });
  } catch (error) {
    console.error('Error updating address:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// 4. حذف عنوان مع التحقق من الملكية
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const addressId = String(req.params.addressId);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // التأكد من ملكية العنوان قبل حذفه
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress || existingAddress.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or unauthorized',
      });
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};