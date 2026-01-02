const jwt = require('jsonwebtoken');
const Assignment = require('../models/assignment');
const Tracker = require('../models/assignmentTraker');
const { generateSecureOTP } = require('../config/generateOTP');
const { sendMail } = require('../config/sendEmail');
const User = require('../models/user');

async function professorDashboard(req, res) {
    const token = req.cookies['User'];
    let name, email;

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name;
    });

    let user = await User.findOne({name: name})
    


    const submittedAssignment = await Assignment.find({ professor: name });
    

    res.render('user/professor/dashboard', { name, assignment: submittedAssignment, profilePic: user.profilePic});
}

async function reviewAssignment(req, res) {
    const id = req.params.id;
    const assignment = await Assignment.findById(id);
    res.render('user/professor/reviewAssignment', { assignment });
}

let genratedOTP;

async function sendOTP(req, res) {
    try {
        const token = req.cookies['User'];
        const action = req.params.action;
        const { assignmentId } = req.body;

        let name, email;

        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) return res.status(401).json({ success: false });
            name = decoded.name;
            email = decoded.email;
        });

        genratedOTP = generateSecureOTP();

        sendMail(
            email,
            "Assignment Verification OTP",
            `
            <div style="font-family: 'Segoe UI'; background:#fdf8f4; padding:25px; border-radius:12px;">
                <h2 style="text-align:center; color:#e07a5f;">Assignment Verification OTP</h2>
                <p>Hello Dr. ${name},</p>
                <p>You requested to <b>${action}</b> an assignment.</p>
                <div style="background:#fff; padding:18px; border-radius:10px; border:1px solid #e07a5f; text-align:center;">
                    <h1 style="letter-spacing:8px; color:#e07a5f;">${genratedOTP}</h1>
                </div>
            </div>
            `
        );

        return res.json({ success: true });

    } catch (error) {
        return res.status(500).json({ success: false });
    }
}

async function verifyOTP(req, res) {
    const { otp, remarks, action } = req.body;
    const id = req.params.id;

    if (genratedOTP != otp) return res.json({ success: false });

    if (action === "Approve") {
        await Assignment.findByIdAndUpdate(id, { status: "approved", remark: remarks });

        await Tracker.updateOne(
            { assignmentId: id },
            {
                currentStatus: "approved",
                $push: {
                    history: {
                        status: "approved",
                        updatedBy: "professor"
                    }
                }
            }
        );
    } else {
        await Assignment.findByIdAndUpdate(id, { status: "rejected", remark: remarks });

        await Tracker.updateOne(
            { assignmentId: id },
            {
                currentStatus: "rejected",
                $push: {
                    history: {
                        status: "rejected",
                        updatedBy: "professor"
                    }
                }
            }
        );
    }

    const assignment = await Assignment.findById(id);

    sendMail(
        assignment.email,
        `Assignment Update: ${assignment.title} - ${assignment.status}`,
        `
        <div style="font-family: 'Segoe UI'; background:#fdf8f4; padding:25px; border-radius:12px;">
            <h2 style="text-align:center; color:#e07a5f;">Assignment ${assignment.status}</h2>
            <p>Hello ${assignment.student_name}, your assignment "${assignment.title}" has been <b>${assignment.status}</b>.</p>
            ${remarks ? `<div style="background:#fff; padding:18px; border-radius:10px; border:1px solid #e6d5c3;"><p>${remarks}</p></div>` : ""}
        </div>
        `
    );

    res.json({ success: true });
}

module.exports = { professorDashboard, reviewAssignment, sendOTP, verifyOTP };
