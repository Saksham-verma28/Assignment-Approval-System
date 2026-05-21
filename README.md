# Assignment Approval System

A full-stack role-based workflow platform designed to automate assignment submission, approval, rejection, and resubmission processes in universities.

---

## 🚀 Live Demo

🔗 Live Link: https://assignment-approval-system-kmif.onrender.com/

---

## 📂 GitHub Repository

🔗 GitHub Repo: https://github.com/Saksham-verma28/Assignment-Approval-System

---

# 📌 Problem Statement

In many universities and colleges, assignment approval workflows are still managed manually through emails or offline communication. This creates delays, poor tracking, confusion between students and professors, and no proper approval history.

The Assignment Approval System solves this problem by creating a centralized workflow where:

- Students can upload assignments
- Professors can approve or reject assignments with feedback
- Rejected assignments return to students for resubmission
- Approved assignments move to HOD for final verification
- Email notifications are sent at every stage
- Admin manages departments and role-based users

---

# ✨ Features

## 👨‍🎓 Student
- Login authentication
- Upload assignments
- View assignment status
- Receive rejection reasons
- Resubmit rejected assignments
- Update profile
- Reset password using OTP

## 👨‍🏫 Professor
- View submitted assignments
- Approve assignments
- Reject assignments with reason
- Track assignment workflow

## 👨‍💼 HOD
- Final approval verification
- View approved assignments

## 🛠 Admin
- Create departments
- Manage users
- Assign roles
- System administration

---

# 📧 Email Workflow

Automated email notifications are sent using Brevo SMTP and Nodemailer:
- OTP verification
- Assignment approval
- Assignment rejection
- Resubmission notifications

---

# 🧰 Tech Stack

## Frontend
- EJS
- HTML
- CSS
- JavaScript

## Backend
- Node.js
- Express.js

## Database
- MongoDB Atlas
- Mongoose

## Authentication
- JWT Authentication
- bcrypt Password Hashing

## Cloud Storage
- Cloudinary

## Email Service
- Nodemailer
- Brevo SMTP

## Deployment
- Render

---

# 🔐 Security Features

- JWT-based authentication
- Password hashing using bcrypt
- Protected routes
- OTP password reset
- Role-based authorization

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Saksham-verma28/Assignment-Approval-System.git
