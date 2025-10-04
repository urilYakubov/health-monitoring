const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = { id: decoded.id };  // ✅ correct format
	console.log('✅ Authenticated user:', req.user); // ⬅️ debug
    next();
  });
}

// For HTML pages → redirect to login.html
function authenticatePage(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.redirect('/login.html');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.redirect('/login.html');

    req.user = { id: decoded.id };
    next();
  });
}

module.exports = { authenticateToken, authenticatePage };
