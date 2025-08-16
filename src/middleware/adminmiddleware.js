const { ForbiddenError } = require("../errors");

const adminmiddleware = async (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ForbiddenError("Unauthorized for this action");
  }
  next();
};

module.exports = adminmiddleware;
