import Task from "../models/task.model.js";

export const createTask = async (req, res) => {
  const { title, description, dueDate, priority, recurrence } = req.body;
  const user = req.user;

  try {
    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      creator: req.user.id,
      recurrence,
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

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Add logging
    console.log("Attempting to delete task:", taskId);

    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: error.message });
  }
};
