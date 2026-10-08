import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware'; // تأكد من مسار ملف الأوث الصحيح

// 1. للتحقق من أن المستخدم هو مسؤل (ADMIN) فقط
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required.',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }

  next();
};

// 2. للتحقق من أن المستخدم بائع (VENDOR) أو مسؤل (ADMIN)
export const isVendorOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication required.',
    });
  }

  if (req.user.role !== 'VENDOR' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Vendor or Administrator privileges required.',
    });
  }

  next();
};