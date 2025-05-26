const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token' });
  }

  const token = authHeader.split(' ')[1]; // Format: Bearer TOKEN

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token (e.g. { userId, email })
    next();
  } catch (err) {
    console.error('JWT error:', err.message);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
