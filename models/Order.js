import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true }, // generated
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestName: { type: String, default: '' },
    phoneNumber: { type: String, required: true, index: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      area: String,
      city: String,
      pincode: String,
    },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 50 },
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'STORE'], default: 'COD' },
    deliveryType: { type: String, enum: ['HOME', 'STORE'], default: 'HOME' },
    referralCode: { type: String, default: null },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Pickup Ready'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// Auto-generate orderId before saving
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;