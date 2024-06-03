const express = require("express");
const { authenticateToken } = require('../Middlewares/authMiddleware');
const { updateUser, getCurrentUserProfile, uploadProfilePicture } = require("../Controllers/userController");

const router = express.Router();

router.put('/updateProfile/:id', authenticateToken, updateUser);
router.get("/profile", authenticateToken, getCurrentUserProfile);
router.post("/upload", authenticateToken, uploadProfilePicture)

module.exports = router;