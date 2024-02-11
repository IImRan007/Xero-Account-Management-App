const express = require("express");
const router = express.Router();
const {
  createCompany,
  editCompany,
  getAllCompany,
  deleteCompany,
} = require("../controllers/companyController");

router.post("/", createCompany);
router.get("/all", getAllCompany);
router.put("/:id", editCompany);
router.delete("/:id", deleteCompany);

module.exports = router;
