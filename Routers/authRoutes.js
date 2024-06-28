const express = require('express');
const { loginStudent } = require('../Controllers/authController');

const router = express.Router();

router.post('/login', loginStudent);

module.exports = router;