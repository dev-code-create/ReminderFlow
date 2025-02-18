import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dueTime: { type: String },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
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
    reminderSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    calendarEventId: {
      type: String,
      sparse: true, // Allows null values and creates index
    },
    source: {
      type: String,
      enum: ["manual", "google_calendar", "outlook"],
      default: "manual",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
