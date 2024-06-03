const express = require("express");
const { authenticateToken } = require('../Middlewares/authMiddleware');

const {
  getAllProducts,
  getAllProductsOfUser,
  deleteProduct,
  editProduct,
  createProduct,
  uploadProductImage,
  searchByCategory,
  getProductById
} = require('../Controllers/productController');

const router = express.Router();

router.route("/").get(getAllProducts).post(authenticateToken, createProduct);
router.route("/:id").put(authenticateToken, editProduct).delete(authenticateToken, deleteProduct).get(getProductById);
router.post("/upload", authenticateToken, uploadProductImage);
router.route("/filter").get(authenticateToken,searchByCategory);
router.get("/user", authenticateToken, getAllProductsOfUser);

module.exports = router;