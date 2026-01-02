const jwt = require('jsonwebtoken');
const path = require('path');
const Assignment = require('../models/assignment');
const User = require('../models/user');
const Tracker = require('../models/assignmentTraker');
const cloudinary = require("cloudinary").v2;
const fs = require('fs');
const { sendMail } = require('../config/sendEmail');
const { profile } = require('console');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});

async function studentHome(req, res) {
    const token = req.cookies["User"];
    let name, email;

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
       
        name = decoded.name;
        email = decoded.email;
    });

    let user = await User.findOne({email: email})


    


    const assignmentDetails = await Assignment.find({ email: email }).sort({ _id: -1 }).limit(5);
    const totalDrafts = await Assignment.countDocuments({ student_name: name, status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: name, status: { $in: ['submitted', 'resubmitted'] }});
    const totalApproved = await Assignment.countDocuments({ student_name: name, status: 'approved' });
    const totalRejected = await Assignment.countDocuments({ student_name: name, status: 'rejected' });
    const allProfessor = await User.find({ role: 'Professor' });





    res.render("user/student/studentHome", {
        assignments: assignmentDetails,
        name: name,
        totalDrafts,
        totalSubmitted,
        totalApproved,
        totalRejected,
        allProfessor,
        profilePic: user.profilePic
    });
}

function studentDashboard(req, res) {
    res.render("user/student/uploadAssignment", { success: '' });
}

async function uploadAssignment(req, res) {
    const token = req.cookies['User'];
    let name, email;

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name;
        email = decoded.email;
    });

    const filePath = req.file.path;

    const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "raw",
        format: "pdf"
    });

    const previewUrl = result.secure_url;
    const downloadUrl = previewUrl.replace("/upload/", `/upload/fl_attachment/`);
    fs.unlinkSync(filePath);

    const newAssignment = await Assignment.create({
        student_name: name,
        email: email,
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        upload_path: previewUrl,
        download: downloadUrl
    });

    await Tracker.create({
        assignmentId: newAssignment._id,
        studentEmail: email,
        currentStatus: "draft",
        history: [{ status: "draft", updatedBy: "student" }]
    });

    res.render("user/student/uploadAssignment", { success: "Assignment upload Successfully!" });
}

async function statusFilter(req, res) {
    const token = req.cookies['User'];
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => name = decoded.name);

    let status;
    if (req.body.status == 'all') status = await Assignment.find({ student_name: name });
    else status = await Assignment.find({ student_name: name, status: req.body.status });


    let find = await User.find({name: name})

    let user = find[0]

    const totalDrafts = await Assignment.countDocuments({ student_name: name, status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: name, status: { $in: ['submitted', 'resubmitted'] }});
    const totalApproved = await Assignment.countDocuments({ student_name: name, status: 'approved' });
    const totalRejected = await Assignment.countDocuments({ student_name: name, status: 'rejected' });
    const allProfessor = await User.find({ role: 'Professor' });

    res.render("user/student/studentHome", {
        assignments: status,
        name,
        totalDrafts,
        totalSubmitted,
        totalApproved,
        totalRejected,
        allProfessor,
        profilePic: user.profilePic
    });
}

async function assignmentFilter(req, res) {
    const token = req.cookies['User'];
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => name = decoded.name);

    let status;
    if (req.body.status == 'all') status = await Assignment.find({ student_name: name });
    else status = await Assignment.find({ student_name: name, status: req.body.status });

    res.render("user/student/assignmentList", { assignment: status });
}

async function allAssignment(req, res) {
    const token = req.cookies['User'];
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => name = decoded.name);

    const allAssignment = await Assignment.find({ student_name: name });
    res.render("user/student/assignmentList", { assignment: allAssignment });
}

function renderAssignment(req, res) {
    res.render("user/student/assignmentList", { assignment: '' });
}

async function submitAssignment(req, res) {
    const id = req.params.id;

    await Assignment.findByIdAndUpdate(id, { professor: req.body.professorId });
    const submitted = await Assignment.findByIdAndUpdate(id, { status: "submitted" });

    await Tracker.updateOne(
        { assignmentId: id },
        {
            currentStatus: "submitted",
            $push: { history: { status: "submitted", updatedBy: "student" } }
        }
    );

    let find = await User.find({name: name})

    let user = find[0]


    const assignment = await Assignment.find({ student_name: submitted.student_name });
    const totalDrafts = await Assignment.countDocuments({ student_name: submitted.student_name, status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: submitted.student_name, status: { $in: ['submitted', 'resubmitted'] } });
    const totalApproved = await Assignment.countDocuments({ student_name: submitted.student_name, status: 'approved' });
    const totalRejected = await Assignment.countDocuments({ student_name: submitted.student_name, status: 'rejected' });
    const allProfessor = await User.find({ role: 'Professor' });

    const findProfessor = await User.find({ name: req.body.professorId });
    const professorEmail = findProfessor[0].email;

    sendMail(professorEmail, "New Assignment Submission – University Assignment Approval System",
        `
      <div style="font-family: Arial; line-height: 1.6;">
          <h2 style="color: #b63d2a;">University Assignment Approval System</h2>
          <p>The student <strong>${submitted.student_name}</strong> has submitted an assignment.</p>
          <p><strong>Assignment Title:</strong> ${submitted.title}</p>
          <p>Please review it.</p>
      </div>
    `);

    res.render("user/student/studentHome", {
        assignments: assignment,
        name: submitted.student_name,
        totalDrafts,
        totalSubmitted,
        totalApproved,
        totalRejected,
        allProfessor,
        profilePic: user.profilePic
    });
}

async function deleteAssignment(req, res) {
    const id = req.params.id;
    await Assignment.findByIdAndDelete(id);

    const token = req.cookies['User'];
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => name = decoded.name);


    let find = await User.find({name: name})

    let user = find[0]

    const assignment = await Assignment.find({ student_name: name });

    const totalDrafts = await Assignment.countDocuments({ student_name: name, status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: name, status: { $in: ['submitted', 'resubmitted'] }});
    const totalApproved = await Assignment.countDocuments({ student_name: name, status: 'approved' });
    const totalRejected = await Assignment.countDocuments({ student_name: name, status: 'rejected' });
    const allProfessor = await User.find({ role: 'Professor' });

    res.render("user/student/studentHome", {
        assignments: assignment,
        name,
        totalDrafts,
        totalSubmitted,
        totalApproved,
        totalRejected,
        allProfessor,
        profilePic: user.profilePic
    });
}

async function assignmentHistory(req, res) {

    const assignmentDetail = await Assignment.findById(req.params.id);
    let tracker = await Tracker.findOne({ assignmentId: req.params.id });

    if (!tracker) {
        tracker = await Tracker.create({
            assignmentId: assignmentDetail._id,
            studentEmail: assignmentDetail.email,
            currentStatus: assignmentDetail.status,
            history: [
                {
                    status: assignmentDetail.status,
                    updatedBy: "system"
                }
            ]
        });
    }

    res.render("user/student/viewAssignment", { assignmentDetail, tracker });
}


async function editAssignment(req, res) {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
        return res.render('user/student/editAssignment', { error_message: "Assignment not found" });
    }
    res.render('user/student/editAssignment', { assignment, msg: '' });
}

async function uploadEditAssignment(req, res) {
    const id = req.params.id;
    const find = await Assignment.findById(id);

    const { title, category, description } = req.body;

    let upload_path = find.upload_path;
    let downloadUrl = find.download;

    if (req.file) {
        const filePath = req.file.path;

        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "raw",
            format: "pdf"
        });

        upload_path = result.secure_url;
        downloadUrl = upload_path.replace("/upload/", "/upload/fl_attachment/");
        fs.unlinkSync(filePath);
    }

    await Assignment.findByIdAndUpdate(id, {
        title,
        category,
        description,
        upload_path,
        downloadUrl
    });

    res.render('user/student/editAssignment', { assignment: '', msg: 'Assignment Updated Succesfully' });
}

async function resubmitAssignment(req, res) {
    const id = req.params.id;
    const assignment = await Assignment.findById(id);
    res.render('user/student/resubmitAssignment', { assignment });
}

async function resubmitUploadAssignment(req, res) {
    const id = req.params.id;
    const assignment = await Assignment.findById(id);

    const { description } = req.body;

    let upload_path = assignment.upload_path;
    let downloadUrl = assignment.download;

    if (req.file) {
        const filePath = req.file.path;

        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "raw",
            format: "pdf"
        });

        upload_path = result.secure_url;
        downloadUrl = upload_path.replace("/upload/", "/upload/fl_attachment/");

        fs.unlinkSync(filePath);
    }

    
    await Assignment.findByIdAndUpdate(id, {
        description: description,
        upload_path: upload_path,
        download: downloadUrl,
        status: "resubmitted"
    });

    await Tracker.updateOne(
        { assignmentId: id },
        {
            currentStatus: "resubmitted",
            $push: { history: { status: "resubmitted", updatedBy: "student" } }
        }
    );

    let user = await User.findOne({ name: assignment.student_name });

    const assignmentDetails = await Assignment.find({ student_name: assignment.student_name })
        .sort({ _id: -1 })
        .limit(5);

    const totalDrafts = await Assignment.countDocuments({ student_name: assignment.student_name, status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: assignment.student_name, status: { $in: ['submitted', 'resubmitted'] } });
    const totalApproved = await Assignment.countDocuments({ student_name: assignment.student_name, status: 'approved' });
    const totalRejected = await Assignment.countDocuments({ student_name: assignment.student_name, status: 'rejected' });
    const allProfessor = await User.find({ role: 'Professor' });

    let email;
    let token = req.cookies['User'];
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => email = decoded.email);

    sendMail(
        email,
        "Assignment Resubmission Successful – University Assignment Approval System",
        `
        <div style="font-family: Arial;">
            <h2 style="color: #b63d2a;">University Assignment Approval System</h2>
            <p>Your assignment has been resubmitted successfully.</p>
            <p><strong>Assignment File:</strong> ${req.file ? req.file.originalname : upload_path.split('/').pop()}</p>
        </div>
        `
    );



    

    res.render("user/student/studentHome", {
        assignments: assignmentDetails,
        name: assignment.student_name,
        totalDrafts,
        totalSubmitted,
        totalApproved,
        totalRejected,
        allProfessor,
        profilePic: user.profilePic
    });
}


module.exports = {
    studentHome,
    studentDashboard,
    uploadAssignment,
    statusFilter,
    assignmentFilter,
    allAssignment,
    renderAssignment,
    submitAssignment,
    deleteAssignment,
    assignmentHistory,
    editAssignment,
    uploadEditAssignment,
    resubmitAssignment,
    resubmitUploadAssignment
};
