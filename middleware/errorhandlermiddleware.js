const { CustomError } = require("../errors");

const errorHandlerMiddleware = (err, req, res, next) => {
    if (err instanceof CustomError){
        return res.status(err.statusCode).json({error:err.message})
    }
    if (err.code === 11000){
      return res.status(400).json({error:'The email address already exists'})
    }
    if (err.name == 'CastError'){
      return res.status(400).json({error: 'Invalid data format (Cast Error)'});
    }
    return res.status(500).json({error: "Something went wrong, please try again later" + err});
};

module.exports = errorHandlerMiddleware;