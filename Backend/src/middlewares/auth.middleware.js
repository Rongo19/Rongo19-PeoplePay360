const { verifyToken } = require("../utils/jwt");
const ApiError = require("../utils/ApiError");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new ApiError(401, "Authentication required")
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    return next(
      new ApiError(401, "Invalid or expired token")
    );
  }
};

module.exports = protect;