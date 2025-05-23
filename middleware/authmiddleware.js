require('dotenv').config();
const { UnauthenticatedError} = require("../errors");
const jwt = require('jsonwebtoken');

const authmiddleware = async(req, res, next) => {
    const token = req.cookies.token || null;
    if (!token) throw new UnauthenticatedError("No authentication token provided");
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            name: payload.name,
            userId:payload.userId,
            email:payload.email,
            role:payload.role
        }  
    } catch(err){
        throw new UnauthenticatedError('Invalid authentication');
    }
    next();
}

module.exports = authmiddleware;