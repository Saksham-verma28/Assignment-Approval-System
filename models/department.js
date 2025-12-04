const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  department_name: {
    type: String,
    required: true,
    enum: ["CS","EE","ME","PH","CH","AR","HI"]
  },
  program_type: {
    type: String,
    enum: ["UG", "PG", "Research"],
    required: true
  },
  department_address: {
    type: String,
    required: true,
    trim: true
  }
});

const Department = mongoose.model("departments", departmentSchema);

module.exports = Department;
