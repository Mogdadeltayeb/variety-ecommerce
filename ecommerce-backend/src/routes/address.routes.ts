import { Router } from 'express';
import { 
  getUserAddresses, // تم تحديث اسم الدالة ليكون معبراً أكثر عن المستخدم الحالي
  createAddress, 
  updateAddress, 
  deleteAddress 
} from '../controllers/address.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// تطبيق حماية المصادقة على جميع مسارات العناوين
router.use(authenticateToken);

// المسارات أصبحت آمنة ولا تحتاج لتمرير الـ userId في الرابط
router.get('/', getUserAddresses);                 // جلب عناوين المستخدم الحالي
router.post('/', createAddress);               // إضافة عنوان جديد للمستخدم الحالي
router.put('/:addressId', updateAddress);      // تعديل عنوان محدد
router.delete('/:addressId', deleteAddress);   // حذف عنوان محدد

export default router;