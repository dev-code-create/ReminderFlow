import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaEdit,
  FaTrash,
  FaClock,
  FaSearch,
  FaFilter,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";
import apiClient from "../../services/api";

const TaskList = ({ onTaskUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await apiClient.get("/tasks/getTask");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await apiClient.put(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filter === "all" || task.status === filter;
      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "in-progress":
        return "text-blue-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheck />;
      case "in-progress":
        return <FaSpinner className="animate-spin" />;
      case "pending":
        return <FaClock />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-4 mb-6">
        {["all", "pending", "in-progress", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition-all duration-300 ${
              filter === status
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 hover:bg-indigo-50"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => (
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

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <span
                  className={`flex items-center gap-2 ${getStatusColor(
                    task.status
                  )}`}
                >
                  {getStatusIcon(task.status)}
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
                <span className="text-gray-500">Due Time: {task.dueTime}</span>
                <span className="text-gray-500">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                className={`ml-4 px-3 py-1 rounded-lg border ${getStatusColor(
                  task.status
                )} 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
