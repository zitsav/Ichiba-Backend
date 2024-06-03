const express = require('express');
const { loginStudent, verifyStudent } = require('../Controllers/authController');
const { authenticateToken } = require('../Middlewares/authMiddleware');

const router = express.Router();

router.post('/login', loginStudent);

router.post('/verify/:id', authenticateToken, verifyStudent);

module.exports = router;