const {describe} = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require("../../src/app.js");
const User = require("../../models/Users.js");
const emailSender = require("../../utils/emailSender.js");
const mongoose = require("mongoose");

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
        let verificationToken;
        it("should create new user with required fields provided and await email verification", async function(){
            const res = await chai.request(server).post("/api/v2/auth/register").send({
                    name, email, password
                });
                console.log("res:", res.body);
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property("message");
            expect(res.body.message).to.equal("Please check your email to verify your account. Verification link sent.");
            
            // const user = await User.findOne({email});
            // email = user.email;
            // verificationToken = user.verificationToken;
            // expect(user.verificationToken).to.not.be.null;
        });

        it("should verify user with valid email and verification token", async function(){console.log("deets:", name, email, password )
            // const registerRes = await chai.request(server).post("/api/v2/auth/register");
            // expect(registerRes.status).to.equal(201);
            // const user = await User.findOne({email});
            // verificationToken = user.verificationToken;
            // expect(user.verificationToken).to.not.be.null;

            const res = await chai.request(process.env.REDIRECT_URL_PROD).get(`?vt=${verificationToken}&email=${encodeURIComponent(email)}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("message");
            expect(res.body.message).to.equal("Your email has been verified successfully.");
        })
        // it("should return an error for invalid or expired token", async function(){
        //     const registerRes = await chai.request(server).post("/api/v2/auth/register");
        //     expect(registerRes.status).to.equal(201);
        //     const user = await User.find({email});
        //     verificationToken = user.verificationToken;
        //     expect(user.verificationToken).to.not.be.null;

        //     const res = await chai.request(process.env.REDIRECT_URL_PROD).get("?vt=${verificationToken}&email=${encodeURIComponent(email)}");

        //     expect(res.status).to.equal(200);
        //     expect(res.body).to.have.property("message");
        //     expect(res.body.message).to.equal("Your email has been verified successfully.");
        // })
        //should test for invalid verification token provided
        it("should return an error if provided email already exists", async function(){
            const res = await chai.request(server).post("/api/v2/auth/register").send({
                    name, email, password
                });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("The email address already exists");
        });
    });

    // describe("Testing LOGIN Functionality", () => {
    //     it("should return an error if required fields are not provided", async function(){
    //         const res = await chai.request(server).post("/api/v2/auth/login").send({});
    //         expect(res.status).to.equal(400);
    //         expect(res.body).to.have.property("error");
    //         expect(res.body.error).to.equal("Please provide Email and Password");
    //     });

    //     it("should return an error if user does not exist", async function(){
    //         const res = await chai.request(server).post("/api/v2/auth/login").send({
    //                 email: "johndoe67gytr_i@gmail.com",
    //                 password
    //             });
    //         expect(res.status).to.equal(404);
    //         expect(res.body).to.have.property("error");
    //         expect(res.body.error).to.equal("User does not exist. Please enter correct login credentials");
    //     }); 

    //     it("should return an error if incorrect password is entered", async function(){
    //         const res = await chai.request(server).post("/api/v2/auth/login").send({
    //                 email,
    //                 password: password.slice(0, 4) + "geyege636g"
    //             });
    //         expect(res.status).to.equal(400);
    //         expect(res.body).to.have.property("error");
    //         expect(res.body.error).to.equal("Incorrect password. Please enter correct credentials");       
    //     }); 

    //     it("should complete login successfully if user enters correct login details", async function(){
    //         const res = await chai.request(server).post("/api/v2/auth/login").send({
    //                 email, password
    //             });
    //         expect(res.status).to.equal(200);
    //         expect(res.body).to.have.property("user");
    //         expect(res.body).to.have.property("token");
    //         expect(res.body.user).to.have.property("name");
    //         expect(res.body.user).to.have.property("email");
    //         expect(res.body.user).to.have.property("uid");
    //         expect(res.body.user.name).to.equal(name);
    //         expect(res.body.user.email).to.equal(email);
    //     });
    //     //Test accessing protected route to see that token is valid 
    // });
});

afterEach(async () => {
    if (mongoose.connection.readyState !== 1) return;
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections){
        await collection.deleteMany({});
    }
})

after(async function(){
    try{
        await User.deleteOne({
            email
        });
    } catch(err){
        console.error("unable to delete user from db:", err);
    } finally{
         await mongoose.connection.dropDatabase();
         await mongoose.connection.close();
    }
})