import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../services/api";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { format, parse } from "date-fns";

const TaskForm = ({ isEdit = false, initialData = null }) => {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: "medium",
    recurrence: "none",
    status: "pending",
  });

  // Add useEffect to load initial data
  useEffect(() => {
    const loadTask = async () => {
      if (taskId) {
        try {
          const response = await apiClient.get(`/tasks/${taskId}`);
          const task = response.data;

          // Format the date for the date input (YYYY-MM-DD)
          const formattedDate = task.dueDate
            ? format(new Date(task.dueDate), "yyyy-MM-dd")
            : "";

          // Format the time for the time input (HH:mm)
          const formattedTime = task.dueTime
            ? format(parse(task.dueTime, "h:mm a", new Date()), "HH:mm")
            : "";

          setFormData({
            title: task.title,
            description: task.description || "",
            dueDate: formattedDate,
            dueTime: formattedTime,
            priority: task.priority || "medium",
            recurrence: task.recurrence || "none",
            status: task.status || "pending",
          });
        } catch (error) {
          console.error("Failed to fetch task:", error);
          toast.error("Failed to load task data");
        }
      }
    };

    loadTask();
  }, [taskId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const timeDate = formData.dueTime
        ? parse(formData.dueTime, "HH:mm", new Date())
        : null;

      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        dueTime: timeDate ? format(timeDate, "h:mm a") : null,
      };

      if (taskId) {
        await apiClient.put(`/tasks/${taskId}`, taskData);
        toast.success("Task updated successfully!");
      } else {
        await apiClient.post("/tasks/createTask", taskData);
        toast.success("Task created successfully!");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save task:", error);
      toast.error(taskId ? "Failed to update task" : "Failed to create task");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 flex items-start justify-center ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mt-8"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-4"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent text-center mb-8"
          >
            {taskId ? "Edit Task" : "Create New Task"}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
                          transition-all duration-300 ease-in-out"
                placeholder="Enter task title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Time
                </label>
                <input
                  type="time"
                  name="dueTime"
                  value={formData.dueTime}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
                          transition-all duration-300 ease-in-out resize-none"
                placeholder="Describe your task..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
                            transition-all duration-300 ease-in-out"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recurrence
                </label>
                <select
                  name="recurrence"
                  value={formData.recurrence}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
                            transition-all duration-300 ease-in-out"
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-lg font-medium
                     hover:from-indigo-700 hover:to-purple-600 transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                     shadow-lg hover:shadow-xl transform"
          >
            {taskId ? "Update Task" : "Create Task"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskForm;
