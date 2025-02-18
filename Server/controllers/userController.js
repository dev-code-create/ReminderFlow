import User from "../models/user.model.js";

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      email: { $regex: query, $options: "i" },
      _id: { $ne: req.user.id }, // Exclude current user
    })
      .select("email firstName lastName")
      .limit(5);

    res.json(users);
  } catch (error) {
    console.error("User search error:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
};
