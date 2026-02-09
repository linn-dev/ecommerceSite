import express from "express";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.route("/")
    .get(getCart)
    .delete(clearCart);

router.route("/items")
    .post(addToCart)

router.route("/items/:itemId")
    .put(updateCartItem)
    .delete(removeCartItem);

export default router;