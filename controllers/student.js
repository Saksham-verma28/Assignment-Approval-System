const jwt = require('jsonwebtoken')
const path = require('path')
const Assignment = require('../models/assignment')
const cloudinary = require("cloudinary").v2;
const fs = require('fs')


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});


async function studentHome(req, res) {
    const token = req.cookies["User"]
    let name;


    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.redirect('/auth/login');
        }
        name = decoded.name;

    })

    const assignmentDetails = await Assignment.find({ student_name: name }).sort({ _id: -1 }).limit(5);
    const totalDrafts = await Assignment.countDocuments({ student_name: name, status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: name, status: 'submitted' });
    const totalApproved = await Assignment.countDocuments({ student_name: name, status: 'approved' });
    const totalRejected = await Assignment.countDocuments({ student_name: name, status: 'rejected' });

    const contextData = {
        assignments: assignmentDetails,
        name: name,
        totalDrafts: totalDrafts,
        totalSubmitted: totalSubmitted,
        totalApproved: totalApproved,
        totalRejected: totalRejected
    };
    res.render("user/student/studentHome", contextData);
}

function studentDashboard(req, res) {
    res.render("user/student/uploadAssignment", { success: '' })
}


async function uploadAssignment(req, res) {

    const token = req.cookies['User']
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name
    })


    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "raw",
        format: "pdf"
    });

    const previewUrl = result.secure_url
    const downloadUrl = previewUrl.replace("/upload/", `/upload/fl_attachment/`)


    fs.unlinkSync(filePath);

    await Assignment.create({
        student_name: name,
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        upload_path: previewUrl,
        download: downloadUrl
    })


    res.render("user/student/uploadAssignment", { success: "Assignment upload Successfully!" })
}



async function statusFilter(req, res) {


    const token = req.cookies['User']
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name
    })

    let status;
    if (req.body.status == 'all') {
        status = await Assignment.find({ student_name: name });
    }
    else {
        status = await Assignment.find({ student_name: name, status: req.body.status });
    }


    const totalDrafts = await Assignment.countDocuments({ student_name: name, status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: name, status: 'submitted' });
    const totalApproved = await Assignment.countDocuments({ student_name: name, status: 'approved' });
    const totalRejected = await Assignment.countDocuments({ student_name: name, status: 'rejected' });

    const contextData = {
        assignments: status,
        name: name,
        totalDrafts: totalDrafts,
        totalSubmitted: totalSubmitted,
        totalApproved: totalApproved,
        totalRejected: totalRejected
    };
    res.render("user/student/studentHome", contextData);
}


async function assignmentFilter(req, res) {


    const token = req.cookies['User']
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name
    })

    let status;
    if (req.body.status == 'all') {
        status = await Assignment.find({ student_name: name });
    }
    else {
        status = await Assignment.find({ student_name: name, status: req.body.status });
    }

    res.render("user/student/assignmentList", { assignment: status });
}


async function allAssignment(req, res) {
    const token = req.cookies['User']
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name
    })


    let allAssignment = await Assignment.find({ student_name: name });

    res.render("user/student/assignmentList", { assignment: allAssignment })
}

function renderAssignment(req, res) {
    res.render("user/student/assignmentList", { assignment: '' })
}


async function submitAssignment(req, res) {
    const id = req.params.id;

    let submitted = await Assignment.findByIdAndUpdate(id, { status: "submitted" });

    let assignment = await Assignment.find({ student_name: submitted.student_name });
    const totalDrafts = await Assignment.countDocuments({ student_name: submitted.student_name, status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: submitted.student_name, status: 'submitted' });
    const totalApproved = await Assignment.countDocuments({ student_name: name, status: 'approved' });
    const totalRejected = await Assignment.countDocuments({ student_name: name, status: 'rejected' });

    const contextData = {
        assignments: assignment,
        name: submitted.student_name,
        totalDrafts: totalDrafts,
        totalSubmitted: totalSubmitted,
        totalApproved: totalApproved,
        totalRejected: totalRejected
    };
    res.render("user/student/studentHome", contextData);
}
module.exports = { studentHome, studentDashboard, uploadAssignment, statusFilter, assignmentFilter, allAssignment, renderAssignment, submitAssignment }