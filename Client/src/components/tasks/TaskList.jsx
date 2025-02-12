import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import apiClient from "../../services/api";
import { FaEdit, FaTrash, FaClock } from "react-icons/fa";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await apiClient.get("/tasks");
      setTasks(response.data);
    };
    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <motion.div
          key={task._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {task.title}
              </h3>
              <p className="text-gray-600 mt-1">
                {task.description || "No description"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/edit-task/${task._id}`}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors duration-300"
              >
                <FaEdit />
              </Link>
              <button
                onClick={() => handleDelete(task._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-300"
              >
                <FaTrash />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center text-gray-500">
              <FaClock className="mr-2" />
              <span className="text-sm">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                task.priority === "high"
                  ? "bg-red-100 text-red-800"
                  : task.priority === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {task.priority}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TaskList;
