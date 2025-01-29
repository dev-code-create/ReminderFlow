import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due Date is required"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: [true, "Priority is required"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "snoozed"],
      required: [true, "status is required"],
    },
    category: {
      type: string,
      default: "general",
    },
    priorityScore: {
      type: Number,
      defaut: 0,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;
