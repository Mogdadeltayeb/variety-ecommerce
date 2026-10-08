import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/product.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { isAdmin, isVendorOrAdmin } from '../middleware/role.middleware';
import { validateData } from '../middleware/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validations/product.validation';
import { uploadProductImage } from '../middleware/upload.middleware';
import { uploadImageHandler } from '../controllers/product.controller';

const router = Router();

// ==========================================
// مسارات عامة (متاحة للجميع دون الحاجة لتسجيل دخول)
// ==========================================
router.get('/', getProducts);
router.get('/:id', getProductById);

// ==========================================
// مسارات محمية تتطلب تسجيل دخول وصلاحيات (RBAC + Zod Validation)
// ==========================================

// إنشاء منتج جديد -> متاح للـ VENDOR أو الـ ADMIN فقط (مع التحقق من صحة البيانات)
router.post('/', authenticateToken, isVendorOrAdmin, validateData(createProductSchema), createProduct);

// تحديث منتج -> متاح للـ VENDOR أو الـ ADMIN فقط (مع التحقق من البيانات)
router.put('/:id', authenticateToken, isVendorOrAdmin, validateData(updateProductSchema), updateProduct);

// حذف منتج -> متاح للـ ADMIN فقط (صلاحية حرجة وحساسة)
router.delete('/:id', authenticateToken, isAdmin, deleteProduct);

router.post('/upload-image', authenticateToken, isVendorOrAdmin, uploadProductImage.single('image'), uploadImageHandler);

export default router;