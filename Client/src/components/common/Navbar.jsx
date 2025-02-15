import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { FaPlus, FaUserFriends, FaCog, FaCalendarAlt } from "react-icons/fa";

const Navbar = () => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const letters = "ReminderFlow".split("");

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/90 backdrop-blur-md shadow-md py-4 px-6 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <motion.img
            src="/Reminder.png"
            alt="Logo"
            className="w-10 h-10 rounded-full shadow-md"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          />
          <motion.h1
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex">
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 1 }}
                  animate={{
                    y: isHovered ? [0, -5, 0] : 0,
                    scale: isHovered ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.03,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                  }}
                  className="inline-block hover:text-transparent hover:bg-gradient-to-r hover:from-pink-500 hover:via-purple-500 hover:to-indigo-600 hover:bg-clip-text"
                >
                  {letter}
                </motion.span>
              ))}
            </div>
          </motion.h1>
        </Link>

        <div className="flex items-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/create-task"
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-500 
                         text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              <FaPlus className="text-sm" />
              <span>New Task</span>
            </Link>
          </motion.div>

          {user?.role === "member" && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/create-team"
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 
                           text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-300"
              >
                <FaUserFriends className="text-sm" />
                <span>Team</span>
              </Link>
            </motion.div>
          )}

          {/* Calendar Sync Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/calendar-sync"
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 
                         text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              <FaCalendarAlt className="text-sm" />
              <span>Calendar Sync</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/settings"
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 
                         text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-300"
            >
              <FaCog className="text-sm" />
              <span>Settings</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
