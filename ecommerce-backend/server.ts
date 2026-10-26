import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import categoryRoutes from './src/routes/category.routes';
import productRoutes from './src/routes/product.routes';
import authRoutes from './src/routes/auth.routes';
import cartRoutes from './src/routes/cart.routes';
import orderRoutes from './src/routes/order.routes';
import addressRoutes from './src/routes/address.routes'; 
import paymentRoutes from './src/routes/payment.routes'; 
import chatRoutes from './src/routes/chat.routes'; // استيراد راوت الشات الجديد
import { errorHandler } from './src/middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middlewares الأساسية
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// الملفات الثابتة
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// API Routes (مسارات التطبيق)
// ==========================================
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes); 
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes); // تفعيل راوت الشات بوت هنا

// Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('E-commerce Backend is running successfully! 🚀');
});

// ==========================================
// Global Error Handler
// ==========================================
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});