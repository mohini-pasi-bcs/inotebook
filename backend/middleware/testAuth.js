// Test middleware - allows everything
const testAuth = (req, res, next) => {
  console.log('✅ TEST AUTH: Allowing request');
  
  // Get token if exists
  const token = req.header('x-auth-token');
  if (token) {
    console.log('Token found:', token.substring(0, 50) + '...');
    // Try to extract user ID from token
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        req.userId = payload.userId || 'test-user-id';
      } else {
        req.userId = 'test-user-id';
      }
    } catch (err) {
      req.userId = 'test-user-id';
    }
  } else {
    req.userId = 'test-user-id';
  }
  
  console.log('Using user ID:', req.userId);
  next();
};

module.exports = testAuth;