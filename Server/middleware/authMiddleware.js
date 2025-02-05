import { jwt } from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer", "");
  if (!token)
    return res.status(401).json({
      message: "No token,Authorization denied",
    });
  try {
    const decoded = jwt.verify(token, process.env.jwt_secret);
  } catch (error) {
    res.status(401).json({ message: "token is not valid" });
  }
};
