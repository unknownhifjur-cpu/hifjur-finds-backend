import express from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getDashboardStats,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js'; // <-- import upload

const router = express.Router();

// All admin routes are protected and require admin role
router.use(protect, admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Products
router.route('/products')
  .post(upload.array('images', 5), createProduct); // <-- added upload

router.route('/products/:id')
  .put(upload.array('images', 5), updateProduct)   // <-- added upload
  .delete(deleteProduct);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);

// Users
router.get('/users', getAllUsers);

export default router;