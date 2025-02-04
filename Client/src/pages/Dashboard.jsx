import React, { useState, useEffect } from "react";
import ReminderModal from "../components/ReminderModal";
import LoadingSkeleton from "../components/LoadingSkeleton";

const Dashboard = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch reminders from the server
    const fetchReminders = async () => {
      try {
        const response = await fetch("/api/reminders");
        const data = await response.json();
        setReminders(data);
      } catch (error) {
        console.error("Error fetching reminders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const handleAddReminder = (reminder) => {
    setReminders([...reminders, reminder]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4"
      >
        Add Reminder
      </button>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-4 rounded-lg shadow-md ${
                reminder.priority === "high"
                  ? "bg-red-100"
                  : reminder.priority === "medium"
                  ? "bg-yellow-100"
                  : "bg-green-100"
              }`}
            >
              <h2 className="text-xl font-bold">{reminder.title}</h2>
              <p>{reminder.description}</p>
              <p className="text-gray-600">{reminder.dueDate}</p>
            </div>
          ))}
        </div>
      )}
      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddReminder}
      />
    </div>
  );
};

export default Dashboard;
