import mongoose from "mongoose";

const calendarIntegrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider: {
    type: String,
    enum: ["google", "outlook", "apple"],
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  expiresAt: {
    type: Date,
  },
  syncEnabled: {
    type: Boolean,
    default: false,
  },
  lastSyncAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});

const CalendarIntegration = mongoose.model(
  "CalendarIntegration",
  calendarIntegrationSchema
);

export default CalendarIntegration;
