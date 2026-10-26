import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// ==========================================
// 1. تسجيل مستخدم جديد (Register)
// ==========================================
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, firstName, lastName, phone, role, image } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // التحقق مما إذا كان البريد مستخدماً مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use',
      });
    }

    // تشفير كلمة المرور
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let finalFirstName = firstName || '';
    let finalLastName = lastName || '';

    if (name && !firstName) {
      const nameParts = name.trim().split(' ').filter(Boolean);
      finalFirstName = nameParts[0] || '';
      finalLastName = nameParts.slice(1).join(' ') || '';
    }

    // إنشاء المستخدم الجديد في قاعدة البيانات باستخدام image
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: finalFirstName,
        lastName: finalLastName,
        phone: phone || '',
        role: role || 'CUSTOMER',
        image: image || null,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Error during registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// ==========================================
// 2. تسجيل الدخول (Login)
// ==========================================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const secret = process.env.JWT_SECRET || 'super-secret-key';
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      secret,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// ==========================================
// 3. جلب بيانات البروفايل (Get Profile)
// ==========================================
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        image: true, // استخدام image حصرياً
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ==========================================
// 4. تحديث البروفايل والصورة والعنوان (Update Profile)
// ==========================================
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { firstName, lastName, phone, image, address } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (image !== undefined) updateData.image = image; // استخدام image حصرياً

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        image: true,
      },
    });

    if (address) {
      const { id: addressId, country, city, stateProvince, addressLine1, postalCode } = address;

      if (addressId) {
        await prisma.address.update({
          where: { id: addressId },
          data: { country, city, stateProvince, addressLine1, postalCode },
        });
      } else if (addressLine1 || city) {
        await prisma.address.create({
          data: {
            userId,
            country: country || '',
            city: city || '',
            stateProvince: stateProvince || '',
            addressLine1: addressLine1 || '',
            postalCode: postalCode || '',
            isDefault: true,
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};