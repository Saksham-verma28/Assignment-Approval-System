const jwt = require('jsonwebtoken')
const Assignment = require('../models/assignment');
const { generateSecureOTP } = require('../config/generateOTP')
const { sendMail } = require('../config/sendEmail')
const User = require('../models/user')


async function professorDashboard(req, res) {
    let token = req.cookies['User'];

    let name;

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name;
    })


    let submittedAssignment = await Assignment.find({ professor: name });


    res.render('user/professor/dashboard', { name: name, assignment: submittedAssignment })
}


async function reviewAssignment(req, res) {


    let id = req.params.id;

    let assignment = await Assignment.findById(id);
    res.render('user/professor/reviewAssignment', { assignment: assignment })
}

let genratedOTP
async function sendOTP(req, res) {
    try {
        const token = req.cookies['User'];
        const action = req.params.action;
        const { assignmentId } = req.body;

        let name, email

        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {

            if (err) return res.status(401).json({ success: false, message: "Invalid Token" });
            name = decoded.name;
            email = decoded.email
        });



        genratedOTP = generateSecureOTP();



        sendMail(
            "2006sakshamchd@gmail.com",
            "Assignment Verification OTP",
            `
            <div style="
                font-family: 'Segoe UI', Arial, sans-serif;
                background:#fdf8f4;
                padding:25px;
                border-radius:12px;
                border:1px solid #e6d5c3;
                max-width:520px;
                margin:auto;
                color:#5d4037;
            ">

                <h2 style="text-align:center; margin-bottom:10px; color:#e07a5f;">
                    Assignment Verification OTP
                </h2>

                <p style="font-size:15px; color:#5d4037;">
                    Hello Dr. ${name},<br><br>
                    You have initiated a request to 
                    <b style="color:#e07a5f;">${action} an assignment</b>.
                    To confirm this action, please use the OTP below:
                </p>

                <div style="
                    background:#ffffff;
                    padding:18px;
                    border-radius:10px;
                    border:1px solid #e07a5f;
                    margin:20px 0;
                    text-align:center;
                ">
                    <p style="font-size:14px; margin:0; color:#8d6e63;">Your One-Time Password</p>

                    <h1 style="
                        font-size:34px; 
                        margin:8px 0; 
                        letter-spacing:8px; 
                        color:#e07a5f;
                        font-weight:900;
                    ">
                        ${genratedOTP}
                    </h1>

                    <p style="font-size:12px; color:#8d6e63; margin-top:0;">
                        (Valid for 5 minutes)
                    </p>
                </div>

                <p style="font-size:15px; color:#5d4037;">
                    If you did not request this action, please ignore this email.
                </p>

                <p style="margin-top:25px; font-size:14px; text-align:center; color:#8d6e63;">
                    © University Assignment Portal
                </p>

            </div>
            `
        );

        return res.json({ success: true });

    } catch (error) {
        return res.status(500).json({ success: false });
    }
}


async function verifyOTP(req, res) {
    let { otp, remarks, action } = req.body;

    let id = req.params.id


    if (genratedOTP == otp) {

        if (action == 'Approve') {
            await Assignment.findByIdAndUpdate(id, { status: "approved", remark: remarks });
        }
        else {
            await Assignment.findByIdAndUpdate(id, { status: "rejected", remark: remarks });
        }

        let assignment = await Assignment.findById(id)

        sendMail(
            assignment.email,
            `Assignment Update: ${assignment.title} has been ${assignment.status}`,
            `
    <div style="
        font-family: 'Segoe UI', Arial, sans-serif;
        background:#fdf8f4;
        padding:25px;
        border-radius:12px;
        border:1px solid #e6d5c3;
        max-width:550px;
        margin:auto;
        color:#5d4037;
    ">

        <h2 style="text-align:center; margin-bottom:10px; color:#e07a5f;">
            Assignment ${assignment.status}
        </h2>

        <p style="font-size:15px; color:#5d4037;">
            Hello <strong>${assignment.student_name}</strong>,<br><br>
            Your assignment titled 
            <b style="color:#e07a5f;">"${assignment.title}"</b> 
            has been 
            <b style="color:${action === "Approve" ? "#28a745" : "#dc3545"};">
                ${assignment.status}
            </b><br>
            by Dr. ${assignment.professor}.
        </p>

        ${remarks
                ? `
            <div style="
                background:#ffffff;
                padding:18px;
                border-radius:10px;
                border:1px solid #e6d5c3;
                margin:20px 0;
            ">
                <h3 style="margin:0; color:#8d6e63; font-size:16px;">Instructor Remarks</h3>
                <p style="font-size:14px; margin-top:8px; color:#5d4037;">
                    ${remarks}
                </p>
            </div>
            `
                : ""
            }

        <p style="font-size:15px; color:#5d4037;">
            If you have any questions, feel free to reply to this email.
        </p>

        <p style="margin-top:25px; font-size:14px; text-align:center; color:#8d6e63;">
            © University Assignment Portal
        </p>

    </div>
    `
        );



        res.json({ success: true })
    }
    else {
        res.json({ success: false })
    }
}


module.exports = { professorDashboard, reviewAssignment, sendOTP, verifyOTP }