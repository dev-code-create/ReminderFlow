import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const userCheck = await User.findOne({ email });
    if (userCheck)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({ email, password, firstName, lastName });
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return user data (excluding password) and token
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, password, phoneNumber, notification } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "forbidden: you can only update your own profile" });
    }
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (notificationPreferences) user.notificationPreferences = notification;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expires: "1h",
    });
    res.json({
      message: "User updated successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
