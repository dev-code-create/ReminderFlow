import cron from "node-cron";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { sendTaskReminder } from "./emailService.js";
import Team from "../models/team.model.js";

// Run every hour
export const startReminderService = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      // Get all tasks with due dates
      const tasks = await Task.find({
        dueDate: { $exists: true },
        reminderSent: false,
      }).populate("creator assignees");

      // Get all team tasks
      const teams = await Team.find({})
        .populate("tasks.assignedTo")
        .populate("tasks.creator");

      for (const team of teams) {
        for (const task of team.tasks) {
          if (task.shouldSendReminder()) {
            const user = task.assignedTo;
            if (user && user.email) {
              const reminderSent = await sendTaskReminder(user, task);
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
        if (task.shouldSendReminder()) {
          // Send to creator
          if (task.creator && task.creator.email) {
            await sendTaskReminder(task.creator, task);
          }

          // Send to assignees
          for (const assignee of task.assignees) {
            if (assignee.email) {
              await sendTaskReminder(assignee, task);
            }
          }

          task.reminderSent = true;
          await task.save();
        }
      }
    } catch (error) {
      console.error("Reminder service errors:", error);
    }
  });
};
