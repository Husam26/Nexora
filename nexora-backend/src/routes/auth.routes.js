const express = require("express");
const router = express.Router();
const {
  signup,
  login,
} = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");
const { forgotPassword, resetPassword } = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


// 🔑 ADD THIS
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

module.exports = router;
