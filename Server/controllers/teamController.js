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
