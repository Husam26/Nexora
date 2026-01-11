const Task = require("../models/Task");

const getDashboardStats = async (req, res) => {
  try {
    const { id: userId, role, workspaceId } = req.user;

    // 🔒 ALWAYS workspace isolation
    let filter = {
      workspace: workspaceId,
    };

    // 👤 Employee sees only assigned tasks
    if (role !== "admin") {
      filter.assignedTo = userId;
    }

    const totalTasks = await Task.countDocuments(filter);

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: "pending",
    });

    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: "in_progress", // ✅ FIXED
    });

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "done",
    });

    const completionPercentage =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    res.status(200).json({
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      completionPercentage,
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Dashboard analytics failed" });
  }
};

module.exports = getDashboardStats;
