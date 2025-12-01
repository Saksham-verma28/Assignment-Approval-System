const jwt = require('jsonwebtoken')
const path = require('path')
const Assignment = require('../models/assignment')
const User = require('../models/user')
const cloudinary = require("cloudinary").v2;
const fs = require('fs');
const { sendMail } = require('../config/sendEmail');


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

    const allProfessor = await User.find({ role: 'Professor' })


    const contextData = {
        assignments: assignmentDetails,
        name: name,
        totalDrafts: totalDrafts,
        totalSubmitted: totalSubmitted,
        totalApproved: totalApproved,
        totalRejected: totalRejected,
        allProfessor: allProfessor
    };
    res.render("user/student/studentHome", contextData);
}

function studentDashboard(req, res) {
    res.render("user/student/uploadAssignment", { success: '' })
}


async function uploadAssignment(req, res) {

    const token = req.cookies['User']
    let name, email;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name
        email = decoded.email
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
        email: email,
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

    const allProfessor = await User.find({ role: 'Professor' })

    const contextData = {
        assignments: status,
        name: name,
        totalDrafts: totalDrafts,
        totalSubmitted: totalSubmitted,
        totalApproved: totalApproved,
        totalRejected: totalRejected,
        allProfessor: allProfessor
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

    await Assignment.findByIdAndUpdate(id, { professor: req.body.professorId })
    let submitted = await Assignment.findByIdAndUpdate(id, { status: "submitted" });

    let assignment = await Assignment.find({ student_name: submitted.student_name });
    const totalDrafts = await Assignment.countDocuments({ student_name: submitted.student_name, status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: submitted.student_name, status: 'submitted' });
    const totalApproved = await Assignment.countDocuments({ student_name: submitted.student_name, status: 'approved' });
    const totalRejected = await Assignment.countDocuments({ student_name: submitted.student_name, status: 'rejected' });

    const allProfessor = await User.find({ role: 'Professor' })

    let findProfessor = await User.find({ name: req.body.professorId });
    const professorEmail = findProfessor[0].email;

    
    const contextData = {
        assignments: assignment,
        name: submitted.student_name,
        totalDrafts: totalDrafts,
        totalSubmitted: totalSubmitted,
        totalApproved: totalApproved,
        totalRejected: totalRejected,
        allProfessor: allProfessor
    };


    sendMail(
        professorEmail,
        "New Assignment Submission – University Assignment Approval System",
        `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #b63d2a;">University Assignment Approval System</h2>

      <p>Dear Professor,</p>

      <p>
          The student <strong>${submitted.student_name}</strong> has successfully 
          <strong>submitted the assignment</strong>.
      </p>

      <p>
          <strong>Assignment Title:</strong> ${submitted.title}<br>
      </p>

      <p>
          Kindly review the submission at your earliest convenience.
      </p>

      <p>
          Regards,<br>
          <strong>University Assignment Approval System</strong>
      </p>
  </div>
  `
    );



    res.render("user/student/studentHome", contextData);
}

 async function deleteAssignment(req, res){
    let id = req.params.id
    await Assignment.findByIdAndDelete(id);
    const token = req.cookies['User']

    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name
    })

    let assignment = await Assignment.find({ student_name: name })


    const totalDrafts = await Assignment.countDocuments({ student_name: name, status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: name, status: 'submitted' });
    const totalApproved = await Assignment.countDocuments({ student_name: name, status: 'approved' });
    const totalRejected = await Assignment.countDocuments({ student_name: name, status: 'rejected' });

    const allProfessor = await User.find({ role: 'Professor' })

    const contextData = {
        assignments: assignment,
        name: name,
        totalDrafts: totalDrafts,
        totalSubmitted: totalSubmitted,
        totalApproved: totalApproved,
        totalRejected: totalRejected,
        allProfessor: allProfessor
    };
    res.render("user/student/studentHome", contextData);
}


async function assignmentHistory(req, res){

    const assignmentDetail = await Assignment.findById(req.params.id);

    res.render("user/student/viewAssignment", { assignmentDetail: assignmentDetail })
}

async function editAssignment(req, res){
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.render('user/student/editAssignment', {
                error_message: "Assignment not found"
            });
        }

        res.render('user/student/editAssignment', {
            assignment: assignment,
            msg: ''
        });

    } catch (error) {
        res.render('user/student/resubmitAssignment', {
            error_message: "Something went wrong"
        });
    }
}


 async function uploadEditAssignment(req, res){
    try {
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

            downloadUrl = upload_path.replace(
                "/upload/",
                "/upload/fl_attachment/"
            );

            fs.unlinkSync(filePath);
        }

        await Assignment.findByIdAndUpdate(id, {
            title,
            category,
            description,
            upload_path,
            downloadUrl
        });

        res.render('user/student/editAssignment',{ assignment: '',msg: 'Assignment Updated Succesfully'})

    } catch (err) {
        console.log(err)
        res.redirect('/student/dashboard');
    }
}

async function resubmitAssignment(req,res){
    let id = req.params.id;
    let assignment = await Assignment.findById(id)

    res.render('user/student/resubmitAssignment',{assignment: assignment})
}


async function resubmitUploadAssignment(req, res){
    let id = req.params.id;


    let assignment = await Assignment.findById(id);

    await Assignment.findByIdAndUpdate(id, { description: req.body.description, upload_path: `uploads/${assignment.student_name}/${req.file.filename}`, status: 'submitted' })

    const assignmentDetails = await Assignment.find({ student_name: assignment.student_name }).sort({ _id: -1 }).limit(5);
    const totalDrafts = await Assignment.countDocuments({ student_name: assignment.student_name, status: 'draft' });
    const totalSubmitted = await Assignment.countDocuments({ student_name: assignment.student_name, status: 'submitted' });
    const totalApproved = await Assignment.countDocuments({ student_name: assignment.student_name, status: 'approved' });
    const totalRejected = await Assignment.countDocuments({ student_name: assignment.student_name, status: 'rejected' });
    
    const allProfessor = await User.find({role: 'Professor'})

    const contextData = {
        assignments: assignmentDetails,
        name: assignment.student_name,
        totalDrafts: totalDrafts,
        totalSubmitted: totalSubmitted,
        totalApproved: totalApproved,
        totalRejected: totalRejected,
        allProfessor: allProfessor
    };


    let email;
    let token = req.cookies['User'];
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
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

}

module.exports = { studentHome, studentDashboard, uploadAssignment, statusFilter, assignmentFilter, allAssignment, renderAssignment, submitAssignment, deleteAssignment, assignmentHistory, editAssignment , uploadEditAssignment, resubmitAssignment, resubmitUploadAssignment}