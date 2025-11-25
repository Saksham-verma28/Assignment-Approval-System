const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const upload = require('../config/multer')
const { studentHome, studentDashboard, uploadAssignment, downloadAssignment, statusFilter, assignmentFilter, allAssignment, renderAssignment, submitAssignment} = require('../controllers/student')
const cloudinary = require("cloudinary").v2;
const path = require("path");
const multer = require("multer")
const Assignment = require('../models/assignment')
const {sendEmail} = require('../config/sendEmail');
const { accessSync } = require('fs');




router.get('/dashboard', studentHome)

router.get('/upload/assignment', studentDashboard);

router.post('/assignment/upload', upload.single('file'),uploadAssignment);

router.get('/assignment/download/:id',downloadAssignment)

router.post('/status/filter',statusFilter)

router.post('/assignment/filter',assignmentFilter)

router.get('/assignment/all',allAssignment)

router.get('/assignment/all',renderAssignment)

router.post('/assignment/submit/:id',submitAssignment)

router.get('/assignment/history/:id',async(req,res)=>{

    const assignmentDetail = await Assignment.findById(req.params.id);

    res.render("user/student/viewAssignment", {assignmentDetail: assignmentDetail})
})


// router.get('/mail',sendEmail);

module.exports = router