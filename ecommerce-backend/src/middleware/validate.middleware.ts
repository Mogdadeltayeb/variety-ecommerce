import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateData = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // التحقق من صحة البيانات وتصفيتها
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: 'خطأ في المدخلات (Validation Error)',
        errors: error.errors?.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
  };
};