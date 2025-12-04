// controllers/adminController.js
const Department = require('../models/department');
const User = require('../models/user');
const ActivityLog = require('../models/ActivityLog');
const hashPass = require('../hashPassword');
const { sendMail } = require('../config/sendEmail');
const moment = require('moment');

const ADMIN_STATIC_ID = '60f8c3c1b4f4c20015b3c4f5';

const logActivity = async (actionType, entityType, description, performedBy, icon, color, entityId = null) => {
  try {
    const performerId = performedBy && performedBy._id ? performedBy._id : ADMIN_STATIC_ID;
    await ActivityLog.create({
      actionType,
      entityType,
      description,
      performedBy: performerId,
      icon,
      color,
      entityId
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

async function home(req, res) {
  try {
    const [countdept, countStudent, countProfessor, countHod, recentActivities] = await Promise.all([
      Department.countDocuments(),
      User.countDocuments({ role: 'Student' }),
      User.countDocuments({ role: 'Professor' }),
      User.countDocuments({ role: 'Hod' }),
      ActivityLog.find().sort({ timestamp: -1 }).limit(5).lean()
    ]);

    const formattedActivities = recentActivities.map(activity => ({
      ...activity,
      timeAgo: activity.timestamp ? moment(activity.timestamp).fromNow() : ''
    }));

    res.render('admin/adminHome', {
      dept: countdept,
      student: countStudent,
      professor: countProfessor,
      hod: countHod,
      recentActivities: formattedActivities
    });
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    res.status(500).send('Server Error');
  }
}

async function adminLogout(req, res) {
  try {
    const userName = req.user ? (req.user.name || req.user.username || 'Admin') : 'Admin';
    await logActivity(
      'LOGOUT',
      'System',
      `${userName} logged out.`,
      req.user,
      'log-out',
      'var(--text-red)'
    );
  } catch (error) {
    console.error('Error logging logout activity:', error);
  } finally {
    res.clearCookie('admin');
    return res.redirect('/');
  }
}

async function create(req, res) {
  try {
    const { department_name, program_type, department_address } = req.body;
    const newDept = await Department.create({ department_name, program_type, department_address });

    await logActivity(
      'CREATE',
      'Department',
      `New Department created: ${department_name}`,
      req.user,
      'building-2',
      'var(--border-sky)',
      newDept._id
    );

    res.json({ message: 'Department created successfully' });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Error creating department' });
  }
}

async function list(req, res) {
  try {
    const perPage = 10;
    const page = parseInt(req.query.page) || 1;
    const totalDepartments = await Department.countDocuments();
    const department = await Department.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();
    const totalPages = Math.ceil(totalDepartments / perPage);

    res.render('admin/departmentList', {
      department,
      currentPage: page,
      totalPages,
      success: req.query.success
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}

async function deletedept(req, res) {
  try {
    const id = req.query.id;
    const deletedDept = await Department.findByIdAndDelete(id);

    if (deletedDept) {
      await logActivity(
        'DELETE',
        'Department',
        `Department deleted: ${deletedDept.department_name}`,
        req.user,
        'trash-2',
        'var(--text-red)',
        id
      );
    }

    res.redirect('/admin/department/list');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting department');
  }
}

async function searchDept(req, res) {
  try {
    const { search, program_type } = req.body;
    let query = {};

    if (search && search.trim() !== '') {
      query.department_name = { $regex: '^' + search.trim(), $options: 'i' };
    }

    if (program_type && program_type !== 'all') {
      query.program_type = program_type;
    }

    const department = await Department.find(query).lean();
    res.render('admin/departmentList', { department, currentPage: 1, totalPages: 1 });
  } catch (err) {
    console.error('Search Error:', err);
    res.status(500).send('Server Error');
  }
}

async function updateDept(req, res) {
  try {
    const { id, department_name, program_type, department_address } = req.body;
    const oldDept = await Department.findById(id).lean();

    const updatedData = await Department.updateOne(
      { _id: id },
      {
        $set: {
          department_name,
          program_type,
          department_address
        }
      }
    );

    if (updatedData.modifiedCount > 0) {
      await logActivity(
        'UPDATE',
        'Department',
        `Department updated: ${oldDept ? oldDept.department_name : department_name}`,
        req.user,
        'pencil',
        'var(--border-orange)',
        id
      );
    }

    res.redirect('/admin/department/list?success=updated');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating department');
  }
}

async function createUser(req, res) {
  const { name, email, password, phone, department, role } = req.body;

  try {
    const hashPassword = await hashPass(password);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      phone,
      department,
      role
    });

    await logActivity(
      'CREATE',
      'User',
      `New ${role} account created: ${name} (${department})`,
      req.user,
      'user-plus',
      'var(--border-emerald)',
      newUser._id
    );

    const html = `
      <div style="font-family: Arial, sans-serif; background-color:#0F172A; padding:20px; color:white;">
        <div style="max-width:600px; margin:0 auto; background:#1F2937; padding:25px; border-radius:10px;">
          <h2 style="color:#8B5CF6; text-align:center; margin-bottom:20px;">User Account Created Successfully</h2>
          <p style="font-size:16px; color:#E5E7EB;">Hello <strong>${name}</strong>,</p>
          <p style="font-size:15px; color:#CBD5E1;">Your account is now active and ready to use.</p>
          <div style="background:#111827; padding:15px; border-radius:8px; margin-top:20px;">
            <p style="margin:0; color:#A78BFA; font-size:14px;"><strong>Login Email:</strong></p>
            <p style="margin:5px 0 15px 0; color:white;">${email}</p>
            <p style="margin:0; color:#A78BFA; font-size:14px;"><strong>Password:</strong></p>
            <p style="margin:5px 0; color:white;">${password}</p>
          </div>
          <p style="margin-top:25px; color:#E5E7EB; font-size:14px;">You can now log in to your portal using the above details.</p>
          <a href="http://localhost:3000/user/login" style="display:inline-block; margin-top:20px; background:#8B5CF6; padding:10px 20px; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">Login Now</a>
          <p style="margin-top:25px; color:#64748B; font-size:12px; text-align:center;">© ${new Date().getFullYear()} University Student Portal</p>
        </div>
      </div>
    `;
    sendMail(email, 'User created successfully', html);

    res.render('admin/userForm', { msg: 'User Created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
}

async function userList(req, res) {
  try {
    const { search, role, department, page = 1, limit = 20 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) filter.role = role;
    if (department) filter.department = department;

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter).sort({ name: 1 }).skip(skip).limit(limitNum).lean();
    const totalPages = Math.ceil(totalUsers / limitNum);

    res.render('admin/userList', {
      user: users,
      locals: {
        query: req.query,
        currentPage: pageNum,
        totalPages,
        totalUsers,
        limit: limitNum
      }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server Error');
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, department } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name: name, email: email, phone: phone, department: department },
      { new: true, runValidators: true }
    ).lean();

    if (updatedUser) {
      await logActivity(
        'UPDATE',
        'User',
        `${updatedUser.role} account updated: ${updatedUser.name} (${updatedUser.email})`,
        req.user,
        'user-check',
        'var(--border-orange)',
        id
      );
    }

    res.redirect('/admin/users');
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).send('Internal Server Error');
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id).lean();

    if (!deletedUser) {
      return res.status(404).send('User not found');
    }

    await logActivity(
      'DELETE',
      'User',
      `${deletedUser.role} account deleted: ${deletedUser.name}`,
      req.user,
      'user-x',
      'var(--text-red)',
      id
    );

    res.redirect('/admin/users');
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).send('Internal Server Error');
  }
}

async function getFilteredUsers(req, res) {
  try {
    const { search, role, department, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) filter.role = role;
    if (department) filter.department = department;

    const totalUsers = await User.countDocuments(filter);
    const users = await User.find(filter).sort({ name: 1 }).skip(skip).limit(limitNum).lean();
    const totalPages = Math.ceil(totalUsers / limitNum);

    res.render('admin/userList', {
      user: users,
      locals: {
        query: req.query,
        currentPage: pageNum,
        totalPages,
        totalUsers,
        limit: limitNum
      }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Error loading users');
  }
}

module.exports = {
  home,
  list,
  create,
  deletedept,
  searchDept,
  updateDept,
  createUser,
  userList,
  updateUser,
  deleteUser,
  getFilteredUsers,
  adminLogout
};
