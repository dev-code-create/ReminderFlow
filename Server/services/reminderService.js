import cron from "node-cron";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { sendTaskReminder } from "./emailService.js";
import Team from "../models/team.model.js";

// Run every 5 minutes to ensure we don't miss any tasks
export const startReminderService = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();
      const twentyFourHoursFromNow = new Date(
        now.getTime() + 24 * 60 * 60 * 1000
      );

      // Get all tasks due in the next 24 hours that haven't sent reminders
      const tasks = await Task.find({
        dueDate: {
          $exists: true,
          $ne: null,
          $lte: twentyFourHoursFromNow,
          $gte: now,
        },
        reminderSent: false,
      }).populate("creator assignees");

      // Get all team tasks
      const teams = await Team.find({
        "tasks.dueDate": {
          $exists: true,
          $ne: null,
          $lte: twentyFourHoursFromNow,
          $gte: now,
        },
        "tasks.reminderSent": false,
      })
        .populate("tasks.assignedTo")
        .populate("tasks.creator");

      // Process team tasks
      for (const team of teams) {
        for (const task of team.tasks) {
          if (shouldSendReminder(task, now)) {
            const user = task.assignedTo;
            if (user && user.email) {
              const reminderSent = await sendTaskReminder(user, {
                ...task.toObject(),
                teamName: team.name,
              });
              if (reminderSent) {
                task.reminderSent = true;
              }
            }
          }
        }
        await team.save();
      }

      // Process personal tasks
      for (const task of tasks) {
        if (shouldSendReminder(task, now)) {
          // Send to creator
          if (task.creator && task.creator.email) {
            await sendTaskReminder(task.creator, task);
          }

          // Send to assignees
          if (task.assignees && task.assignees.length > 0) {
            for (const assignee of task.assignees) {
              if (assignee.email) {
                await sendTaskReminder(assignee, task);
              }
            }
          }

          task.reminderSent = true;
          await task.save();
        }
      }
    } catch (error) {
      console.error("Reminder service error:", error);
    }
  });
};

// Helper function to determine if reminder should be sent
const shouldSendReminder = (task, now) => {
  if (!task.dueDate || task.reminderSent) return false;

  const dueDateTime = new Date(task.dueDate);
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(":");
    dueDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
  }

  const timeDiff = dueDateTime.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  // Send reminder if task is due within 24 hours
  // Also send reminder if task is due in less than 1 hour
  return (
    (hoursDiff <= 24 && hoursDiff > 0) || (hoursDiff <= 1 && hoursDiff > 0)
  );
};

// Helper function to format date and time for email
export const formatDateTime = (date, time) => {
  const dateObj = new Date(date);
  if (time) {
    const [hours, minutes] = time.split(":");
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  }
  return dateObj.toLocaleString();
};
