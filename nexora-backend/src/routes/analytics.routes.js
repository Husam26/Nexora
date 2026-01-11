const express = require("express");
const getDashboardStats = require("../controllers/analytics.controller");
const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/overview", auth , getDashboardStats);

module.exports = router;
