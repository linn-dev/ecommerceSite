import express from "express";
import {
    getAvailableCoupons,
    validateCoupon,
    getAllCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon
} from '../controllers/couponController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/available', getAvailableCoupons);

// Customer (requires auth)
router.post('/validate', protect, validateCoupon);

// Admin
router.get('/', protect, adminOnly, getAllCoupons);
router.get('/:id', protect, adminOnly, getCoupon);
router.post('/', protect, adminOnly, createCoupon);
router.put('/:id', protect, adminOnly, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);
export default router;
