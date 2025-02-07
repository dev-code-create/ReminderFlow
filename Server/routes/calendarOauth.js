import express from "express";
import { authenticateGoogle, googleCallback } from "../services/oauth";

const router = express.Router();

router.get("/auth/google", authenticateGoogle);
router.get("/auth/google/callback", googleCallback, (req, res) => {
  res.redirect("/dashboard");
});

export default router;
