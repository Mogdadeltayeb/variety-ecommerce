import { z } from 'zod';

// Zod schema لإنشاء قسم جديد
export const createCategorySchema = z.object({
  name: z.string().min(2, { message: 'اسم القسم يجب أن يكون حرفين على الأقل' }),
  slug: z.string().min(2, { message: 'الرابط المختصر (slug) مطلوب' }),
  parentId: z.number().int().optional().nullable(),
  imageUrl: z.string().url({ message: 'رابط الصورة غير صالح' }).optional().nullable(),
});

// Zod schema لإنشاء منتج جديد
export const createProductSchema = z.object({
  title: z.string().min(3, { message: 'عنوان المنتج يجب أن يكون 3 أحرف على الأقل' }),
  slug: z.string().min(3, { message: 'الرابط المختصر (slug) مطلوب' }),
  description: z.string().optional(),
  basePrice: z.number().positive({ message: 'السعر يجب أن يكون قيمة موجبة' }),
  categoryId: z.number().int({ message: 'معرف القسم مطلوب ويجب أن يكون رقماً' }),
  isPublished: z.boolean().optional(),
  // متغيرات المنتج الأولية (تم تصحيح z.record بتمرير المفتاح والقيمة)
  variants: z.array(
    z.object({
      sku: z.string().min(2, { message: 'رمز الـ SKU مطلوب' }),
      price: z.number().positive({ message: 'سعر المتغير يجب أن يكون موجباً' }),
      stockQuantity: z.number().int().nonnegative({ message: 'كمية المخزون يجب ألا تكون سالبة' }),
      attributes: z.record(z.string(), z.any()).optional(), // تم تعديلها لتوافق Zod الحديث
    })
  ).min(1, { message: 'يجب إدراج متغير واحد على الأقل للمنتج (SKU، المقاس، أو اللون)' }),
});

export const updateProductSchema = createProductSchema.partial();