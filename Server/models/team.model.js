import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      email: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["member", "leader", "admin"],
        default: "member",
      },
      tasks: String,
      status: {
        type: String,
        enum: ["pending", "active"],
        default: "pending",
      },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Team = mongoose.model("Team", teamSchema);

export default Team;
