import Task from "../models/task.model.js";
import CalendarIntegration from "../models/calendarIntegration.model.js";
import { syncTaskToCalendar } from "../services/calendarSync.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, dueTime, priority } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Create new task
    const task = new Task({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      dueTime,
      priority: priority || "medium",
      creator: req.user.id,
      status: "pending",
    });

    await task.save();

    // Check if user has calendar integration enabled
    const calendarIntegration = await CalendarIntegration.findOne({
      user: req.user.id,
      syncEnabled: true,
    });

    if (calendarIntegration && task.dueDate) {
      try {
        // Sync task to calendar
        await syncTaskToCalendar(task, calendarIntegration);
        task.calendarEventId = task.calendarEventId; // Save the calendar event ID
        await task.save();
      } catch (syncError) {
        console.error("Calendar sync error:", syncError);
        // Continue with task creation even if calendar sync fails
      }
    }

    // Populate creator details
    const populatedTask = await Task.findById(task._id).populate(
      "creator",
      "email firstName lastName"
    );

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Task creation error:", error);
    res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
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

// Add this new controller function
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Add this new controller function
export const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ message: "Failed to fetch task" });
  }
};
