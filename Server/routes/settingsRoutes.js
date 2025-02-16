import express from "express";
import {
  updateSettings,
  getSettings,
} from "../controllers/settingsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get-settings", authMiddleware, getSettings);
router.put("/update", authMiddleware, updateSettings);

export default router;
