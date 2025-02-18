import mongoose from "mongoose";

const calendarIntegrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider: {
    type: String,
    enum: ["google"],
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
  syncFrequency: {
    type: Number,
    enum: [15, 30, 60], // minutes
    default: 15,
  },
  lastSyncAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const CalendarIntegration = mongoose.model(
  "CalendarIntegration",
  calendarIntegrationSchema
);

export default CalendarIntegration;
