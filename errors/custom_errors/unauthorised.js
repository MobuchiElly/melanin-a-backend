const CustomError = require("../custom-error");

class Unauthorisederror extends CustomError{
    constructor(message){
        super(message);
        this.statusCode = 403;
    }
}

module.exports = Unauthorisederror;