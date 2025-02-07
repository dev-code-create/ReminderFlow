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
