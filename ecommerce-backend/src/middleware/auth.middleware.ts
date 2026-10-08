import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// توسيع واجهة الـ Request لتمكيننا من تخزين بيانات المستخدم ودوره بعد فك الرمز
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'CUSTOMER' | 'ADMIN' | 'VENDOR'; // إضافة الدور هنا
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super-secret-key';
    const decoded = jwt.verify(token, secret) as { 
      userId: string; 
      email: string; 
      role: 'CUSTOMER' | 'ADMIN' | 'VENDOR'; 
    };
    
    req.user = decoded; // حفظ بيانات المستخدم ودوره داخل الـ Request للرجوع إليها لاحقاً
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};