import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { isAdmin, isVendorOrAdmin } from '../middleware/role.middleware';
import { validateData } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validations/auth.validation';

const router = Router();

// مسارات عامة مع التحقق من صحة المدخلات (Zod Validation)
router.post('/register', validateData(registerSchema), register);
router.post('/login', validateData(loginSchema), login);

// ==========================================
// مسارات تجريبية لحماية الأدوار (RBAC)
// ==========================================

// مسار محمي لأي مستخدم مسجل دخول (CUSTOMER, VENDOR, ADMIN)
router.get('/profile', authenticateToken, (req: any, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to your profile!',
    user: req.user, // بيانات المستخدم المستخرجة من الـ JWT
  });
});

// مسار محمي للبائعين والأدمن فقط (VENDOR or ADMIN)
router.get('/vendor-dashboard', authenticateToken, isVendorOrAdmin, (req: any, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to the Vendor/Admin dashboard!',
    user: req.user,
  });
});

router.put('/profile', authenticateToken, async (req: any, res) => {
  // قم بتحديث بيانات المستخدم في قاعدة البيانات باستخدام req.user.userId و req.body.name
  return res.status(200).json({ success: true, message: 'Profile updated successfully' });
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