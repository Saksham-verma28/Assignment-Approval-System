const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const upload = require('../config/multer')
const { studentHome, studentDashboard, uploadAssignment, statusFilter, assignmentFilter, allAssignment, renderAssignment, submitAssignment, deleteAssignment, assignmentHistory, editAssignment, uploadEditAssignment, resubmitAssignment,resubmitUploadAssignment } = require('../controllers/student')
const cloudinary = require("cloudinary").v2;
const path = require("path");
const multer = require("multer")
const Assignment = require('../models/assignment')
const { sendEmail, sendMail } = require('../config/sendEmail');
const { accessSync } = require('fs');
const User = require('../models/user')





router.get('/dashboard', studentHome)

router.get('/upload/assignment', studentDashboard);

router.post('/assignment/upload', upload.single('file'), uploadAssignment);

router.get('/assignment/delete/:id',deleteAssignment)

router.post('/status/filter', statusFilter)

router.post('/assignment/filter', assignmentFilter)

router.get('/assignment/all', allAssignment)

router.get('/assignment/all', renderAssignment)

router.post('/assignment/submit/:id', submitAssignment)

router.get('/assignment/history/:id', assignmentHistory)


router.get('/assignment/edit/:id', editAssignment);


router.post('/assignment/editAssignment/:id', upload.single('file'), uploadEditAssignment);


router.get('/assignment/resubmit/:id', resubmitAssignment)




router.post('/assignment/resubmit/:id', upload.single('newFile'), resubmitUploadAssignment)

module.exports = router