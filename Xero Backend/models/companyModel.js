const mongoose = require("mongoose");

const companySchema = mongoose.Schema(
  {
    company: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);
