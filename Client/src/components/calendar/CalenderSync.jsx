import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaGoogle, FaCalendarAlt, FaCheck, FaCog } from "react-icons/fa";
import apiClient from "../../services/api";
import { toast } from "react-hot-toast";

const CalendarSync = () => {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    enabled: false,
    lastSync: null,
  });
  const [syncFrequency, setSyncFrequency] = useState(15);

  const fetchSyncStatus = async () => {
    try {
      const response = await apiClient.get("/calendar/status");
      if (response.data.integration) {
        setSyncStatus({
          enabled: response.data.integration.syncEnabled,
          lastSync: response.data.integration.lastSyncAt,
        });
        setSyncFrequency(response.data.integration.syncFrequency);
        setSelectedProvider(response.data.integration.provider);
      }
    } catch (error) {
      console.error("Failed to fetch sync status:", error);
      toast.error("Failed to fetch sync status");
    }
  };

  const handleToggleSync = async (enabled) => {
    try {
      const response = await apiClient.put("/calendar/toggle-sync", {
        enabled,
      });

      if (response.data.integration) {
        setSyncStatus((prev) => ({
          ...prev,
          enabled: response.data.integration.syncEnabled,
          lastSync: response.data.integration.lastSyncAt,
        }));

        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Toggle sync failed:", error);
      toast.error("Failed to toggle sync");
      // Revert the toggle if it failed
      setSyncStatus((prev) => ({
        ...prev,
        enabled: !enabled,
      }));
    }
  };

  const handleConnect = async (provider) => {
    try {
      if (provider === "Google Calendar") {
        const response = await apiClient.get("/calendar/auth/google");
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Connection failed:", error);
      toast.error("Failed to connect to calendar");
    }
  };

  const handlePullFromCalendar = async () => {
    try {
      setIsSyncing(true);
      await apiClient.post("/calendar/pull-from-calendar");
      toast.success("Calendar events pulled successfully!");
      fetchSyncStatus();
    } catch (error) {
      console.error("Failed to pull from calendar:", error);
      toast.error("Failed to pull from calendar");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncFrequencyChange = async (frequency) => {
    try {
      await apiClient.put("/calendar/settings", {
        syncFrequency: parseInt(frequency),
      });
      setSyncFrequency(parseInt(frequency));
      toast.success("Sync frequency updated");
    } catch (error) {
      console.error("Failed to update sync frequency:", error);
      toast.error("Failed to update sync frequency");
    }
  };

  // Add useEffect to fetch initial sync status
  useEffect(() => {
    fetchSyncStatus();
  }, []);

  useEffect(() => {
    // Check for success/error in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const error = urlParams.get("error");
    const errorMessage = urlParams.get("message");

    if (success === "true") {
      // Show success message
      toast.success("Calendar connected successfully!");
    } else if (error === "true") {
      // Show error message
      toast.error(errorMessage || "Failed to connect calendar");
    }

    // Clear URL params
    if (success || error) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Check for tokens in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");
    const expiresIn = urlParams.get("expires_in");

    if (accessToken && refreshToken) {
      // Save the tokens by calling your backend
      const saveTokens = async () => {
        try {
          await apiClient.post("/calendar/connect", {
            provider: "google",
            accessToken,
            refreshToken,
            expiresAt: new Date(Date.now() + parseInt(expiresIn)),
          });

          toast.success("Calendar connected successfully!");
          fetchSyncStatus();
        } catch (error) {
          console.error("Failed to save tokens:", error);
          toast.error("Failed to connect calendar");
        }
      };

      saveTokens();
      // Clear URL params
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Calendar Integration
          </h1>
          <p className="text-gray-600">
            Sync your tasks with your favorite calendar application
          </p>
        </motion.div>

        {/* Calendar Providers */}
        <div className="grid grid-cols-1 gap-6 mb-12 ">
          {[{ name: "Google Calendar", icon: FaGoogle, color: "" }].map(
            (provider) => (
              <motion.div
                key={provider.name}
                whileHover={{ scale: 1.02 }}
                className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 
                         ${
                           selectedProvider === provider.name
                             ? "ring-2 ring-indigo-500"
                             : ""
                         }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <provider.icon
                      className={`text-${provider.color}-500 text-2xl`}
                    />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {provider.name}
                    </h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleConnect(provider.name)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2
                             ${
                               syncStatus.enabled &&
                               selectedProvider === provider.name
                                 ? "bg-green-500 text-white"
                                 : "bg-gradient-to-r from-indigo-600 to-purple-500 text-white"
                             }`}
                  >
                    {syncStatus.enabled &&
                    selectedProvider === provider.name ? (
                      <>
                        <FaCheck className="text-sm" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <FaCalendarAlt className="text-sm" />
                        <span>Connect</span>
                      </>
                    )}
                  </motion.button>
                </div>
                <p className="text-gray-600 text-sm">
                  Sync your tasks with {provider.name} to manage everything in
                  one place
                </p>
              </motion.div>
            )
          )}
        </div>

        {/* Sync Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Sync Settings
            </h3>
            <FaCog className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Auto-sync</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={syncStatus.enabled}
                  onChange={(e) => handleToggleSync(e.target.checked)}
                />
                <div
                  className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                              peer-focus:ring-indigo-300 rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"
                ></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 ">Sync Frequency</span>
              <select
                value={syncFrequency}
                onChange={(e) => handleSyncFrequencyChange(e.target.value)}
                className="px-8 py-2 bg-gray-50 border border-gray-200 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every hour</option>
              </select>
            </div>
            {syncStatus.lastSync && (
              <div className="text-sm text-gray-500">
                Last synced: {new Date(syncStatus.lastSync).toLocaleString()}
              </div>
            )}
          </div>
        </motion.div>

        <motion.button
          onClick={handlePullFromCalendar}
          disabled={!syncStatus.enabled || isSyncing}
          className="mt-4 w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-500 
             text-white rounded-lg font-medium hover:shadow-lg 
             transition-all duration-300 disabled:opacity-50"
        >
          {isSyncing ? "Pulling..." : "Pull from Calendar"}
        </motion.button>
      </div>
    </div>
  );
};

export default CalendarSync;
