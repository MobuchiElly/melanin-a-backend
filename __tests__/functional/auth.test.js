require("dotenv").config();
const {describe} = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require("../../src/app.js");
const User = require("../../src/models/Users.js");

chai.use(chaiHttp)

const { TEST_NAME:name, TEST_USER_EMAIL:email, TEST_PASSW:password} = process.env;

describe("Testing Authentication Endpoint", () => {
    describe("User Registration", () => {
        beforeEach(async() => {
            await User.deleteOne({email});
        });
        afterEach(async() => {
            await User.deleteOne({email});
        });
        it("should return an error if required fields are not provided", async function(){
            const res = await chai
            .request(server)
            .post("/api/v2/auth/register")
            .send({});
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Name, Email and Password are required");
            expect(res.status).to.equal(400);    
        });
        it("should create new user with required fields provided and await email verification", async function(){
            const res = await chai
            .request(server)
            .post("/api/v2/auth/register")
            .send({
                name, email, password
            });
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property("message");
            if (res.status === 201){
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.equal("Please check your email to verify your account. Verification link sent.");
                expect(res.body.data.verificationToken).to.not.be.null;
            }
        });
        it("should return an error if provided email already exists", async function(){
            const registerRes = await chai
            .request(server)
            .post("/api/v2/auth/register")
            .send({
                name, email, password
            });

            const res = await chai
            .request(server)
            .post("/api/v2/auth/register")
            .send({
                name, email, password
            });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("The email address already exists");
        });
    });

    describe("Email Verification", () => {
        let verificationToken;
        beforeEach(async() => {
            await User.deleteOne({email});
        });
        beforeEach(async() => {
            const res = await chai
            .request(server)
            .post("/api/v2/auth/register")
            .send({
                name, email, password
            });
            if (res.status === 201) verificationToken = res.body.data.verificationToken;
        });

        it("should verify user with valid email and verification token", async function(){
            const res = await chai
            .request(server)
            .post("/api/v2/auth/verify-email")
            .send({
                email,
                verificationToken
            });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.message).to.equal("Email verification successfull");
            expect(res.body.data.user.email).to.equal(email);
        });
        it("should return an error for invalid or expired token", async function(){
            const res = await chai
            .request(server).
            post("/api/v2/auth/verify-email")
            .send({
                email,
                verificationToken: "invalidtoken234"
            });

            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal("Invalid Verification Token");
        });
        it("should return an error if email is already verified", async function(){
            //verify user firt before running test
            const verifyRes = await chai
            .request(server)
            .post("/api/v2/auth/verify-email")
            .send({
                email,
                verificationToken
            });

            const res = await chai
            .request(server).
            post("/api/v2/auth/verify-email")
            .send({
                email,
                verificationToken
            });
            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal("Email is already verified");
        });
    });

    describe("Resend Email Verification", () => {
        let verificationToken;
        beforeEach(async() => {
            await User.deleteOne({email});
            const res = await chai
            .request(server)
            .post("/api/v2/auth/register")
            .send({
                email, password, name
            });
            verificationToken = res.body.data.verificationToken;
        });
        afterEach(async() => {
            await User.deleteOne({email});
        });
        it("should return an error if required field is not provided", async() => {
            const res = await chai
            .request(server)
            .post("/api/v2/auth/resend-verification")
            .send({});
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Email is required");
        });
        it("should return an error if user does not exist", async() => {
            const res = await chai
            .request(server)
            .post("/api/v2/auth/resend-verification")
            .send({
                email: "unknown@gmail.com"
            });
            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal("No existing user with provided email");
        });
        it("should return an error if user is already verified", async() => {
            //verify user before test
            await chai
            .request(server)
            .post("/api/v2/auth/verify-email")
            .send({
                email, verificationToken
            });

            const res = await chai
            .request(server)
            .post("/api/v2/auth/resend-verification")
            .send({
                email
            });
            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal("Email is already verified");
        });
        it("should successfully resend verification token to user", async() => {
            const res = await chai
            .request(server)
            .post("/api/v2/auth/resend-verification")
            .send({
                email
            });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body).to.have.property("data");
            expect(res.body.data.verificationToken).to.not.be.null;
        });
    });

    describe("Password Reset", () => {
        describe("Request Password Reset", () => {
            beforeEach(async() => {
                await User.deleteMany({email});
                const res = await chai
                .request(server)
                .post("/api/v2/auth/register")
                .send({
                    name, email, password
                });
                verificationToken = res.body.data.verificationToken;
                
                const verifyRes = await chai
                .request(server)
                .post("/api/v2/auth/verify-email")
                .send({
                    email, verificationToken
                });
            });
           it("should return an error if required field is missing", async() => {
                const res = await chai
                .request(server)
                .post("/api/v2/auth/forgot-password")
                .send({});
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("Email is required");
           });
           it("should return an error if user does not exist", async() => {
                const res = await chai
                .request(server)
                .post("/api/v2/auth/forgot-password")
                .send({
                    email:"unknownemail@mail.com"
                });
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("No user with this email exists");
           });
           it("should successfully return verification", async() => {
                const res = await chai
                .request(server)
                .post("/api/v2/auth/forgot-password")
                .send({email});
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property("data");
                expect(res.body.success).to.be.true;                
                expect(res.body.data).to.have.property("passwordResetToken");
                expect(res.body.data.verificationToken).to.not.be.null;
           })
        });
        describe("Verify Reset Token", () => {
            let passwordResetToken;
            beforeEach(async() => {
                await User.deleteMany({email});
                const res = await chai
                .request(server)
                .post("/api/v2/auth/register")
                .send({
                    name, email, password
                });
                verificationToken = res.body.data.verificationToken;
                
                const verifyRes = await chai
                .request(server)
                .post("/api/v2/auth/verify-email")
                .send({
                    email, verificationToken
                });

                const resetRes = await chai
                .request(server)
                .post("/api/v2/auth/forgot-password")
                .send({
                    email
                });
                passwordResetToken = resetRes.body.data.passwordResetToken;
            });
            it("should return error if required field are not missing", async() => {
                const res = await chai
                .request(server)
                .post("/api/v2/auth/verify-password-reset-token")
                .send({});
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("error").to.be.a.string;
            });
            it("should return error if user does not exist", async() => {
                const res = await chai
                .request(server)
                .post("/api/v2/auth/verify-password-reset-token")
                .send({
                    email:"someemail@gmail.com",
                    password: "new_password3456",
                    passwordResetToken
                });
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("Invalid email");     
            });
            it("should return error if reset token is invalid", async() => {
                const res = await chai
                .request(server)
                .post("/api/v2/auth/verify-password-reset-token")
                .send({
                    email, 
                    password,
                    passwordResetToken: "6373ejjf943j3ur83"
                });
                expect(res.status).to.equal(400);
                expect(res.body.error).to.equal("Invalid or expired token");
            });
            it("should succesfully verify valid password reset token", async() => {
                const res = await chai
                .request(server)
                .post("/api/v2/auth/verify-password-reset-token")
                .send({
                    email, 
                    password,
                    passwordResetToken
                });
                expect(res.status).to.equal(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.equal("Token verified");
            });
        });

        describe("Reset Password", () => {
            let passwordResetToken;
            beforeEach(async() => {
                //delete user before each test
                await User.deleteOne({email});

                //Create new user before each test
                const res = await chai
                .request(server)
                .post("/api/v2/auth/register")
                .send({
                    name, email, password
                });
                verificationToken = res.body.data.verificationToken;
                
                //verify user before each test
                const verifyRes = await chai
                .request(server)
                .post("/api/v2/auth/verify-email")
                .send({
                    email, verificationToken
                });

                //Make a request to reset user password
                const resetRes = await chai
                .request(server)
                .post("/api/v2/auth/forgot-password")
                .send({
                    email
                });
                passwordResetToken = resetRes.body.data.passwordResetToken;
            });
            it("should return error if required field are missing", async() => {
                const res = await chai
                .request(server)
                .patch("/api/v2/auth/reset-password")
                .send({});
                expect(res.status).to.equal(400);
                expect(res.body.error).to.equal("Email is required");
            });
            it("should return error if user does not exist", async() => {
                const res = await chai
                .request(server)
                .patch("/api/v2/auth/reset-password")
                .send({ 
                    email: "inexistentemail@mail.com", 
                    password,
                    passwordResetToken
                });
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("error").to.be.a.string;
                expect(res.body.error).to.equal("No user with the provided email exists");
            });
            it("should return error if reset token is invalid", async() => {
                const res = await chai
                .request(server)
                .patch("/api/v2/auth/reset-password")
                .send({ 
                    email, 
                    password,
                    passwordResetToken:"yeejeu38389u3hr7y3i39rh"
                });
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("error").to.be.a.string;
                expect(res.body.error).to.equal("Invalid reset token");
            });
            it("should succesfully update user password", async() => {
                const res = await chai
                .request(server)
                .patch("/api/v2/auth/reset-password")
                .send({ 
                    email, 
                    password,
                    passwordResetToken
                });
                expect(res.status).to.equal(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.equal("Password has been reset successfully");
            });
        });
    })

    describe("Testing LOGIN Functionality", () => {
        it("should return an error if required fields are not provided", async function(){
            const res = await chai
            .request(server)
            .post("/api/v2/auth/login")
            .send({});
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Please provide Email and Password");
        });
        it("should return an error if user does not exist", async function(){
            const res = await chai
            .request(server)
            .post("/api/v2/auth/login")
            .send({
                email: "johndoe67gytr_i@gmail.com",
                password
            });
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("User does not exist. Please enter correct login credentials");
        }); 
        it("should return an error if incorrect password is entered", async function(){
            const res = await chai
            .request(server)
            .post("/api/v2/auth/login")
            .send({
                email,
                password: password.slice(0, 4) + "geyege636g"
            });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Incorrect password. Please enter correct credentials");       
        }); 
        it("should complete login successfully if user enters correct login details", async function(){
            const res = await chai
            .request(server)
            .post("/api/v2/auth/login")
            .send({
                email, password
            });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("success");
            expect(res.body).to.have.property("data");
            expect(res.body.data.user).to.not.be.null;
            expect(res.body.data.user).to.have.property("email");
            expect(res.body.data.user).to.have.property("uid");
            expect(res.body.data.user.name).to.equal(name);
            expect(res.body.data.user.email).to.equal(email);
        }); 
    });
});