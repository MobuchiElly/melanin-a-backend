const {describe} = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require("../../src/app.js");
const User = require("../../models/Users.js");

chai.use(chaiHttp)

const name = "Test Name";
const email = "tester@example.com";
const password = "testing123";

describe("Testing Authentication Endpoint", () => {

    describe("Testing Registration Functionality", () => {
        it("should return an error if required fields are not provided", async function(){
            const res = await chai.request(server).post("/api/v2/auth/register").send({});
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Name, Email and Password are required");     
        });
        it("should create new user with required fields provided", async function(){
            const res = await chai.request(server).post("/api/v2/auth/register").send({
                    name, email, password
                });
            expect(res.body).to.have.property("user");
            expect(res.body.user).to.have.property("email");
            expect(res.body.user).to.have.property("name");
            expect(res.body.user).to.have.property("uid");
            expect(res.body.user.email).to.equal(email);
            expect(res.body.user.name).to.equal(name);        
        });
        it("should return an error if provided email already exists", async function(){
            const res = await chai.request(server).post("/api/v2/auth/register").send({
                    name, email, password
                });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("The email address already exists");
        });
    });

    describe("Testing LOGIN Functionality", () => {
        it("should return an error if required fields are not provided", async function(){
            const res = await chai.request(server).post("/api/v2/auth/login").send({});
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Please provide Email and Password");      
        });

        it("should return an error if user does not exist", async function(){
            const res = await chai.request(server).post("/api/v2/auth/login").send({
                    email: "johndoe67gytr_i@gmail.com",
                    password
                });
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("User does not exist. Please enter correct login credentials");
        }); 

        it("should return an error if incorrect password is entered", async function(){
            const res = await chai.request(server).post("/api/v2/auth/login").send({
                    email,
                    password: password.slice(0, 4) + "geyege636g"
                });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Incorrect password. Please enter correct credentials");       
        }); 

        it("should complete login successfully if user enters correct login details", async function(){
            const res = await chai.request(server).post("/api/v2/auth/login").send({
                    email, password
                });
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("user");
            expect(res.body).to.have.property("token");
            expect(res.body.user).to.have.property("name");
            expect(res.body.user).to.have.property("email");
            expect(res.body.user).to.have.property("uid");
            expect(res.body.user.name).to.equal(name);
            expect(res.body.user.email).to.equal(email);
        }); 
    });
});

after(async function(){
    try{
        await User.deleteOne({
            email
        });
    } catch(err){
        console.error("unable to delete user from db:", err);
    }
})