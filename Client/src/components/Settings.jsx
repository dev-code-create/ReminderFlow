import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaUser,
  FaClock,
  FaMoon,
  FaGlobe,
  FaShieldAlt,
  FaToggleOn,
  FaSave,
  FaSignOutAlt,
} from "react-icons/fa";
import apiClient from "../services/api";
import { toast } from "react-hot-toast";

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    timezone: "UTC",
    theme: "light",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get("/settings/get-settings");
        setSettings(response.data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleNotificationChange = (type) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: !settings.notifications[type],
      },
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.put("/settings/update", settings);
      setMessage({ type: "success", text: "Settings updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update settings" });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Settings</h1>
          <p className="text-gray-600">
            Customize your ReminderFlow experience
          </p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaBell className="text-xl text-indigo-500" />
              <h2 className="text-xl font-semibold text-gray-800">
                Notifications
              </h2>
            </div>
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([type, enabled]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">
                    {type} Notifications
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNotificationChange(type)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                              ${enabled ? "bg-indigo-600" : "bg-gray-200"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                ${enabled ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Timezone Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaGlobe className="text-xl text-indigo-500" />
              <h2 className="text-xl font-semibold text-gray-800">Time Zone</h2>
            </div>
            <select
              value={settings.timezone}
              onChange={(e) =>
                setSettings({ ...settings, timezone: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="UTC">UTC</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
            </select>
          </motion.div>

          {/* Theme Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaMoon className="text-xl text-indigo-500" />
              <h2 className="text-xl font-semibold text-gray-800">Theme</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["light", "dark"].map((theme) => (
                <motion.button
                  key={theme}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSettings({ ...settings, theme })}
                  className={`p-4 rounded-lg border ${
                    settings.theme === theme
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200"
                  }`}
                >
                  <span className="capitalize">{theme}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Save Button */}
          {message.text && (
            <div
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-500 
                     text-white rounded-lg font-medium hover:shadow-lg 
                     transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FaSave />
            {loading ? "Saving..." : "Save Settings"}
          </motion.button>
        </div>

        {/* Add Logout Button */}
        <motion.div
          className="mt-8 border-t pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 
                     text-white rounded-lg font-medium hover:bg-red-700 
                     transition-colors duration-300"
          >
            <FaSignOutAlt className="text-xl" />
            Logout
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
