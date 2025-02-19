import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaPlus,
  FaUserFriends,
  FaCog,
  FaCalendarAlt,
  FaSignOutAlt,
  FaBell,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const letters = "ReminderFlow".split("");

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const navItems = [
    {
      to: "/create-task",
      icon: <FaPlus className="text-sm" />,
      label: "New Task",
      className: "bg-gradient-to-r from-indigo-600 to-purple-500 text-white",
    },
    {
      to: "/create-team",
      icon: <FaUserFriends className="text-sm" />,
      label: "Manage Team",
      className: "bg-gradient-to-r from-indigo-600 to-purple-500 text-white",
      adminOnly: true,
    },
    {
      to: "/calendar-sync",
      icon: <FaCalendarAlt className="text-sm" />,
      label: "Calendar Sync",
      className: "bg-gradient-to-r from-blue-500 to-cyan-400 text-white",
    },
    {
      to: "/settings",
      icon: <FaCog className="text-sm" />,
      label: "Settings",
      className: "bg-white border border-gray-200 text-gray-700",
    },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/90 backdrop-blur-md shadow-md py-3 px-4 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Section - Menu & Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaBars className="text-xl" />
            </button>

            {/* Logo and App Name */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <motion.img
                src="/Reminder.png"
                alt="Logo"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-md"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              />
              <motion.h1
                className="text-lg md:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent"
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
          </div>

          {/* Right Section - Navigation & Search */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map(
                (item) =>
                  (!item.adminOnly || user?.role === "admin") && (
                    <motion.div
                      key={item.to}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={item.to}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 ${item.className}`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  )
              )}
            </div>

            {/* Search Bar */}
            <SearchBar />

            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
            >
              <FaSignOutAlt className="text-lg" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 md:hidden"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.img
                      src="/Reminder.png"
                      alt="Logo"
                      className="w-10 h-10 rounded-full shadow-md"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    />
                    <motion.h1
                      className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent"
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
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="p-4 space-y-4">
                {navItems.map(
                  (item) =>
                    (!item.adminOnly || user?.role === "admin") && (
                      <motion.div
                        key={item.to}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          to={item.to}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${item.className}`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    )
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleLogout();
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
