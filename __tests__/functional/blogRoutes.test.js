// require("dotenv").config();
// const {describe} = require("mocha");
// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const expect = chai.expect;
// const server = require("../../src/app.js");
// const {ObjectId} = require("mongodb");

// chai.use(chaiHttp);

// let adminAuthToken, userAuthToken, userId = "";

// before(async function(){
//     const [adminRes, userRes] = await Promise.all([
//         chai.request(server).post('/api/v2/auth/login').send({
//             email: process.env.AUTHEMAIL,
//             password: process.env.AUTHPASSW
//         }),
//         chai.request(server).post('/api/v2/auth/login').send({
//             email: process.env.USEREMAIL,
//             password: process.env.USERPASSW
//         })
//     ]);
//     adminAuthToken = adminRes.body.token;
//     userAuthToken = userRes.body.token;
//     userId = userRes.body.user.uid;
// });

// describe("Testing Blog Endpoints", () => {
//     let blogPostId = "";
//     describe("Testing GET ALL BLOGPOSTS", () => {
//         it("should return all blog posts with 200 response", async function() {
//             const res = await chai.request(server).get("/api/v2/blog");
//             expect(res.status).to.equal(200);
//             expect(res.body).to.be.an("object");
//             expect(res.body).to.have.property("data").that.is.an("array");
//             expect(res.body).to.have.property("totalPages").that.is.a("number");
//             if (res.body.data.length > 0) {
//                 expect(res.body.data[0]).to.have.property("createdBy").that.is.a("string");
//                 res.body.data.forEach((post) => {
//                     expect(post).to.have.property("title").that.is.a("string");
//                     expect(post).to.have.property("content").that.is.a("string");
//                     expect(post).to.have.property("tags").that.is.an("array");
//                     expect(post).to.have.property("image").that.is.a("string");
//                 });
//             }
//         });
//         it("should return all blog posts that match the given title", async function() {
//             const test_title = "Building a URL Shortener Microservice API";
//             const res = await chai.request(server).get(`/api/v2/blog?title=${test_title}`);
//             expect(res.status).to.equal(200);
//             expect(res.body).to.be.an("object");
//             expect(res.body).to.have.property("data").that.is.an("array");
//             expect(res.body).to.have.property("totalPages").that.is.a("number");
//             res.body.data.forEach((post) => {
//                 expect(post.title.toLowerCase()).to.include(test_title.toLowerCase());
//             });
//         });
//         it("should return posts that match the given tag", async function() {
//             const test_tag = "angular";
//             const res = await chai.request(server).get("/api/v2/blog?tags=angular,frontend");
//             expect(res.status).to.equal(200);
//             expect(res.body.data).to.be.an("array");
//             res.body.data.forEach(post => {
//                 expect(post.tags.map(tag => tag.toLowerCase())).to.include(test_tag);
//             });
//         });
//         it("should return posts within the given startDate and endDate range", async function() {
//             const startDate = "2024-01-01";
//             const endDate = "2025-03-25";
//             const res = await chai.request(server).get(`/api/v2/blog?startDate=${startDate}&endDate=${endDate}`);
//             expect(res.status).to.equal(200);
//             expect(res.body.data).to.be.an("array");
//             res.body.data.forEach(post => {
//                 const postDate = new Date(post.createdAt);
//                 expect(postDate).to.be.at.least(new Date(startDate));
//                 expect(postDate).to.be.at.most(new Date(endDate));
//             });
//         });
//         it("should return posts sorted by createdAt", async function() {
//             const res = await chai.request(server).get("/api/v2/blog?sort=createdAt");
//             expect(res.status).to.equal(200);
//             expect(res.body.data).to.be.an("array");
//             for (let i = 0; i < res.body.data.length - 1; i++) {
//                 expect(new Date(res.body.data[i].createdAt)).to.be.at.least(new Date(res.body.data[i + 1].createdAt));
//             }
//         });
//         it("should return posts sorted by updatedAt", async function() {
//             const res = await chai.request(server).get("/api/v2/blog?sort=updatedAt");
//             expect(res.status).to.equal(200);
//             expect(res.body.data).to.be.an("array");
//             for (let i = 0; i < res.body.data.length - 1; i++) {
//                 expect(new Date(res.body.data[i].updatedAt)).to.be.at.least(new Date(res.body.data[i + 1].updatedAt));
//             }
//         });
    
//         it("should return posts with only selected fields", async function() {
//             const res = await chai.request(server).get("/api/v2/blog?select=title,content");
//             expect(res.status).to.equal(200);
//             expect(res.body.data).to.be.an("array");
//             res.body.data.forEach((post) => {
//                 expect(post).to.have.property("title");
//                 expect(post).to.have.property("content");
//                 expect(post).to.not.have.property("createdBy");
//                 expect(post).to.not.have.property("author");
//                 expect(post).to.not.have.property("tags");
//             });
//         });
//     });    
//     describe("Testing CREATE BLOGPOST", () => {
//         const postBody = {
//             "title": "testing",
//             "content": "testing",
//             "tags": "a",
//             "image": "testurl"
//         };
    
//         it("should create new blog post with required fields, valid authentication and access role provided", async function(){
//             const res = await chai.request(server).post("/api/v2/blog").set("authorization", `Bearer ${adminAuthToken}`).send(postBody);
//             blogPostId = res.body.post._id;
            
//             expect(res.status).to.equal(201);
//             expect(res.body).to.have.property("post");
//             expect(res.body.post).to.have.property("title");
//             expect(res.body.post).to.have.property("content");
//             expect(res.body.post).to.have.property("image");
//             expect(res.body.post).to.have.property("author");
//             expect(res.body.post).to.have.property("comments");
//             expect(res.body.post).to.have.property("createdBy");
//             expect(res.body.post).to.have.property("featured");
//             expect(res.body.post.title).to.equal("testing");
//         });
    
//         it("should return error if required fields are missing", async function(){
//             const res = await chai.request(server).post("/api/v2/blog").set("authorization", `Bearer ${adminAuthToken}`).send({});
            
//             expect(res.status).to.equal(400);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("Title, content, image and atleast two tags are required");
//         });
    
//         it("should return authentication error if authentication token is not provided", async function(){
//             const res = await chai.request(server).post("/api/v2/blog").send(postBody);
            
//             expect(res.status).to.equal(401);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("No authentication token provided");
//         });
    
//         it("should return authentication error if authentication token is not valid", async function(){
//             const res = await chai.request(server).post("/api/v2/blog").set("authorization", `Bearer 5463g3gt7483yrgr748h`).send(postBody);
            
//             expect(res.status).to.equal(401);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("Invalid authentication");
//         });
    
//         it("should return authorisation error if user does not have access previlege", async function(){
//             const res = await chai.request(server).post("/api/v2/blog").set("authorization", `Bearer ${userAuthToken}`).send(postBody);
            
//             expect(res.status).to.equal(403);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("Unauthorized for this action");
//         });
//     });
//     describe("Testing GET BLOGPOST BY ID", () => {
//         it("should return an error if id is invalid", async function(){
//             const res = await chai.request(server).get(`/api/v2/blog/64744rjh8h4u4hrfj88h4ur`);
//             expect(res.status).to.equal(400);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("Invalid data format (Cast Error)");
//         });
//         it("should return an error if no post with given id exists", async function(){
//             const postId = new ObjectId("663b2d3a4b36b9e3d35614fd");
//             const res = await chai.request(server).get(`/api/v2/blog/${postId}`);
//             expect(res.status).to.equal(404);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal(`No post with id ${postId}`);
//         });

//         it("should return post with valid id", async function(){
//             const res = await chai.request(server).get(`/api/v2/blog/${blogPostId}`);
//             expect(res.status).to.equal(200);
//             expect(res.body).to.have.property("data").which.is.an("object");
//             expect(res.body).to.have.property("totalLikes").which.is.a("number");
//             expect(res.body).to.have.property("isLiked").which.is.a("boolean");
//             expect(res.body.data._id.toString()).to.equal(blogPostId.toString());
//         })
//     });

//     describe("Testing UPDATE BLOGPOST BY ID", () => {
//         const updateBody = {
//             "title": "testing change"
//         };

//         it("should return authentication error if authentication token is not provided", async function(){
//             const res = await chai.request(server).patch(`/api/v2/blog/${blogPostId}`).send(updateBody);
//             expect(res.status).to.equal(401);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("No authentication token provided");
//         });
//         it("should return authentication error if authentication token is not valid", async function(){
//             const res = await chai.request(server).patch(`/api/v2/blog/${blogPostId}`).set("authorization", `Bearer 5463g3gt7483yrgr748h`).send(updateBody);
//             expect(res.status).to.equal(401);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("Invalid authentication");
//         });
//         it("should return authorisation error if user does not have access previlege", async function(){
//             const res = await chai.request(server).patch(`/api/v2/blog/${blogPostId}`).set("authorization", `Bearer ${userAuthToken}`).send(updateBody);
//             expect(res.status).to.equal(403);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("Unauthorized for this action");
//         });
//         it("should return error if update body is not provided", async function(){
//             const res = await chai.request(server).patch(`/api/v2/blog/${blogPostId}`).set("authorization", `Bearer ${adminAuthToken}`).send({});
//             expect(res.status).to.equal(400);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("no title or body or author was passed in for update");
//         });
//         it("should update blog post with update body, valid authentication and access role provided", async function(){
//             const res = await chai.request(server).patch(`/api/v2/blog/${blogPostId}`).set("authorization", `Bearer ${adminAuthToken}`).send(updateBody);
//             expect(res.status).to.equal(201);
//             expect(res.body).to.have.property("editedPost");
//             expect(res.body.editedPost).to.have.property("title");
//             expect(res.body.editedPost).to.have.property("content");
//             expect(res.body.editedPost).to.have.property("image");
//             expect(res.body.editedPost).to.have.property("author");
//             expect(res.body.editedPost).to.have.property("comments");
//             expect(res.body.editedPost).to.have.property("createdBy");
//             expect(res.body.editedPost).to.have.property("featured");
//             expect(res.body.editedPost.title).to.equal(updateBody.title);
//         });
//     });

//     describe("Post Like/Unlike Functional Tests", function () {
//         it("should like a post", async function () {
//             const res = await chai.request(server).post(`/api/v2/blog/${blogPostId}/likes`).set("Authorization", `Bearer ${userAuthToken}`);
     
//             expect(res.status).to.equal(201);
//             expect(res.body).to.have.property("message", "successfully liked post");
//             expect(res.body.post.likes).to.include(userId);
//         });
    
//         it("should unlike a post", async function () {
//             const res = await chai.request(server).delete(`/api/v2/blog/${blogPostId}/likes`).set("Authorization", `Bearer ${userAuthToken}`);

//             expect(res.status).to.equal(200);
//             expect(res.body).to.have.property("message", "Successfully unliked post");
//             expect(res.body.post.likes).to.not.include(userId);
//         });

//         it("should return authentication error if authentication token is not provided", async function(){
//             const res = await chai.request(server).post(`/api/v2/blog/${blogPostId}/likes`);
            
//             expect(res.status).to.equal(401);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("No authentication token provided");
//         });
//         it("should return authentication error if authentication token is not valid", async function(){
//             const res = await chai.request(server).post(`/api/v2/blog/${blogPostId}/likes`).set("authorization", `Bearer 5463g3gt7483yrgr748h`);
            
//             expect(res.status).to.equal(401);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("Invalid authentication");
//         });
//         it("should return error when liking an inexistent blog post", async function(){
//             const res = await chai.request(server).post('/api/v2/blog/609bda561a4f4a3b88b29cd1/likes').set("authorization", `Bearer ${userAuthToken}`);

//             expect(res.status).to.equal(404);
//             expect(res.body).to.have.property("error", "The blog post you attempted to like does not exist");
//         });
//     });

//     describe("Testing DELETE BLOGPOST BY ID", () => {
//         it("should return authentication error if authentication token is not provided", async function(){
//             const res = await chai.request(server).delete(`/api/v2/blog/${blogPostId}`);
//             expect(res.status).to.equal(401);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("No authentication token provided");

//         });
//         it("should return authentication error if authentication token is not valid", async function(){
//             const res = await chai.request(server).delete(`/api/v2/blog/${blogPostId}`).set("authorization", `Bearer 5463g3gt7483yrgr748h`)
//             expect(res.status).to.equal(401);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("Invalid authentication");
//         });
//         it("should return authorisation error if user does not have access previlege", async function(){
//             const res = await chai.request(server).delete(`/api/v2/blog/${blogPostId}`).set("authorization", `Bearer ${userAuthToken}`);
//             expect(res.status).to.equal(403);
//             expect(res.body).to.have.property("error");
//             expect(res.body.error).to.equal("Unauthorized for this action");
//         });
//         it("should delete blog post with valid authentication and access role provided", async function(){
//             const res = await chai.request(server).delete(`/api/v2/blog/${blogPostId}`).set("authorization", `Bearer ${adminAuthToken}`);
//             expect(res.status).to.equal(201);
//             expect(res.body).to.have.property("deletedPost").which.is.an("object");
//             expect(res.body).to.have.property("deletedComments").which.is.an("object");
//             expect(res.body.deletedPost).to.have.property("title");
//             expect(res.body.deletedPost).to.have.property("content");
//             expect(res.body.deletedPost).to.have.property("image");
//             expect(res.body.deletedPost).to.have.property("author");
//             expect(res.body.deletedPost).to.have.property("comments");
//             expect(res.body.deletedPost).to.have.property("createdBy");
//             expect(res.body.deletedPost).to.have.property("featured");
//             expect(res.body.deletedPost._id).to.equal(blogPostId);
//             expect(res.body.deletedComments.acknowledged).to.equal(true);
//         });
//     });    
// });