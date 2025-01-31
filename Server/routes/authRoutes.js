// routes/authRoutes.js
import express from "express";
import { signup, login, updateUser } from "../controllers/authController.js";
// import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes (require authentication)
router.put("/update", updateUser);

export default router;
