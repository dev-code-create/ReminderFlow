import CalenderIntegration from "../models/calenderIntergration.model";

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
