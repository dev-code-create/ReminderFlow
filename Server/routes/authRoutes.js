import express from "express";
import {
  loginUser,
  registerUser,
  updateUser,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/signin", loginUser);
router.put("/update/:id", authMiddleware, updateUser);

export default router;
