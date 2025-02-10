import express from "express";
import {
  loginUser,
  registerUser,
  updateUser,
  getCurrentUser,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/signin", loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/update/:id", authMiddleware, updateUser);

export default router;
