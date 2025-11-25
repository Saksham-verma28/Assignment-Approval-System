const Department = require('../models/department')
const User = require('../models/user')
const hashPass = require('../hashPassword');



async function home(req, res) {
  let countdept = await Department.countDocuments();
  let countUser = await User.countDocuments();
  res.render("admin/adminHome", { dept: countdept, user: countUser });
}


async function create(req, res) {
  try {
    const { department_name, program_type, department_address } = req.body;

    await Department.create({ department_name, program_type, department_address });

    res.json({ message: "Department created successfully" });
  } catch (error) {
    console.error("Error creating department:", error);
  }
}

async function list(req, res) {
  try {

    const perPage = 10;
    const page = parseInt(req.query.page) || 1;
    const totalDepartments = await Department.countDocuments();
    const department = await Department.find()
      .skip((page - 1) * perPage)
      .limit(perPage);
    const totalPages = Math.ceil(totalDepartments / perPage);

    res.render('admin/departmentList', {
      department,
      currentPage: page,
      totalPages,
      success: req.query.success
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }

}

async function deletedept(req, res) {
  try {
    const id = req.query.id;
    await Department.findByIdAndDelete(id);
    res.redirect('/admin/department/list');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting department");
  }
}


async function searchDept(req, res) {
  try {
    const { search, program_type } = req.body;
    let query = {};

    if (search && search.trim() !== "") {
      query.department_name = { $regex: '^' + search.trim(), $options: "i" };
    }

    if (program_type && program_type !== "all") {
      query.program_type = program_type;
    }

    const department = await Department.find(query);
    res.render("admin/departmentList", { department, currentPage: 1, totalPages: 1 });
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).send("Server Error");
  }
}


async function updateDept(req, res) {
  try {
    const { id, department_name, program_type, department_address } = req.body;

    const data = await Department.updateOne(
      { _id: id },
      {
        $set: {
          department_name,
          program_type,
          department_address
        }
      }
    );

    res.redirect('/admin/department/list?success=updated');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error updating department');
  }
}


async function createUser(req, res) {
    const { name, email, password, phone, department, role } = req.body;

    const hashPassword = await hashPass(password);

    await User.create({
        name,
        email,
        password: hashPassword,
        phone,
        department,
        role
    });

    res.render("admin/userForm");
}



 async function userList(req, res){
  try {
    const { search, role, department, page = 1, limit = 20 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) filter.role = role;
    if (department) filter.department = department;

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalUsers / limitNum);

    res.render("admin/userList", {
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
    console.error("Error:", err);
    res.status(500).send("Server Error");
  }
}


async function updateUser(req, res){
  try {
    const { id } = req.params;
    const { name, email, phone, department } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
      { name, email, phone, department },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).send("User not found");

    res.redirect("/admin/users");
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).send("Internal Server Error");
  }
}



async function deleteUser(req, res){
  try {
    const { id } = req.params;

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).send("User not found");
    }

    res.redirect("/admin/users");
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).send("Internal Server Error");
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
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    
    if (role) filter.role = role;

   
    if (department) filter.department = department;

    const totalUsers = await User.countDocuments(filter);

   
    const users = await User.find(filter)
      .sort({ name: 1 }) 
      .skip(skip)
      .limit(limitNum);

    
    const totalPages = Math.ceil(totalUsers / limitNum);

  
    res.render("admin/userList", {
      user: users,
      locals: {
        query: req.query,
        currentPage: pageNum,
        totalPages,
        totalUsers,
        limit: limitNum
      },
    });

  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Error loading users");
  }
}
module.exports = { home, list, create, deletedept, searchDept, updateDept, createUser,userList, updateUser, deleteUser,getFilteredUsers}