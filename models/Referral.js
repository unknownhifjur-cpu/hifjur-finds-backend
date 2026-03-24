import mongoose from 'mongoose';

const referralSchema = mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercent: { type: Number, default: 10 },
    maxDiscount: { type: Number, default: 100 },
    expiresAt: { type: Date, required: true },
    usageCount: { type: Number, default: 0 },
    usedByPhone: [{ type: String }],
  },
  { timestamps: true }
);

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;