const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { verifyUser, logUser, getDashboard } = require('../Util/aviral');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');
const dotenv = require('dotenv');
dotenv.config();

const prisma = new PrismaClient();

const loginStudent = asyncHandler(async (req, res) => {
  try {
    const { username, password } = req.body;

    const student = await prisma.user.findUnique({
      where: { enrollmentNumber: username },
    });

    if (!student) {
      const response = await logUser({ username, password });

      if (!response.data.user_group) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const aviraltoken = response.data.jwt_token;
      const session = response.data.session_id;
      const dashboard = await getDashboard(aviraltoken, session);

      const {
        student_id,
        first_name,
        middle_name,
        last_name,
        program,
        phone,
        admission_year
      } = dashboard.data;

      const name = `${first_name} ${middle_name} ${last_name}`.trim();
      const batch = student_id.substring(0, 7);

      const newStudent = await prisma.user.create({
        data: {
          name,
          enrollmentNumber: student_id,
          program,
          batchYear: admission_year,
          batch,
        },
      });

      const token = generateToken(newStudent.userId, name);
      return res.status(200).json({ token, user: newStudent });
    } else {
      const isMatch = await verifyUser({ username, password });

      if (!isMatch) {
        return res.status(401).json({ message: "Username or Password is Incorrect." });
      }

      const token = generateToken(student.userId, student.name);
      return res.status(200).json({ token, user: student });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error." });
  } finally {
    await prisma.$disconnect();
  }
});

const generateToken = (userId, name) => {
  return jwt.sign({ userId, name }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = { loginStudent };