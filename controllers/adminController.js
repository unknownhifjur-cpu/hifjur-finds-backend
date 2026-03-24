import Referral from '../models/Referral.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// ... existing functions ...

export const createReferral = async (req, res) => {
  const { code, discountPercent, maxDiscount, expiresAt } = req.body;
  try {
    const referral = await Referral.create({
      code: code.toUpperCase(),
      discountPercent: discountPercent || 10,
      maxDiscount: maxDiscount || 100,
      expiresAt,
    });
    res.status(201).json(referral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find().sort({ createdAt: -1 });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const topProducts = await Order.aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products.productId', totalSold: { $sum: '$products.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', totalSold: 1 } }
    ]);

    res.json({ totalOrders, totalRevenue, topProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};