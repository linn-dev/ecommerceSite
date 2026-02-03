import express from "express";
import { register, login, logout, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

//** Public Route **\\
router.post("/register", register);
router.post("/login", login);

//** Protected Route **\\
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;