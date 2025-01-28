import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoDB from "./config/db.js";

dotenv.config();
mongoDB();
const app = express();

app.use(cors());
app.use(express.json());

// app.use("/api/users", userRoutes);
// app.use("/api/task", taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
