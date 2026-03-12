import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  registerAdmin,  // <-- Make sure this is imported
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Admin registration endpoint
router.post('/register/admin', registerAdmin);  // <-- This line must be present

export default router;