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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials!" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ error: "User not found!" });

    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) user.password = password;

    await user.save();

    // Remove password from response
    const userData = user.toObject();
    delete userData.password;
    res.json(userData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
