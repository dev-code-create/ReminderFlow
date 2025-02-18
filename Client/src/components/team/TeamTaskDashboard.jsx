import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaCheck } from "react-icons/fa";
import apiClient from "../../services/api";
import { toast } from "react-hot-toast";

const TeamTaskDashboard = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/teams/${teamId}`);
      setTeam(response.data);
      setTasks(response.data.tasks || []);
    } catch (error) {
      toast.error("Failed to load team tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await apiClient.put(`/teams/${teamId}/tasks/${taskId}`, {
        status: newStatus,
      });
      fetchTeamDetails();
      toast.success("Task status updated");
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await apiClient.delete(`/teams/${teamId}/tasks/${taskId}`);
      fetchTeamDetails();
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  if (!team) {
    return <div className="text-center py-8">Team not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {team.name} - Tasks
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <motion.div
              key={task._id}
              layout
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {task.title}
                </h3>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <FaTrash />
                </button>
              </div>
              <p className="text-gray-600 mb-4">{task.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Assigned to:</span>
                  <span className="font-medium">
                    {task.assignedTo?.email || "Unassigned"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Due:</span>
                  <span className="font-medium">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "No date"}
                    {task.dueTime ? ` at ${task.dueTime}` : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Priority:</span>
                  <span
                    className={`font-medium ${
                      task.priority === "high"
                        ? "text-red-600"
                        : task.priority === "medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="w-full rounded-lg border-gray-300 text-sm"
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
    </div>
  );
};

export default TeamTaskDashboard;
