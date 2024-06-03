const { PrismaClient } = require('@prisma/client');
const cloudinary = require("cloudinary").v2;
const asyncHandler = require("express-async-handler");
const fs = require("fs")
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../errors");

const prisma = new PrismaClient();

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    orderBy: { productId: 'asc' },
    include: {
      images: true,
      owner: true,
    },
  });

  const formattedProducts = products.map((product) => {
    const { images, ...rest } = product;
    const formattedImages = images.map((image) => ({
      publicID: image.publicID,
      url: image.url,
    }));
    return { ...rest, images: formattedImages };
  });

  res.status(StatusCodes.OK).json({ count: formattedProducts.length, products: formattedProducts });
});

const getProductById = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10);

  const product = await prisma.product.findUnique({
    where: { productId },
    include: { images: true, owner: true }
  });

  if (!product) {
    res.status(StatusCodes.NOT_FOUND).json({ message: 'Product not found' });
    return;
  }

  const { images, ...rest } = product;
  const formattedImages = images.map((image) => ({
    publicID: image.publicID,
    url: image.url,
  }));

  const formattedProduct = { ...rest, images: formattedImages };
  res.status(StatusCodes.OK).json(formattedProduct);
});

const getAllProductsOfUser = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const products = await prisma.product.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'asc' }
  });

  res.status(StatusCodes.OK).json({ count: products.length, products });
});

const createProduct = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const productData = {
      ...req.body,
      owner: { connect: { userId } },
      images: {
        create: req.body.images.map(image => ({
          publicID: image.publicID,
          url: image.url,
        })),
      },
    };

    const product = await prisma.product.create({
      data: productData,
    });

    res.status(StatusCodes.CREATED).json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = asyncHandler(async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id, 10);

    const product = await prisma.product.findUnique({
      where: { productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await prisma.productImage.deleteMany({
      where: { productId },
    });

    await prisma.product.delete({
      where: { productId },
    });

    res.status(StatusCodes.OK).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

const editProduct = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = parseInt(req.params.id, 10);
    const updatedData = req.body;

    const product = await prisma.product.findUnique({
      where: { productId },
      include: { owner: true }
    });

    if (!product) {
      throw new NotFoundError("Product does not exist");
    }

    if (product.ownerId !== userId) {
      throw new UnauthenticatedError("User is not permitted to edit this product");
    }

    const updatedProduct = await prisma.product.update({
      where: { productId },
      data: updatedData
    });

    res.status(StatusCodes.OK).json(updatedProduct);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new BadRequestError("Image files not found");
  }

  const imageFiles = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

  try {
    const uploadPromises = imageFiles.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        use_filename: true,
        folder: 'sample-uploads'
      });
      fs.unlinkSync(file.tempFilePath);
      return {
        publicID: result.public_id,
        url: result.secure_url,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    res.status(StatusCodes.OK).json({ images: uploadedImages });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
});

const searchByCategory = asyncHandler(async (req, res) => {
  const { category } = req.query;

  if (!category) {
    throw new BadRequestError("Category parameter is required");
  }

  const products = await prisma.product.findMany({
    where: { category },
    orderBy: { createdAt: 'asc' }
  });

  res.status(StatusCodes.OK).json({ count: products.length, products });
});

module.exports = {
  getAllProducts,
  getAllProductsOfUser,
  deleteProduct,
  editProduct,
  createProduct,
  uploadProductImage,
  searchByCategory,
  getProductById
};