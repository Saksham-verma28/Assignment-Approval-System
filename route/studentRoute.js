const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {upload, upload2} = require('../config/multer')
const fs = require('fs')
const { studentHome, studentDashboard, uploadAssignment, statusFilter, assignmentFilter, allAssignment, renderAssignment, submitAssignment, deleteAssignment, assignmentHistory, editAssignment, uploadEditAssignment, resubmitAssignment, resubmitUploadAssignment } = require('../controllers/student')
const cloudinary = require("cloudinary").v2;
const path = require("path");
const multer = require("multer")
const Assignment = require('../models/assignment')
const { sendEmail, sendMail } = require('../config/sendEmail');
const { accessSync } = require('fs');
const User = require('../models/user');
const { decode } = require('punycode');
const userauth = require('../middleware/userAuth')
const {verifyToken,studentOnly} = require('../middleware/userAuth')





router.get('/dashboard',verifyToken,studentOnly, studentHome)

router.get('/upload/assignment', verifyToken,studentOnly, studentDashboard);

router.post('/assignment/upload', verifyToken,studentOnly, upload.single('file'), uploadAssignment);

router.get('/assignment/delete/:id', verifyToken,studentOnly, deleteAssignment)

router.post('/status/filter', verifyToken,studentOnly, statusFilter)

router.post('/assignment/filter', verifyToken,studentOnly, assignmentFilter)

router.get('/assignment/all', verifyToken,studentOnly, allAssignment)

router.get('/assignment/all', verifyToken,studentOnly, renderAssignment)

router.post('/assignment/submit/:id',verifyToken,studentOnly, submitAssignment)

router.get('/assignment/history/:id', verifyToken,studentOnly, assignmentHistory)


router.get('/assignment/edit/:id', verifyToken,studentOnly, editAssignment);


router.post('/assignment/editAssignment/:id', upload.single('file'), verifyToken,studentOnly, uploadEditAssignment);


router.get('/assignment/resubmit/:id', verifyToken,studentOnly, resubmitAssignment)




router.post('/assignment/resubmit/:id', upload.single('newFile'), verifyToken,studentOnly, resubmitUploadAssignment)


router.get('/settings', verifyToken,studentOnly, async (req, res) => {

    let name = req.query.name;

    let email;
    let token  = req.cookies["User"];
    jwt.verify(token,process.env.JWT_KEY,(err,decoded)=>{
        email = decoded.email
    })



    let user = await User.findOne({ email: email })
    res.render('user/editProfile', { user: user, success: false })
})



module.exports = router