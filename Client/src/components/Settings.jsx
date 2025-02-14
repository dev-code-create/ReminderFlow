import React, { useState, useEffect } from "react";
import apiClient from "../services/api";

const Settings = () => {
  const [preferences, setPreferences] = useState({
    email: true,
    sms: false,
    push: true,
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await apiClient.get("/users/me");
        setPreferences(response.data.notificationPreferences);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPreferences();
  }, []);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setPreferences({ ...preferences, [name]: checked });
  };

  const handleSubmit = async () => {
    try {
      await apiClient.put("/users/me", {
        notificationPreferences: preferences,
      });
      alert("Notification preferences updated successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-[#F9FAFB] min-h-screen">
      <h1 className="text-2xl font-bold text-[#1F2937] mb-6">
        Notification Preferences
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="email"
            checked={preferences.email}
            onChange={handleChange}
            className="w-4 h-4 text-[#3B82F6]"
          />
          <label className="text-[#1F2937]">Email Notifications</label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="sms"
            checked={preferences.sms}
            onChange={handleChange}
            className="w-4 h-4 text-[#3B82F6]"
          />
          <label className="text-[#1F2937]">SMS Notifications</label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="push"
            checked={preferences.push}
            onChange={handleChange}
            className="w-4 h-4 text-[#3B82F6]"
          />
          <label className="text-[#1F2937]">Push Notifications</label>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[#3B82F6] text-white rounded hover:bg-[#2563EB]"
        >
          Save Preferences
        </button>
      </form>
    </div>
  );
};

export default Settings;
