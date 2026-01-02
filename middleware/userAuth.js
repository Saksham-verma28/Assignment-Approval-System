const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.cookies['User'];
  if (!token) return res.render('user/unauthorized');

  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) return res.render('user/unauthorized');
    req.user = decoded;
    next();
  });
};

const studentOnly = (req, res, next) => {
  if (req.user.role === 'Student') return next();
  return res.render('user/accessDenied');
};

const professorOnly = (req, res, next) => {
  if (req.user.role === 'Professor') return next();
  return res.render('user/accessDenied');
};

module.exports = { verifyToken, studentOnly, professorOnly };
