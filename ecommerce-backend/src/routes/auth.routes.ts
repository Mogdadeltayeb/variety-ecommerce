import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile 
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { isAdmin, isVendorOrAdmin } from '../middleware/role.middleware';
import { validateData } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validations/auth.validation';

const router = Router();

// ==========================================
// 1. المسارات العامة (Public Routes)
// ==========================================

// تسجيل حساب جديد مع التحقق من صحة المدخلات
router.post('/register', validateData(registerSchema), register);

// تسجيل الدخول مع التحقق من صحة المدخلات
router.post('/login', validateData(loginSchema), login);

// ==========================================
// 2. مسارات البروفايل (Protected Profile Routes)
// ==========================================

// جلب بيانات البروفايل والعناوين للمستخدم المسجل
router.get('/profile', authenticateToken, getProfile);

// تحديث بيانات الشخصية والعنوان الافتراضي في قاعدة البيانات
router.put('/profile', authenticateToken, updateProfile);

// ==========================================
// 3. مسارات تجريبية لحماية الأدوار (RBAC Routes)
// ==========================================

// مسار محمي للبائعين والأدمن فقط (VENDOR or ADMIN)
router.get('/vendor-dashboard', authenticateToken, isVendorOrAdmin, (req: any, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to the Vendor/Admin dashboard!',
    user: req.user,
  });
});

// مسار محمي للأدمن فقط (ADMIN)
router.get('/admin-stats', authenticateToken, isAdmin, (req: any, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to the Admin restricted statistics area!',
    user: req.user,
  });
});

export default router;