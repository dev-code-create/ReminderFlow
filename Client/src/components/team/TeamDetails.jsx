import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserPlus, FaTrash } from "react-icons/fa";
import apiClient from "../../services/api";
import { toast } from "react-hot-toast";
import TeamTaskDashboard from "./TeamTaskDashboard";
import { useAuth } from "../../context/AuthContext";
import EmailAutocomplete from "./EmailAutocomplete";

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [existingEmails, setExistingEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  useEffect(() => {
    if (team) {
      setExistingEmails(team.members.map((member) => member.user.email));
    }
  }, [team]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/teams/${teamId}`);
      setTeam(response.data);
    } catch (error) {
      console.error("Team fetch error:", error);
      if (error.response?.status === 403) {
        toast.error("You don't have access to this team");
        navigate("/teams");
      } else {
        toast.error("Failed to load team details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      await apiClient.post(`/teams/${teamId}/members`, { email: inviteEmail });
      toast.success("Member invited successfully");
      setShowInviteModal(false);
      setInviteEmail("");
      fetchTeamDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to invite member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      await apiClient.delete(`/teams/${teamId}/members/${memberId}`);
      toast.success("Member removed successfully");
      fetchTeamDetails();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading team details...</div>;
  }

  if (!team) {
    return <div className="text-center py-8">Team not found</div>;
  }

  const isCreator = team.creator._id === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{team.name}</h1>
            {isCreator && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <FaUserPlus /> Invite Member
              </button>
            )}
          </div>
          <p className="text-gray-600 mb-6">{team.description}</p>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Team Members
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {member.user.email}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {member.role}
                  </p>
                </div>
                {isCreator && team.creator._id !== member.user._id && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <TeamTaskDashboard teamMembers={team.members} />

        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-xl p-6 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Invite Team Member</h2>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleInviteMember} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <EmailAutocomplete
                      onSelect={(email) => setInviteEmail(email)}
                      excludeEmails={existingEmails}
                    />
                    {inviteEmail && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {inviteEmail}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      disabled={!inviteEmail}
                    >
                      Send Invitation
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamDetails;
