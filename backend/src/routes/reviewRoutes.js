import express from "express";
import {
    createReview,
    deleteReview,
    getAllReviews,
    getMyReviews,
    updateReview
} from "../controllers/reviewController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createReview);
router.get("/my", getMyReviews);
router.get("/all", adminOnly, getAllReviews);

router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;