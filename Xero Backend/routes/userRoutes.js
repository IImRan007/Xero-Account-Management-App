const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  createUser,
  deleteUser,
  updateUser,
  getSingleUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/create", createUser);
router.post("/login", loginUser);
router.get("/me", getMe);
router.get("/all", getAllUsers);
router.route("/:id").get(getSingleUser).put(updateUser).delete(deleteUser);

module.exports = router;
