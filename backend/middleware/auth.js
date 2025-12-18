const { verifyToken } = require('../jwt'); // Use from jwt.js

const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  console.log('🔐 Auth Middleware - Token received');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ 
      success: false,
      error: 'No authentication token' 
    });
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    console.log('❌ Token verification failed');
    return res.status(401).json({ 
      success: false,
      error: 'Invalid or expired token' 
    });
  }

  console.log('✅ Token verified successfully');
  console.log('User ID:', decoded.userId);
  
  req.userId = decoded.userId;
  next();
};

module.exports = authMiddleware;