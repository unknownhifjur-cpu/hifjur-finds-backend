import express from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderById,          // <-- import new controller
  updateOrderStatus,
  getAllUsers,
  getDashboardStats,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);

// Products
router.route('/products')
  .post(upload.array('images', 5), createProduct);

router.route('/products/:id')
  .put(upload.array('images', 5), updateProduct)
  .delete(deleteProduct);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);     // <-- new route
router.put('/orders/:id', updateOrderStatus);

// Users
router.get('/users', getAllUsers);

export default router;