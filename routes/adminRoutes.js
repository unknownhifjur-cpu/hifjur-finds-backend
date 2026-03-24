import express from 'express';
import { getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { getUsers, updateUserRole } from '../controllers/userController.js';
import { createReferral, getReferrals, getAnalytics } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, admin);

// Order management
router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);

// User management
router.get('/users', getUsers);
router.put('/users/:id', updateUserRole);

// Referral management
router.get('/referrals', getReferrals);
router.post('/referrals', createReferral);

// Analytics
router.get('/analytics', getAnalytics);

export default router;