import cron from "node-cron";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { sendNotification } from "./notification.js";

export const scheduleRecurringTask = () => {
  cron.schedule("* * * * * ", async () => {
    const now = new Date();
    const tasks = await Task.find({
      "recurrence.type": { $ne: "none" },
      "recurrence.endDate": { $gte: now },
      dueDate: { $lte: now },
    });
    for (const task of tasks) {
      const creator = await User.findById(task.creator);

      for (const reminder of task.reminders) {
        if (!reminder.sent && reminder.time <= now) {
          await sendNotification(reminder, creator);
          reminder.sent = true;
        }
      }

      if (task.recurrence.type === "daily") {
        task.dueDate.setDate(task.dueDate.getDate() + 1);
      } else if (task.recurrence.type === "weekly") {
        task.dueDate.setData(task.dueDate.getDate() + 7);
      } else if (task.recurrence.type === "monthly") {
        task.dueDate.setMonth(task.dueDate.getMonth() + 1);
      }

      await task.save();
    }
  });
};
