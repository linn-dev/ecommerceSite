import express from "express";
import { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, cancelOrder } from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createOrder);
router.get("/my", getMyOrders);

router.get("/", adminOnly, getAllOrders);

router.get("/:id", getOrder);
router.put("/:id/status", adminOnly, updateOrderStatus);
router.put("/:id/cancel", cancelOrder);

export default router;