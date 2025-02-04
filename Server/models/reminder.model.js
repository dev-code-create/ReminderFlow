import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dueDate: { type: Date, required: true },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  recurrence: {
    type: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly"],
      default: "none",
    },
    endDate: { type: Date },
  },
  reminders: [
    {
      time: { type: Date, required: true },
      type: { type: String, enum: ["email", "sms", "push"] },
      sent: { type: Boolean, default: false },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;
