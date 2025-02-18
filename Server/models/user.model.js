import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  phoneNumber: { type: String },
  googleId: {
    type: String,
    required: false,
    sparse: true,
    default: null,
  },
  role: { type: String, enum: ["admin", "member"], default: "member" },
  calendarIntegration: {
    syncEnabled: {
      type: Boolean,
      default: false, // Default value: syncing is disabled
    },
    provider: {
      type: String,
      enum: ["google", "outlook", null],
      default: null,
    },
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
  },
  timezone: { type: String, default: "UTC" },
  theme: {
    type: String,
    enum: ["light", "dark"],
    default: "light",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  fcmToken: {
    type: String,
    sparse: true, // Allows null values
  },
});

const User = mongoose.model("User", userSchema);

export default User;
