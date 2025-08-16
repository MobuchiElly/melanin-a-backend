require("dotenv").config();
const {describe} = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require("../../src/app");
const {ObjectId} = require("mongodb");

chai.use(chaiHttp);

const adminEmail = process.env.TEST_ADMIN_EMAIL;
const password = process.env.TEST_PASSW;
const testUserEmail = process.env.TEST_USER_EMAIL;

describe("Testing Blog Endpoints", () => {
    describe("Testing GET ALL BLOGPOSTS", () => {
        it("should return all blog posts with 200 response", async function() {
            const res = await chai
            .request(server).get("/api/v2/blog");
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body).to.have.property("data").that.is.an("object");
            expect(res.body).to.have.property("success").that.is.a("boolean");
            expect(res.body.data).to.have.property("posts");
            expect(res.body.data).to.have.property("totalPages").that.is.a("number");
            if(res.body.data.posts.length > 0){
                res.body.data.posts.forEach((post) => {
                    expect(post).to.have.property("title").that.is.a("string");
                    expect(post).to.have.property("content").that.is.a("string");
                    expect(post).to.have.property("tags").that.is.an("array");
                    expect(post).to.have.property("image").that.is.a("string");
                });
            }
        });
        it("should return all blog posts that match the given title", async function() {
            const test_title = "Introduction to Frontend Development";
            const res = await chai
            .request(server).get(`/api/v2/blog?title=${test_title}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body).to.have.property("data").that.is.an("object");
            expect(res.body.data).to.have.property("totalPages").that.is.a("number");
            res.body.data.posts.forEach((post) => {
                expect(post.title.toLowerCase()).to.include(test_title.toLowerCase());
            });
        });
        it("should return posts that match the given tag", async function() {
            const res = await chai
            .request(server).get("/api/v2/blog?tags=development,frontend");
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body.data).to.be.an("object");
            res.body.data.posts.forEach(post => {
                expect(post.tags.map(tag => tag.toLowerCase())).to.include("frontend");
            });
        });
        it("should return posts within the given startDate and endDate range", async function() {
            const startDate = "2024-01-01";
            const endDate = new Date().toISOString().split("T")[0];
            const res = await chai
            .request(server).get(`/api/v2/blog?startDate=${startDate}&endDate=${endDate}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body.data).to.be.an("object");
            res.body.data.posts.forEach(post => {
                const postDate = new Date(post.createdAt);
                expect(postDate).to.be.at.least(new Date(startDate));
                expect(postDate).to.be.at.most(new Date(endDate));
            });
        });
        it("should return posts sorted by createdAt", async function() {
            const res = await chai
            .request(server).get("/api/v2/blog?sort=createdAt");
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body.data).to.be.an("object");
            for (let i = 0; i < res.body.data.posts.length - 1; i++) {
                expect(new Date(res.body.data.posts[i].createdAt)).to.be.at.least(new Date(res.body.data.posts[i + 1].createdAt));
            }
        });
        it("should return posts sorted by updatedAt", async function() {
            const res = await chai
            .request(server).get("/api/v2/blog?sort=updatedAt");
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body.data).to.be.an("object");
            for (let i = 0; i < res.body.data.length - 1; i++) {
                expect(new Date(res.body.data.posts[i].updatedAt)).to.be.at.least(new Date(res.body.data.posts[i + 1].updatedAt));
            }
        });
    
        it("should return posts with only selected fields", async function() {
            const res = await chai
            .request(server).get("/api/v2/blog?select=title,content");
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body.data).to.be.an("object");
            res.body.data.posts.forEach((post) => {
                expect(post).to.have.property("title");
                expect(post).to.have.property("content");
                expect(post).to.not.have.property("createdBy");
                expect(post).to.not.have.property("author");
                expect(post).to.not.have.property("tags");
            });
        });
    });

    describe("Testing GET BLOGPOST BY ID", () => {
        it("should return an error if id is invalid", async function(){
            const res = await chai
            .request(server).get(`/api/v2/blog/64744rjh8h4u4hrfj88h4ur`);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Invalid data format (Cast Error)");
        });
        it("should return an error if no post with given id exists", async function(){
            const postId = new ObjectId("663b2d3a4b36b9e3d35614fd");
            const res = await chai
            .request(server).get(`/api/v2/blog/${postId}`);
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal(`No post with id ${postId}`);
        });

        it("should return post with valid id", async function(){
            const blogPostId = "68930c7ae6a9c4a4f92d5114"
            const res = await chai
            .request(server).get(`/api/v2/blog/${blogPostId}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("data").which.is.an("object");
            expect(res.body.data).to.have.property("totalLikes").which.is.a("number");
            expect(res.body.data).to.have.property("isLiked").which.is.a("boolean");
            expect(res.body.data.post._id.toString()).to.equal(blogPostId.toString());
        })
    });

    describe("", () => {
        let testUserAuthToken;
        let adminAuthToken;
        let blogPostId;
        beforeEach(async() => {
            //Login both users
            const adminLoginRes = await chai
            .request(server)
            .post("/api/v2/auth/login")
            .send({
                email: adminEmail,
                password
            });
            adminAuthToken = adminLoginRes.body.data.token;

            const testUserLoginRes = await chai
            .request(server)
            .post("/api/v2/auth/login")
            .send({
                email: testUserEmail,
                password
            });
            testUserAuthToken = testUserLoginRes.body.data.token;
        });
        before(async() => {
            const postRes = await chai
            .request(server)
            .get("/api/v2/blog");
            blogPostId = postRes.body.data?.posts[0]._id
        });

        describe("Testing CREATE BLOGPOST", () => {
            const postBody = {
                "title": "test title",
                "content": "test content",
                "tags": ["test_tag", "test_tag2"],
                "image": "testurl"
            };
            
            it("should create new blog post with required fields, valid authentication and access role provided", async function(){
                const res = await chai
                .request(server)
                .post("/api/v2/blog")
                .set("authorization", `Bearer ${adminAuthToken}`)
                .send(postBody);    
                expect(res.status).to.equal(201);
                expect(res.body).to.have.property("data").that.is.an("object");
                expect(res.body).to.have.property("success").to.be.true;
                expect(res.body.data).to.have.property("blogPost");
                expect(res.body.data.blogPost).to.have.property("title");
                expect(res.body.data.blogPost).to.have.property("content");
                expect(res.body.data.blogPost).to.have.property("image");
                expect(res.body.data.blogPost).to.have.property("author");
                expect(res.body.data.blogPost).to.have.property("comments");
                expect(res.body.data.blogPost).to.have.property("createdBy");
                expect(res.body.data.blogPost).to.have.property("featured");
                expect(res.body.data.blogPost.title).to.equal(postBody.title);
            });
        
            it("should return error if required fields are missing", async function(){
                const res = await chai
                .request(server)
                .post("/api/v2/blog")
                .set("authorization", `Bearer ${adminAuthToken}`)
                .send({});
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("Title, content, image and atleast two tags are required");
            });
        
            it("should return authentication error if authentication token is not provided", async function(){
                const res = await chai
                .request(server)
                .post("/api/v2/blog")
                .send(postBody);
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("No authentication token provided");
            });
        
            it("should return authentication error if authentication token is not valid", async function(){
                const res = await chai
                .request(server)
                .post("/api/v2/blog")
                .set("authorization", `Bearer 5463g3gt7483yrgr748h`)
                .send(postBody);              
                expect(res.status).to.equal(401);
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("Invalid authentication");
            });
        
            it("should return authorisation error if user does not have access previlege", async function(){
                const res = await chai
                .request(server)
                .post("/api/v2/blog")
                .set("authorization", `Bearer ${testUserAuthToken}`)
                .send(postBody);
                expect(res.status).to.equal(403);
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("Unauthorized for this action");
            });
        });

        describe("Testing UPDATE BLOGPOST BY ID", () => {
            const updateBody = {
                "title": "test title updated"
            };

            it("should return authentication error if authentication token is not provided", async function(){
                const res = await chai
                .request(server)
                .patch(`/api/v2/blog/${blogPostId}`)
                .send(updateBody);
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("success").to.be.false;
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("No authentication token provided");
            });
            it("should return authentication error if authentication token is not valid", async function(){
                const res = await chai
                .request(server)
                .patch(`/api/v2/blog/${blogPostId}`)
                .set("authorization", `Bearer 5463g3gt7483yrgr748h`)
                .send(updateBody);
                expect(res.status).to.equal(401);
                expect(res.body).to.have.property("success").to.be.false;
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("Invalid authentication");
            });
            it("should return authorisation error if user does not have access previlege", async function(){
                const res = await chai
                .request(server)
                .patch(`/api/v2/blog/${blogPostId}`)
                .set("authorization", `Bearer ${testUserAuthToken}`)
                .send(updateBody);
                expect(res.status).to.equal(403);
                expect(res.body).to.have.property("success").to.be.false;
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("Unauthorized for this action");
            });
            it("should return error if update body is not provided", async function(){
                const res = await chai
                .request(server)
                .patch(`/api/v2/blog/${blogPostId}`)
                .set("authorization", `Bearer ${adminAuthToken}`)
                .send({});
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("success").to.be.false;
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("no title or body or author was passed in for update");
            });
            it("should update blog post with update body, valid authentication and access role provided", async function(){
                const res = await chai.request(server).patch(`/api/v2/blog/${blogPostId}`).set("authorization", `Bearer ${adminAuthToken}`).send(updateBody);
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property("success").to.be.true;
                expect(res.body.data).to.have.property("updatedPost");
                expect(res.body.data.updatedPost).to.have.property("title");
                expect(res.body.data.updatedPost).to.have.property("content");
                expect(res.body.data.updatedPost).to.have.property("image");
                expect(res.body.data.updatedPost).to.have.property("author");
                expect(res.body.data.updatedPost).to.have.property("comments");
                expect(res.body.data.updatedPost).to.have.property("createdBy");
                expect(res.body.data.updatedPost).to.have.property("featured");
                expect(res.body.data.updatedPost.title).to.equal(updateBody.title);
            });
        });

        describe("Post Like/Unlike Functional Tests", function () {
            it("should like a post", async function () {
                const res = await chai
                .request(server)
                .patch(`/api/v2/blog/${blogPostId}/likes`)
                .set("Authorization", `Bearer ${testUserAuthToken}`);
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property("success").to.be.true;
                expect(res.body).to.have.property("message", "successfully liked post");
            });
        
            it("should unlike a post", async function () {
                const res = await chai
                .request(server)
                .delete(`/api/v2/blog/${blogPostId}/likes`)
                .set("Authorization", `Bearer ${testUserAuthToken}`);
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property("success").to.be.true;
                expect(res.body).to.have.property("message", "Successfully unliked post");
                });

            it("should return authentication error if authentication token is not provided", async function(){
                const res = await chai
                .request(server)
                .patch(`/api/v2/blog/${blogPostId}/likes`);
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("success").to.be.false;
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("No authentication token provided");
            });
            it("should return authentication error if authentication token is not valid", async function(){
                const res = await chai
                .request(server)
                .patch(`/api/v2/blog/${blogPostId}/likes`)
                .set("authorization", `Bearer 5463g3gt7483yrgr748h`);
                expect(res.status).to.equal(401);
                expect(res.body).to.have.property("success").to.be.false;
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("Invalid authentication");
            });
            it("should return error when liking an inexistent blog post", async function(){
                const res = await chai
                .request(server)
                .patch('/api/v2/blog/609bda561a4f4a3b88b29cd1/likes')
                .set("authorization", `Bearer ${testUserAuthToken}`);
                expect(res.status).to.equal(404);
                expect(res.body).to.have.property("success").to.be.false;
                expect(res.body).to.have.property("error", "The blog post you attempted to like does not exist");
            });
        });

        describe("Testing DELETE BLOGPOST BY ID", () => {
            it("should return authentication error if authentication token is not provided", async function(){
                const res = await chai
                .request(server)
                .delete(`/api/v2/blog/${blogPostId}`);
                expect(res.status).to.equal(400);
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("No authentication token provided");
            });
            it("should return authentication error if authentication token is not valid", async function(){
                const res = await chai
                .request(server)
                .delete(`/api/v2/blog/${blogPostId}`)
                .set("authorization", `Bearer 5463g3gt7483yrgr748h`)
                expect(res.status).to.equal(401);
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("Invalid authentication");
            });
            it("should return authorisation error if user does not have access previlege", async function(){
                const res = await chai
                .request(server)
                .delete(`/api/v2/blog/${blogPostId}`)
                .set("authorization", `Bearer ${testUserAuthToken}`);
                expect(res.status).to.equal(403);
                expect(res.body).to.have.property("error");
                expect(res.body.error).to.equal("Unauthorized for this action");
            });
            it("should delete blog post with valid authentication and access role provided", async function(){
                const res = await chai
                .request(server)
                .delete(`/api/v2/blog/${blogPostId}`)
                .set("authorization", `Bearer ${adminAuthToken}`);
                expect(res.status).to.equal(200);
                expect(res.body).to.have.property("success").to.be.true;
                expect(res.body).to.have.property("message", "Blog Post deleted sucessfully");
            });
        });
    });
});