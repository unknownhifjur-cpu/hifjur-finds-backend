import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });
const Product = mongoose.model('Product', productSchema);
export default Product;