import User from "../models/user.model.js";

export const updateSettings = async (req, res) => {
  try {
    const { notifications, timezone, theme } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        notificationPreferences: notifications,
        timezone,
        theme,
        updatedAt: Date.now(),
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      notifications: user.notificationPreferences,
      timezone: user.timezone,
      theme: user.theme,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: error.message });
  }
};
