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
    
    console.log("err code in errorhandlermiddleware: ", err.name);
    
    if(err.name == 'MongooseError') return res.status(503).json({error: "Database service unavailable. Restart your connection and try again"});
    return res.status(500).json({error: "Error occurred. " + err});
};

module.exports = errorHandlerMiddleware;