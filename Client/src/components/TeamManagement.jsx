import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserPlus,
  FaUsers,
  FaUserCog,
  FaChartLine,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import apiClient from "../services/api";

const TeamManagement = () => {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({
    email: "",
    role: "member",
    tasks: "",
  });
  const [error, setError] = useState("");

  const handleAddMember = (e) => {
    e.preventDefault();
    if (newMember.email.trim() && newMember.role && newMember.tasks.trim()) {
      setMembers([...members, newMember]);
      setNewMember({ email: "", role: "member", tasks: "" });
      setShowAddMember(false);
      setError("");
    } else {
      setError("Please fill all member details");
    }
  };

  const handleRemoveMember = (indexToRemove) => {
    setMembers(members.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!teamName.trim()) {
        setError("Please enter a team name");
        return;
      }
      if (members.length === 0) {
        setError("Please add at least one member");
        return;
      }

      await apiClient.post("/teams/createTeam", { name: teamName, members });
      alert("Team created successfully");
      setTeamName("");
      setMembers([]);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create team");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Team Management
          </h1>
          <p className="text-gray-600">Create and manage your team</p>
        </motion.div>

        {/* Team Creation Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                          transition-all duration-300"
                placeholder="Enter team name"
              />
            </div>

            {/* Member List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Team Members ({members.length})
                </label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAddMember(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-500 
                           text-white rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  <FaPlus className="text-sm" />
                  <span>Add Member</span>
                </motion.button>
              </div>

              <AnimatePresence>
                {showAddMember && (
                  <motion.form
                    onSubmit={handleAddMember}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="email"
                        value={newMember.email}
                        onChange={(e) =>
                          setNewMember({ ...newMember, email: e.target.value })
                        }
                        className="px-4 py-3 bg-white border border-gray-200 rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                transition-all duration-300"
                        placeholder="Enter member email"
                      />
                      <select
                        value={newMember.role}
                        onChange={(e) =>
                          setNewMember({ ...newMember, role: e.target.value })
                        }
                        className="px-4 py-3 bg-white border border-gray-200 rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                transition-all duration-300"
                      >
                        <option value="member">Team Member</option>
                        <option value="leader">Team Leader</option>
                        <option value="admin">Admin</option>
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMember.tasks}
                          onChange={(e) =>
                            setNewMember({
                              ...newMember,
                              tasks: e.target.value,
                            })
                          }
                          className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg
                                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                  transition-all duration-300"
                          placeholder="Enter tasks"
                        />
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-500 
                                 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                          <FaUserPlus className="text-lg" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {members.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Email</span>
                        <p className="text-gray-700">{member.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Role</span>
                        <p className="text-gray-700 capitalize">
                          {member.role}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Tasks</span>
                        <p className="text-gray-700">{member.tasks}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveMember(index);
                      }}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-500 
                       text-white rounded-lg font-medium hover:shadow-lg 
                       transition-all duration-300"
            >
              Create Team
            </motion.button>
          </div>
        </form>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Total Members</h3>
              <FaUsers className="text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {members.length}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
