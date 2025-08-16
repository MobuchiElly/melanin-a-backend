const CustomError = require("./custom-error");
const BadRequestError = require("./custom_errors/bad-request-error");
const UnauthenticatedError = require("./custom_errors/unauthenticated-error");
const ForbiddenError = require("./custom_errors/forbidden-error");
const NotFoundError = require("./custom_errors/not-found-error");

module.exports = {
  CustomError,
  BadRequestError,
  UnauthenticatedError,
  ForbiddenError,
  NotFoundError,
};