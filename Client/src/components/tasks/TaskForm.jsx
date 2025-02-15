import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../services/api";
import { motion } from "framer-motion";

const TaskForm = ({ isEdit = false, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    dueDate: initialData?.dueDate || "",
    priority: initialData?.priority || "medium",
    recurrence: initialData?.recurrence || "none",
  });

  const navigate = useNavigate();
  const { taskId } = useParams();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await apiClient.put(`/tasks/${taskId}`, formData);
      } else {
        await apiClient.post("/tasks/createTask", formData);
      }
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
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
            {isEdit ? "Edit Task" : "Create New Task"}
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
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
                            transition-all duration-300 ease-in-out"
                />
              </div>

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
            {isEdit ? "Update Task" : "Create Task"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskForm;
