import express from "express";
import {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
} from "../controllers/reminderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createReminder);
router.get("/", authMiddleware, getReminders);
router.put("/:id", authMiddleware, updateReminder);
router.delete("/:id", authMiddleware, deleteReminder);

export default router;
