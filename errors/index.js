const CustomError = require("./custom-error");
const BadRequestError = require("./custom_errors/bad-request");
const UnauthenticatedError = require("./custom_errors/unauthenticated");
const Unauthorisederror = require("./custom_errors/unauthorised");
const NotFoundError = require("./custom_errors/not-found");

module.exports = {
  CustomError,
  BadRequestError,
  UnauthenticatedError,
  Unauthorisederror,
  NotFoundError
};