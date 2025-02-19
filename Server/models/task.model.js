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
      sparse: true, // Allows null/undefined values
    },
    source: {
      type: String,
      enum: ["manual", "google_calendar", "outlook"],
      default: "manual",
    },
    lastCalendarSync: {
      type: Date,
      default: null,
    },
    calendarSyncError: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Add method to check if task needs calendar sync
taskSchema.methods.needsCalendarSync = function () {
  if (!this.dueDate) return false;

  // If never synced or modified after last sync
  return !this.lastCalendarSync || this.updatedAt > this.lastCalendarSync;
};

// Add method to update calendar sync status
taskSchema.methods.updateCalendarSync = async function (eventId) {
  this.calendarEventId = eventId;
  this.lastCalendarSync = new Date();
  this.calendarSyncError = null;
  await this.save();
};

// Add method to handle calendar sync error
taskSchema.methods.setCalendarSyncError = async function (error) {
  this.calendarSyncError = error.message;
  await this.save();
};

const Task = mongoose.model("Task", taskSchema);

export default Task;
