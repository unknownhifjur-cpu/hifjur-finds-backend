import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, totalPrice } = req.body;

    // Single city restriction
    if (shippingAddress.city !== process.env.ALLOWED_CITY) {
      return res.status(400).json({ message: `Delivery is only available in ${process.env.ALLOWED_CITY}.` });
    }

    const order = new Order({
      user: req.user._id,
      products,
      shippingAddress,
      totalPrice,
    });
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};