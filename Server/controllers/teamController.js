import Task from "../models/task.model.js";
import Team from "../models/team.model.js";
import User from "../models/user.model.js";

export const createTeam = async (req, res) => {
  const { name, description } = req.body;
  const team = new Team({
    name,
    description,
    owner: req.user.id,
  });
  await team.save();
  res.status(201).json({ message: "Team created successfully", team });
};

export const getTeam = async (req, res) => {
  const teams = await Team.find({ owner: req.user.id }).populate(
    "members.users"
  );
  res.json(teams);
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
    if (!team.owner.equals(req.user.id)) {
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
