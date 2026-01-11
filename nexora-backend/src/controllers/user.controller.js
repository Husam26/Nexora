const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ===============================
   GET USERS (WORKSPACE ISOLATED)
================================ */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "employee",
      workspace: req.user.workspaceId, // 🔥 ISOLATION FIX
    }).select("name email emailNotifications");

    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: err.message,
    });
  }
};

/* ===============================
   TOGGLE EMAIL NOTIFICATIONS
================================ */
const toggleEmailNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.emailNotifications = !user.emailNotifications;
    await user.save();

    res.json({ emailNotifications: user.emailNotifications });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update notification setting",
      error: err.message,
    });
  }
};

/* ===============================
   CREATE MEMBER (SAME WORKSPACE)
================================ */
const createMember = async (req, res) => {
  const { name, email, role } = req.body;

  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ msg: "Access denied" });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      workspace: req.user.workspaceId,
    });

    // Return temp password ONLY on creation
    res.status(201).json({
      msg: "User created",
      loginDetails: {
        email,
        password: tempPassword,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const getAdminMembers = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Access denied" });

  try {
    const members = await User.find({ workspace: req.user.workspaceId })
      .select("name email role emailNotifications"); // exclude passwords
    res.json(members);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch members" });
  }
};

// ✅ RESET PASSWORD (Optional)
const resetMemberPassword = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Access denied" });

  try {
    const member = await User.findOne({
      _id: req.params.id,
      workspace: req.user.workspaceId,
    });
    if (!member) return res.status(404).json({ msg: "Member not found" });

    const tempPassword = Math.random().toString(36).slice(-8);
    member.password = await bcrypt.hash(tempPassword, 10);
    await member.save();

    res.json({
      msg: "Password reset",
      loginDetails: { email: member.email, password: tempPassword },
    });
  } catch (err) {
    res.status(500).json({ msg: "Password reset failed" });
  }
};


module.exports = {
  getUsers,
  toggleEmailNotifications,
  createMember,
  getAdminMembers,
  resetMemberPassword,
};
