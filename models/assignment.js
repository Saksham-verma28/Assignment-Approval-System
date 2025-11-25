const mongoose = require("mongoose");


const assignmentSchema = new mongoose.Schema({

  student_name: {
    type: String
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ["assignment","report","thesis","presentation"],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  upload_path:{
    type: String,
    required: true
  },
  submit:{
    type: String,
    default: new Date().toDateString()
  },
  status:{
    type: String,
    enum: ["draft","submitted","approved","rejected"],
    default: "draft"
  }
});

const Assignment = mongoose.model("assignment", assignmentSchema);

module.exports = Assignment;
