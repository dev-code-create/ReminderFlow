import Task from "../models/task.model.js";
import Team from "../models/team.model.js";
import User from "../models/user.model.js";

export const createTeam = async (req, res) => {
  try {
    const { name, members } = req.body;
    const creator = req.user.id;

    const team = new Team({
      name,
      creator,
      members: members.map((member) => ({
        email: member.email,
        role: member.role,
        tasks: member.tasks,
        status: "pending",
      })),
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    console.error("Team creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ creator: req.user.id })
      .populate("members.user", "firstName lastName email")
      .populate("creator", "firstName lastName email");

    res.json(teams);
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { role, tasks } = req.body;

    const team = await Team.findOneAndUpdate(
      {
        _id: teamId,
        "members._id": memberId,
      },
      {
        $set: {
          "members.$.role": role,
          "members.$.tasks": tasks,
        },
      },
      { new: true }
    );

    if (!team) {
      return res.status(404).json({ message: "Team or member not found" });
    }

    res.json(team);
  } catch (error) {
    console.error("Update team member error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const removeTeamMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    const team = await Team.findByIdAndUpdate(
      teamId,
      {
        $pull: { members: { _id: memberId } },
      },
      { new: true }
    );

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    console.error("Remove team member error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const inviteMember = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  const team = await Team.findById(id);
  if (!team) return res.status(404).json({ message: "Team not found" });

  const user = await User.findOne({
    email,
  });
  if (!user)
    return res.status(404).json({
      message: "User not found",
    });

  team.members.push({ user: user._id });
  await team.save();
  res.json(team);
};

export const deleteTeam = async (req, res) => {
  const { teamId } = req.params;

  try {
    // Find the team
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Ensure the authenticated user is the owner of the team
    if (!team.creator.equals(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this team" });
    }

    // Delete all tasks associated with the team
    await Task.deleteMany({ _id: { $in: team.tasks } });

    // Delete the team
    await team.remove();

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createTeamTask = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, description, dueDate, dueTime, assignedTo, priority } =
      req.body;

    // Validate required fields
    if (!title || !assignedTo) {
      return res
        .status(400)
        .json({ message: "Title and assigned member are required" });
    }

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Verify the creator is authorized
    if (team.creator.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to create tasks" });
    }

    // Verify assignedTo is a team member
    const isMember = team.members.some(
      (member) => member.user.toString() === assignedTo
    );
    if (!isMember) {
      return res
        .status(400)
        .json({ message: "Assigned user is not a team member" });
    }

    // Create new task
    const newTask = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      dueTime,
      assignedTo,
      priority: priority || "medium",
      creator: req.user.id,
      status: "pending",
    };

    // Add task to team
    team.tasks.push(newTask);
    await team.save();

    // Get the newly created task with populated fields
    const populatedTeam = await Team.findById(teamId)
      .populate("tasks.assignedTo", "email firstName lastName")
      .populate("tasks.creator", "email firstName lastName");

    const createdTask = populatedTeam.tasks[populatedTeam.tasks.length - 1];
    res.status(201).json(createdTask);
  } catch (error) {
    console.error("Create team task error:", error);
    res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};

export const updateTeamTask = async (req, res) => {
  try {
    const { teamId, taskId } = req.params;
    const updates = req.body;

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Find the task
    const task = team.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify user is authorized (creator or assigned member)
    const isAuthorized =
      team.creator.toString() === req.user.id ||
      task.creator.toString() === req.user.id;

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    // If assignedTo is being updated, verify the new assignee is a team member
    if (updates.assignedTo) {
      const isMember = team.members.some(
        (member) => member.user.toString() === updates.assignedTo
      );
      if (!isMember) {
        return res
          .status(400)
          .json({ message: "Assigned user is not a team member" });
      }
    }

    // Update task fields
    Object.keys(updates).forEach((key) => {
      if (key === "dueDate" && updates[key]) {
        task[key] = new Date(updates[key]);
      } else {
        task[key] = updates[key];
      }
    });

    task.updatedAt = new Date();
    await team.save();

    // Get updated task with populated fields
    const populatedTeam = await Team.findById(teamId)
      .populate("tasks.assignedTo", "email firstName lastName")
      .populate("tasks.creator", "email firstName lastName");

    const updatedTask = populatedTeam.tasks.id(taskId);
    res.json(updatedTask);
  } catch (error) {
    console.error("Update team task error:", error);
    res.status(500).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
};

export const deleteTeamTask = async (req, res) => {
  try {
    const { teamId, taskId } = req.params;

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Find the task
    const task = team.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify user is authorized (creator or team creator)
    const isAuthorized =
      team.creator.toString() === req.user.id ||
      task.creator.toString() === req.user.id;

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this task" });
    }

    // Remove the task
    task.remove();
    await team.save();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete team task error:", error);
    res.status(500).json({
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Find team and populate member and task details
    const team = await Team.findById(teamId)
      .populate("creator", "email firstName lastName")
      .populate("members.user", "email firstName lastName")
      .populate({
        path: "tasks",
        populate: [
          {
            path: "assignedTo",
            select: "email firstName lastName",
          },
          {
            path: "creator",
            select: "email firstName lastName",
          },
        ],
      });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Verify user is a team member
    const isMember = team.members.some(
      (member) => member.user._id.toString() === req.user.id
    );

    // Allow access if user is either a member or the creator
    if (!isMember && team.creator._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this team" });
    }

    res.json(team);
  } catch (error) {
    console.error("Get team error:", error);
    res.status(500).json({
      message: "Failed to get team details",
      error: error.message,
    });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body;

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Verify the user is the team creator
    if (team.creator.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this team" });
    }

    // Update team fields
    if (name) team.name = name;
    if (description) team.description = description;
    team.updatedAt = new Date();

    await team.save();

    // Get updated team with populated fields
    const updatedTeam = await Team.findById(teamId)
      .populate("creator", "email firstName lastName")
      .populate("members.user", "email firstName lastName")
      .populate({
        path: "tasks",
        populate: [
          {
            path: "assignedTo",
            select: "email firstName lastName",
          },
          {
            path: "creator",
            select: "email firstName lastName",
          },
        ],
      });

    res.json(updatedTeam);
  } catch (error) {
    console.error("Update team error:", error);
    res.status(500).json({
      message: "Failed to update team",
      error: error.message,
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Verify the user is the team creator
    if (team.creator.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to remove members" });
    }

    // Find member index
    const memberIndex = team.members.findIndex(
      (member) => member._id.toString() === memberId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Cannot remove team creator
    if (team.members[memberIndex].user.toString() === team.creator.toString()) {
      return res.status(400).json({ message: "Cannot remove team creator" });
    }

    // Remove member's tasks
    const memberUserId = team.members[memberIndex].user;
    team.tasks = team.tasks.filter(
      (task) => task.assignedTo.toString() !== memberUserId.toString()
    );

    // Remove the member
    team.members.splice(memberIndex, 1);
    await team.save();

    // Get updated team with populated fields
    const updatedTeam = await Team.findById(teamId)
      .populate("creator", "email firstName lastName")
      .populate("members.user", "email firstName lastName")
      .populate({
        path: "tasks",
        populate: [
          {
            path: "assignedTo",
            select: "email firstName lastName",
          },
          {
            path: "creator",
            select: "email firstName lastName",
          },
        ],
      });

    res.json(updatedTeam);
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      message: "Failed to remove team member",
      error: error.message,
    });
  }
};
