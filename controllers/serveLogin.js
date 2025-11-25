const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

function login(req, res) {
    res.render("admin/login", { err: '' })
}


async function adminLogin(req, res) {
    const { username, password } = req.body;

    if (username !== process.env.ADMIN_USERNAME) {
        return res.render("admin/login", { err: "Username invalid!" });
    }

    const match = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);
    if (!match) {
        return res.render("admin/login", { err: "Password invalid!" });
    }

    const token = jwt.sign({ username }, process.env.JWT_KEY, { expiresIn: "1h" });
    res.cookie("admin", token, { httpOnly: true });

    res.redirect('/admin/home')
}


module.exports = { login, adminLogin }