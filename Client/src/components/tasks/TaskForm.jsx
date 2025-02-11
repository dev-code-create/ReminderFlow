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
        await apiClient.put(`/api/tasks/${taskId}`, formData);
      } else {
        await apiClient.post("/api/tasks", formData);
      }
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-white to-green-200 h-64 w-full py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-brand-dark text-center mb-8"
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
            className="w-full py-4 bg-brand-primary text-white rounded-lg font-medium
                     hover:bg-brand-secondary transition-colors duration-300
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary
                     shadow-lg hover:shadow-xl transform transition-all"
          >
            {isEdit ? "Update Task" : "Create Task"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskForm;
