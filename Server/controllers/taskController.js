import Task from "../models/task.model.js";
export const createTask = async (req, res) => {
  const { title, description, dueDate, priority, assignees } = req.body;

  try {
    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      creator: req.user.id,
      assignees,
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ creator: req.user.id }).populate(
      "assignees"
    );
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
