function createdepartment(req,res){
    res.render("admin/departmentForm", {message: ''})
}

module.exports = {createdepartment}