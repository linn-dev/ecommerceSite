import express from 'express';
import {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:identifier', getProduct);

// Admin routes
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;