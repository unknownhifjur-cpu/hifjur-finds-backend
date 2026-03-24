import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Referral from '../models/Referral.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Helper to generate a unique order ID
const generateOrderId = () => {
  return 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
};

// Unified order creation (guest or logged-in)
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let guestName, phoneNumber, shippingAddress;

    if (req.user) {
      // Logged-in user: use data from token
      const user = await User.findById(req.user._id);
      guestName = user.name;
      phoneNumber = user.phone || req.body.phoneNumber;
      shippingAddress = req.body.shippingAddress;
    } else {
      // Guest order: get from request body
      ({ guestName, phoneNumber, shippingAddress } = req.body);
    }

    const { products, deliveryType, paymentMethod, referralCode } = req.body;

    // Optional city restriction – skip if not set in .env
    if (process.env.ALLOWED_CITY && shippingAddress.city !== process.env.ALLOWED_CITY) {
      throw new Error(`Delivery only available in ${process.env.ALLOWED_CITY}`);
    }

    // Check stock
    for (const item of products) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }

    // Calculate totals
    const subtotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const deliveryCharge = deliveryType === 'HOME' ? 50 : 0;
    let discountAmount = 0;

    // Apply referral code if valid
    if (referralCode) {
      const referral = await Referral.findOne({ code: referralCode.toUpperCase() }).session(session);
      if (referral && referral.expiresAt > new Date() && !referral.usedByPhone.includes(phoneNumber)) {
        discountAmount = Math.min(subtotal * (referral.discountPercent / 100), referral.maxDiscount);
        referral.usageCount++;
        referral.usedByPhone.push(phoneNumber);
        await referral.save({ session });
      }
    }

    const totalPrice = subtotal + deliveryCharge - discountAmount;

    // Create order
    const order = await Order.create([{
      orderId: generateOrderId(),               // custom ID
      user: req.user ? req.user._id : null,
      guestName,
      phoneNumber,
      shippingAddress: {
        ...shippingAddress,
        name: guestName,
        phone: phoneNumber,
      },
      products,
      subtotal,
      discountAmount,
      deliveryCharge,
      totalPrice,
      paymentMethod,
      deliveryType,
      referralCode: referralCode || null,
      orderStatus: 'Pending',
    }], { session });

    // Reduce stock
    for (const item of products) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    await session.commitTransaction();
    res.status(201).json(order[0]);
  } catch (error) {
    await session.abortTransaction();
    console.error('Order creation failed:', error);  // log the real error
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Get orders for logged-in user
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders by phone number (guest tracking)
export const getOrdersByPhone = async (req, res) => {
  const { phone } = req.params;
  try {
    const orders = await Order.find({ phoneNumber: phone }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order by ID (admin or owner)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user && (req.user.role === 'admin' || order.user?.toString() === req.user._id.toString())) {
      return res.json(order);
    }
    res.status(403).json({ message: 'Not authorized' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const { status } = req.body;
    order.orderStatus = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};