const jwt = require('jsonwebtoken');
const JWT_SECRET = "your_jwt_secret"; // replace with your actual secret

module.exports = function(req, res, next) {
  // Get the token from header
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send({ error: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user; // { id: "userId" }
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
}
