import { Router } from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/cart.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// تطبيق حماية المصادقة على جميع مسارات السلة تليقاً
router.use(authenticateToken);

// المسارات أصبحت أظرف وأكثر أماناً (لا تحتاج لتمرير الـ userId في الرابط)
router.get('/', getCart);                      // جلب سلة المستخدم الحالي
router.post('/items', addToCart);              // إضافة منتج لسلة المستخدم الحالي
router.delete('/items/:itemId', removeFromCart); // حذف منتج من السلة

export default router;