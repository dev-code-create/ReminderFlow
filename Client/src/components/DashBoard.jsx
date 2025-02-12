import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import TaskList from "./tasks/TaskList";
import { FaPlus, FaCalendar, FaBell } from "react-icons/fa";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingTasks: 0,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Total Tasks</h3>
              <FaCalendar className="text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {stats.totalTasks}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Completed</h3>
              <FaCalendar className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {stats.completedTasks}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Upcoming</h3>
              <FaBell className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {stats.upcomingTasks}
            </p>
          </motion.div>
        </div>

        {/* Quick Action*/}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Your Tasks</h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/create-task"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-500 
                       text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              <FaPlus className="text-sm" />
              <span>New Task</span>
            </Link>
          </motion.div>
        </div>

        {/* Tasks List */}
        <TaskList />
      </div>
    </div>
  );
};

export default Dashboard;
