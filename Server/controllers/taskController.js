import Task from "../models/task.model.js";
export const createTask = async (req, res) => {
  const { title, description, dueDate, priority, recurrence } = req.body;
  const user = req.user;

  console.log(req.body.id);

  try {
    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      creator: req.user.id,
      recurrence,
    });
    console.log(task);
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
  const { taskId } = req.params;

  try {
    // Find the task
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Ensure the authenticated user is the creator of the task
    if (!task.creator.equals(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this task" });
    }

    // Delete the task
    await task.remove();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
