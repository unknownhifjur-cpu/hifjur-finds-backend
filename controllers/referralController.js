import Referral from '../models/Referral.js';

export const validateReferral = async (req, res) => {
  const { code, phone } = req.body;
  try {
    const referral = await Referral.findOne({ code: code.toUpperCase() });
    if (!referral) return res.json({ valid: false, message: 'Invalid code' });
    if (referral.expiresAt < new Date()) return res.json({ valid: false, message: 'Code expired' });
    if (referral.usedByPhone.includes(phone)) return res.json({ valid: false, message: 'Code already used by this phone' });
    res.json({ valid: true, discountPercent: referral.discountPercent, maxDiscount: referral.maxDiscount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};