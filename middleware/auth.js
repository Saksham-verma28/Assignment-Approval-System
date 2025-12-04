const jwt = require('jsonwebtoken');
const ADMIN_STATIC_ID = '60f8c3c1b4f4c20015b3c4f5';

module.exports.auth = (req, res, next) => {
  const clientToken = req.cookies && req.cookies['admin'];

  if (!clientToken) {
    return res.render('admin/accessDenied');
  }

  try {
    const decoded = jwt.verify(clientToken, process.env.JWT_KEY);

    req.user = {
      _id: decoded._id || ADMIN_STATIC_ID,
      name: decoded.username || decoded.name || 'Admin',
      role: decoded.role || 'Admin'
    };

    return next();
  } catch (error) {
    res.clearCookie('admin');
    return res.redirect('/admin/login');
  }
};
