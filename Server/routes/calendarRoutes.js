import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  connectCalendar,
  syncToCalendar,
  toggleSync,
  initiateGoogleAuth,
  handleGoogleCallback,
  getCalendarStatus,
  pullFromCalendar,
  updateCalendarSettings,
  disconnectCalendar,
} from "../controllers/calendarController.js";

const router = express.Router();

// Public route for Google OAuth callback
router.get("/google/callback", handleGoogleCallback);

// Protected routes
router.get("/auth/google", authMiddleware, initiateGoogleAuth);
router.get("/status", authMiddleware, getCalendarStatus);
router.post("/connect", authMiddleware, connectCalendar);
router.post("/sync-to-calendar", authMiddleware, syncToCalendar);
router.put("/toggle-sync", authMiddleware, toggleSync);
router.post("/pull-from-calendar", authMiddleware, pullFromCalendar);
router.put("/settings", authMiddleware, updateCalendarSettings);
router.post("/disconnect", authMiddleware, disconnectCalendar);

export default router;
