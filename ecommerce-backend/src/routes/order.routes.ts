import { Router } from 'express';
import { createOrder, getUserOrders, updateOrderStatus } from '../controllers/order.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { isVendorOrAdmin } from '../middleware/role.middleware'; // استيراد ميدلوير الأدوار

const router = Router();

// تطبيق حماية المصادقة على جميع مسارات الطلبات
router.use(authenticateToken);

router.post('/', createOrder);              // إنشاء طلب جديد للمستخدم الحالي (متاح لأي مسجل دخول مثل الـ CUSTOMER)
router.get('/', getUserOrders);             // جلب طلبات المستخدم الحالي

// مسار لتحديث حالة الطلب -> تم حمايته بحيث لا يقبله إلا الـ VENDOR أو الـ ADMIN فقط
router.patch('/:orderId/status', isVendorOrAdmin, updateOrderStatus);

export default router;