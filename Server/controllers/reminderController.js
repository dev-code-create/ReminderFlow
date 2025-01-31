import Reminder from "../models/Reminder.js";

// Create Reminder
export const createReminder = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    const reminder = new Reminder({
      user: req.userId,
      title,
      description,
      dueDate: new Date(dueDate),
      priority,
    });

    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Reminders for User
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.userId });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
