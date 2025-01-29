import User from "../models/user.model";

export const signup = async (req, res) => {
  try {
    const { email, password, phone } = req.body;
    const exisitingUser = await User.findOne({ email });

    if (exisitingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ email, password, phone });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error:" + error.message });
  }
};
