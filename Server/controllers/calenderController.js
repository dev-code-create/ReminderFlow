import CalenderIntegration from "../models/calenderIntegration.model.js";

export const connectCalender = async (req, res) => {
  const { provider, accessToken, refreshToken, expiresAt } = req.body;

  try {
    const calenderIntegration = await CalenderIntegration.findOneAndUpdate(
      { user: req.user.id, provider },
      {
        accessToken,
        refreshToken,
        expiresAt,
        syncEnabled: true,
        lastSyncAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );
    res.status(200).json(calenderIntegration);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getCalenderIntegration = async (req, res) => {
  try {
    const calenderIntegration = await CalenderIntegration.findOne({
      user: req.user.id,
    }).populate("user");
    if (!calenderIntegration)
      return res
        .status(404)
        .json({ message: "No calender intergration found" });
    res.json(calenderIntegration);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleSync = async (req, res) => {
  try {
    const calenderIntegration = await CalenderIntegration.findOne({
      user: req.user.id,
    });
    if (!calenderIntegration)
      return res.status(404).json({ message: "No calender Integration Found" });
    calenderIntegration.syncEnabled = !calenderIntegration.syncEnabled;
    await calenderIntegration.save();
    res.json({
      message: `Sync ${
        calenderIntegration.syncEnabled ? "enabled" : "disabled"
      }`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
