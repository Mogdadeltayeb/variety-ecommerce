import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// تحديد مكان حفظ الملفات وإعداد الاسم الفريد لكل صورة
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // تحديد مجلد الحفظ (تأكد من إنشاء مجلد uploads/products في مشروعك)
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// الفلترة للتأكد من أن الملف مرفوع كصورة فقط
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('مسموح برفع الصور فقط (JPEG, JPG, PNG, WEBP)!'));
  }
};

// تجهيز الـ Multer middleware
export const uploadProductImage = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // أقصى حجم للصورة 5 ميجابايت
  fileFilter: fileFilter,
});