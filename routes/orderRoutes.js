import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrdersByPhone,
  getOrderById,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guest and logged-in orders (handled by same controller)
router.route('/').post(createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/track/:phone', getOrdersByPhone);
router.get('/:id', getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;