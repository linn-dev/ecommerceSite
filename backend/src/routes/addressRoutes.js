import express from "express";
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefault } from "../controllers/addressController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.use(protect);

router.route("/").get(getAddresses).post(createAddress);

router.route("/:id").put(updateAddress).delete(deleteAddress);

router.put("/:id/default", setDefault );

export default router;

