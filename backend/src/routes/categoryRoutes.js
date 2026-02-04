import express from 'express';
import { getAllCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:identifier', getCategory);

// Admin routes
router.post('/', protect, adminOnly, upload.single('image'), createCategory);
router.put('/:id', protect, adminOnly, upload.single('image'), updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;