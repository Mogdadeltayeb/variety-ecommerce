import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }),
  name: z.string().min(2, { message: 'الاسم مطلوب' }), // تعديل ليقبل حقل name واحد
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN', 'VENDOR']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
});