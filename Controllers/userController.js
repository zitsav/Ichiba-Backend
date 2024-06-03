const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const dotenv = require('dotenv');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require("../errors");
dotenv.config();

const prisma = new PrismaClient();

const updateUser = asyncHandler(async (req, res) => {
    try {
      const { user } = req;
      const userId = parseInt(req.params.id, 10);
      const { phoneNumber, upiId } = req.body;
  
      if (!user) {
        throw new BadRequestError('Something went wrong');
      }
  
      if (user.userId !== parseInt(userId)) {
        throw new UnauthenticatedError('User is not permitted to edit this profile');
      }
  
      const updatedData = {};
      if (phoneNumber) updatedData.phoneNumber = phoneNumber;
      if (upiId) updatedData.upiId = upiId;
  
      const foundUser = await prisma.user.update({
        where: { userId: parseInt(userId) },
        data: updatedData,
      });
  
      if (!foundUser) {
        throw new NotFoundError('User does not exist');
      }
  
      res.status(StatusCodes.OK).json(foundUser);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new BadRequestError('Image file not found');
  }

  const imageFile = req.files.image;

  try {
    const user = req.user;

    if (user.profilePicture && user.profilePicture.publicId) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId);
    }

    const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      use_filename: true,
      folder: 'profile-pictures',
    });

    const image = {
      publicID: result.public_id,
      url: result.secure_url,
    };

    fs.unlinkSync(imageFile.tempFilePath);

    const updatedUser = await prisma.user.update({
      where: { userId: user.userId },
      data: {
        profilePicture: {
          upsert: {
            create: image,
            update: image,
          },
        },
      },
      include: {
        profilePicture: true,
      },
    });

    res.status(StatusCodes.OK).json({ profilePicture: updatedUser.profilePicture });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      profilePicture: true,
    },
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json(user);
});
module.exports = { updateUser, getCurrentUserProfile, uploadProfilePicture };