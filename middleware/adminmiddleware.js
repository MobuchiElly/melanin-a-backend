const {Unauthorisederror} = require("../errors/index");

const adminmiddleware = async(req, res, next) => {
    if(req.user.role !== 'admin'){
            throw new Unauthorisederror('Unauthorized for this action');
    }
    next();
}

module.exports = adminmiddleware;