import Task from "../models/task.model.js";
import Team from "../models/team.model.js";
import User from "../models/user.model.js";

export const createTeam = async (req, res) => {
  try {
    const { name, members } = req.body;
    const creator = req.user.id;

    const team = new Team({
      name,
      creator,
      members: members.map((member) => ({
        email: member.email,
        role: member.role,
        tasks: member.tasks,
        status: "pending",
      })),
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    console.error("Team creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ creator: req.user.id })
      .populate("members.user", "firstName lastName email")
      .populate("creator", "firstName lastName email");

    res.json(teams);
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { role, tasks } = req.body;

    const team = await Team.findOneAndUpdate(
      {
        _id: teamId,
        "members._id": memberId,
      },
      {
        $set: {
          "members.$.role": role,
          "members.$.tasks": tasks,
        },
      },
      { new: true }
    );

    if (!team) {
      return res.status(404).json({ message: "Team or member not found" });
    }

    res.json(team);
  } catch (error) {
    console.error("Update team member error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const removeTeamMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    const team = await Team.findByIdAndUpdate(
      teamId,
      {
        $pull: { members: { _id: memberId } },
      },
      { new: true }
    );

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    console.error("Remove team member error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const inviteMember = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  const team = await Team.findById(id);
  if (!team) return res.status(404).json({ message: "Team not found" });

  const user = await User.findOne({
    email,
  });
  if (!user)
    return res.status(404).json({
      message: "User not found",
    });

  team.members.push({ user: user._id });
  await team.save();
  res.json(team);
};

export const deleteTeam = async (req, res) => {
  const { teamId } = req.params;

  try {
    // Find the team
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Ensure the authenticated user is the owner of the team
    if (!team.creator.equals(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this team" });
    }

    // Delete all tasks associated with the team
    await Task.deleteMany({ _id: { $in: team.tasks } });

    // Delete the team
    await team.remove();

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
