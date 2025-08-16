const { CustomError } = require("../errors");

const errorHandlerMiddleware = (err, req, res, next) => {
    if (err instanceof CustomError){
        return res.status(err.statusCode).json({
          success: false,
          error:err.message
        })
    }
  
    if (err.code === 11000){
      console.log("err code in errorhandlermiddleware: ", err);
      const field = Object.keys(err.keyValue)[0];
      const errMsg = field === "email" ? "The email address already exists" : `Duplicate key error: ${field}`; 
      
      return res.status(400).json({
        success: false,
        error: errMsg
      });
    }
    if (err.name == 'CastError'){
      return res.status(400).json({
        success: false,
        error: 'Invalid data format (Cast Error)'
      });
    }
    
    if(err.name == 'MongooseError') return res.status(503).json({
      success: false,
      error: "Database service unavailable. Restart your connection and try again"
    });
    return res.status(500).json({
      success: false,
      error: "Error occurred. " + err
    });
};

module.exports = errorHandlerMiddleware;