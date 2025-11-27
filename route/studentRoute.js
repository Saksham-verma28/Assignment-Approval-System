const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const upload = require('../config/multer')
const { studentHome, studentDashboard, uploadAssignment, statusFilter, assignmentFilter, allAssignment, renderAssignment, submitAssignment} = require('../controllers/student')
const cloudinary = require("cloudinary").v2;
const path = require("path");
const multer = require("multer")
const Assignment = require('../models/assignment')
const {sendEmail, sendMail} = require('../config/sendEmail');
const { accessSync } = require('fs');




router.get('/dashboard', studentHome)

router.get('/upload/assignment', studentDashboard);

router.post('/assignment/upload', upload.single('file'),uploadAssignment);

router.get('/assignment/delete/:id',async (req,res)=>{
    let id = req.params.id
    await Assignment.findByIdAndDelete(id);
    const token = req.cookies['User']

    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name
    })

   let assignment = await Assignment.find({student_name: name})


    const totalDrafts = await Assignment.countDocuments({ student_name: name, status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: name, status: 'submitted' });

    const contextData = {
        assignments: assignment,
        name: name,
        totalDrafts: totalDrafts,
        totalSubmitted: totalSubmitted
    };
    res.render("user/student/studentHome", contextData);
})

router.post('/status/filter',statusFilter)

router.post('/assignment/filter',assignmentFilter)

router.get('/assignment/all',allAssignment)

router.get('/assignment/all',renderAssignment)

router.post('/assignment/submit/:id',submitAssignment)

router.get('/assignment/history/:id',async(req,res)=>{

    const assignmentDetail = await Assignment.findById(req.params.id);

    res.render("user/student/viewAssignment", {assignmentDetail: assignmentDetail})
})


router.get('/assignment/edit/:id',async(req,res)=>{

    const assignment = await Assignment.findById(req.params.id);

    res.render('user/student/resubmitAssignment',{assignment: assignment})
})


router.post('/assignment/resubmit/:id',upload.single('newFile'),async(req,res)=>{
    let id = req.params.id;
    
    
    let assignment = await Assignment.findById(id);

    await Assignment.findByIdAndUpdate(id,{description: req.body.description, upload_path: `uploads/${assignment.student_name}/${req.file.filename}`, status: 'submitted'})

    const assignmentDetails = await Assignment.find({ student_name: assignment.student_name}).sort({ _id: -1 }).limit(5);
    const totalDrafts = await Assignment.countDocuments({  student_name: assignment.student_name,status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: assignment.student_name, status: 'submitted' });

    const contextData = {
        assignments: assignmentDetails,
        name: assignment.student_name,
        totalDrafts: totalDrafts,
        totalSubmitted: totalSubmitted
    };


    let email;
    let token = req.cookies['User'];
    jwt.verify(token,process.env.JWT_KEY,(err,decoded)=>{
        email = decoded.email
    })

    sendMail(
    email,
    "Assignment Resubmission Successful – University Assignment Approval System",
    `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #b63d2a;">University Assignment Approval System</h2>

        <p>Dear Student,</p>

        <p>
            Your previously <strong>rejected assignment</strong> has been successfully 
            <strong>resubmitted</strong>.
        </p>

        <p>
            <strong>Assignment File:</strong> ${req.file.originalname}
        </p>

        <p>
            Our faculty team will now review your updated submission.  
            You will be notified once the evaluation is completed.
        </p>

        <p>Thank you for your timely response.</p>

        <p>
            Regards,<br>
            <strong>University Assignment Approval System</strong>
        </p>
    </div>
    `
);

    res.render("user/student/studentHome", contextData);
    
})

module.exports = router