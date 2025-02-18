import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUsers, FaTasks, FaPlus } from "react-icons/fa";
import apiClient from "../../services/api";
import { toast } from "react-hot-toast";

const TeamDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/teams");
      setTeams(response.data);
    } catch (error) {
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Teams</h1>
          <Link
            to="/manage-teams"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FaPlus /> Manage Teams
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              You're not part of any teams yet.
            </p>
            <Link
              to="/manage-teams"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <FaPlus /> Create Team
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <motion.div
                key={team._id}
                layout
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {team.name}
                </h3>
                <p className="text-gray-600 mb-4">{team.description}</p>
                <div className="flex items-center justify-between text-gray-500 mb-4">
                  <div className="flex items-center">
                    <FaUsers className="mr-2" />
                    <span>{team.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center">
                    <FaTasks className="mr-2" />
                    <span>{team.tasks?.length || 0} tasks</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to={`/team/${team._id}`}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-center"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/team/${team._id}/tasks`}
                    className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-center"
                  >
                    View Tasks
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDashboard;
