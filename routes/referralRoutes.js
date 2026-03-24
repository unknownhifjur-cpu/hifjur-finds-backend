import express from 'express';
import { validateReferral } from '../controllers/referralController.js';

const router = express.Router();

router.post('/validate', validateReferral);

export default router;