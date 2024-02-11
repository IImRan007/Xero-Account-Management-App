const asyncHandler = require("express-async-handler");

const Company = require("../models/companyModel");

const createCompany = asyncHandler(async (req, res) => {
  const { company } = req.body;
  console.log(req.body);

  try {
    // Find a company with the given name
    const existingCompany = await Company.findOne({ company });

    if (existingCompany) {
      return res.status(400).json({ message: "Company already exists" });
    }

    // Create a new company
    const newCompany = new Company({ company });
    const savedCompany = await newCompany.save();

    res.status(201).json({ savedCompany, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const editCompany = asyncHandler(async (req, res) => {
  const data = await Company.findById(req.params.id);

  if (!data) {
    res.status(404);
    throw new Error("Company not found");
  }

  const updatedCompany = await Company.findByIdAndUpdate(
    req.params.id,
    { company: req.body.company },
    {
      new: true,
    }
  );

  res.status(200).json(updatedCompany);
});

const getAllCompany = asyncHandler(async (req, res) => {
  const companies = await Company.find();

  res.status(200).json(companies);
});

const deleteCompany = asyncHandler(async (req, res) => {
  const data = await Company.findById(req.params.id);

  if (!data) {
    res.status(404);
    throw new Error("Company not found");
  }

  await Company.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true });
});

module.exports = { createCompany, editCompany, getAllCompany, deleteCompany };
