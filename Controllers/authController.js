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
          isVerified: false
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

const verifyStudent = asyncHandler(async (req, res) => {
  try {
    const { user } = req;
    const userId = parseInt(req.params.id, 10);
    const { phoneNumber, upiId } = req.body;

    if (!user) {
      throw new BadRequestError('Something went wrong');
    }

    const foundUser = await prisma.user.findUnique({
      where: { userId },
    });

    if (!foundUser) {
      throw new NotFoundError('User does not exist');
    }

    if (user.userId !== foundUser.userId) {
      throw new UnauthenticatedError('User is not permitted to verify this profile');
    }

    if (!foundUser.isVerified) {
      const updatedUser = await prisma.user.update({
        where: { userId },
        data: {
          phoneNumber: phoneNumber || foundUser.phoneNumber,
          upiId: upiId || foundUser.upiId,
          isVerified: true,
        },
      });

      res.status(StatusCodes.OK).json(updatedUser);
    } else {
      res.status(StatusCodes.OK).json({ message: 'User is already verified' });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

const generateToken = (userId, name) => {
  return jwt.sign({ userId, name }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = { loginStudent, verifyStudent };