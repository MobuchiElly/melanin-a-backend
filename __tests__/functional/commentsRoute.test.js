require("dotenv").config();
const {describe} = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require("../../src/app.js");
const {ObjectId} = require("mongodb");

chai.use(chaiHttp);

const { TEST_ADMIN_EMAIL:adminEmail, TEST_PASSW:password, TEST_USER_EMAIL:testUserEmail } = process.env;

describe("Testing COMMENT Endpoints", () => {
    let testUserAuthToken;
    let adminAuthToken;
    let blogPostId;
    let commentId;

    before(async() => {
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
        .post("/api/v2/blog")
        .send({
            "title": "test title",
            "content": "test content",
            "tags": ["test_tag", "test_tag2"],
            "image": "testurl"
        })
        .set('authorization', `Bearer ${adminAuthToken}`);
        blogPostId = postRes.body.data.blogPost._id;

        const commentRes = await chai
        .request(server)
        .post(`/api/v2/comments/${blogPostId}`)
        .send({
            "content": "test comment"
        })
        .set('authorization', `Bearer ${adminAuthToken}`);
        commentId = commentRes.body.data.comment._id;
    });
    after(async() => {
        const postDeleteRes = await chai
        .request(server)
        .delete(`/api/v2/blog/${blogPostId}`)
        .set('authorization', `Bearer ${adminAuthToken}`);
        
        const commentDeleteRes = await chai
        .request(server)
        .delete(`/api/v2/comments/${commentId}`)
        .set('authorization', `Bearer ${adminAuthToken}`)
    })
    
    describe("Testing GET ALL COMMENTS", () => {
        it("should return all comments with 200 response", async function() {
            const res = await chai
            .request(server)
            .get("/api/v2/comments")
            .set("authorization", `Bearer ${adminAuthToken}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body).have.property("data").which.is.an("object");
            expect(res.body.data).have.property("commentCount").which.is.a("number");
            if (res.body.data.comments.length > 0){
                res.body.data.comments.forEach((comment) => {
                    expect(comment).to.have.property("_id").which.is.a("string");
                    expect(comment).to.have.property("blogPostId").which.is.an("object");
                    expect(comment).to.have.property("writer").which.is.a("string");
                    expect(comment).to.have.property("content").which.is.a("string");
                    expect(comment).to.have.property("createdBy").which.is.a("string");
                    expect(comment).to.have.property("createdAt").which.is.a("string");
                    expect(comment).to.have.property("approved").which.is.a("boolean");
                    expect(comment).to.have.property("updatedAt").which.is.a("string");
                    expect(comment.blogPostId).to.have.property("_id").which.is.a("string");
                    expect(comment.blogPostId).to.have.property("title").which.is.a("string");
                })
            }
        });
        it("should return all approved comments", async function() {
            const res = await chai
            .request(server)
            .get(`/api/v2/comments?approved=true`)
            .set("authorization", `Bearer ${adminAuthToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(res.body).have.property("data").which.is.an("object");
            if (res.body.data.comments.length > 0){
                res.body.data.comments.forEach((comment) => {
                    expect(comment).to.have.property("_id").which.is.a("string");
                    expect(comment).to.have.property("blogPostId").which.is.an("object");
                    expect(comment).to.have.property("writer").which.is.a("string");
                    expect(comment).to.have.property("content").which.is.a("string");
                    expect(comment).to.have.property("createdBy").which.is.a("string");
                    expect(comment).to.have.property("createdAt").which.is.a("string");
                    expect(comment).to.have.property("approved").which.is.a("boolean");
                    expect(comment.approved).to.equal(true);
                    expect(comment).to.have.property("updatedAt").which.is.a("string");
                    expect(comment.blogPostId).to.have.property("_id").which.is.a("string");
                    expect(comment.blogPostId).to.have.property("title").which.is.a("string");
                })
            }            
        });
        it("should return all pending comments", async function() {
            const res = await chai.request(server).get(`/api/v2/comments?approved=false`).set("authorization", `Bearer ${adminAuthToken}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body).to.be.an("object");
            expect(res.body).have.property("data").which.is.an("object");
            if (res.body.data.comments.length > 0){
                res.body.data.comments.forEach((comment) => {
                    expect(comment).to.have.property("_id").which.is.a("string");
                    expect(comment).to.have.property("blogPostId").which.is.an("object");
                    expect(comment).to.have.property("writer").which.is.a("string");
                    expect(comment).to.have.property("content").which.is.a("string");
                    expect(comment).to.have.property("createdBy").which.is.a("string");
                    expect(comment).to.have.property("createdAt").which.is.a("string");
                    expect(comment).to.have.property("approved").which.is.a("boolean");
                    expect(comment.approved).to.equal(false);
                    expect(comment).to.have.property("updatedAt").which.is.a("string");
                    expect(comment.blogPostId).to.have.property("_id").which.is.a("string");
                    expect(comment.blogPostId).to.have.property("title").which.is.a("string");
                })
            }
        });
        it("should return authentication error if authentication token is not provided", async function(){
            const res = await chai.request(server).get("/api/v2/comments");
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("success").to.be.false;
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("No authentication token provided");
        });
        it("should return authentication error if authentication token is not valid", async function(){
            const res = await chai.request(server).get("/api/v2/comments").set("authorization", `Bearer 5463g3gt7483yrgr748h`);
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("success").to.be.false;
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Invalid authentication");
        });
        it("should return authorisation error if user does not have access previlege", async function(){
            const res = await chai
            .request(server)
            .get("/api/v2/comments")
            .set("authorization", `Bearer ${testUserAuthToken}`);
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Unauthorized for this action");
        });
    });

    describe("TESTING GET COMMENT BY ID", () => {
        it("should return comment with id provided", async function(){
            const res = await chai
            .request(server)
            .get(`/api/v2/comments/${commentId}`)
            .set('authorization', `Bearer ${adminAuthToken}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body.data).to.have.property('comment').which.is.an('object');
            expect(res.body.data.comment).to.have.property('_id');
            expect(res.body.data.comment).to.have.property('blogPostId');
            expect(res.body.data.comment).to.have.property('content');
            expect(res.body.data.comment).to.have.property('createdBy');
        });
        it("should return error if the comment id provided is not assigned to any id in database", async function(){
            const nonExistentCoemmntId = new ObjectId("663b1e2a4b36b9e3d35514f7");
            const res = await chai
            .request(server)
            .get(`/api/v2/comments/${nonExistentCoemmntId}`)
            .set('authorization', `Bearer ${adminAuthToken}`);
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal(`No comment with ${nonExistentCoemmntId} exists`);
        });
        it("should return authentication error if authentication token is not provided", async function(){
            const res = await chai
            .request(server)
            .get(`/api/v2/comments/${commentId}`);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("No authentication token provided");
        });
        it("should return authentication error if authentication token is not valid", async function(){
            const res = await chai.request(server).get(`/api/v2/comments/${commentId}`).set("authorization", `Bearer 5463g3gt7483yrgr748h`);

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Invalid authentication");
        });
        it("should return authorisation error if user does not have access previlege", async function(){
            const res = await chai.request(server).get(`/api/v2/comments/${commentId}`).set("authorization", `Bearer ${testUserAuthToken}`);
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Unauthorized for this action");
        });
    });
   
    describe("TESTING POST COMMENT", () => {
        const content = "Test comment";
        it("should return authentication error if authentication token is not provided", async function(){
            const res = await chai
            .request(server)
            .post(`/api/v2/comments/${blogPostId}`)
            .send({content});
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body).to.have.property("success").to.be.false;
            expect(res.body.error).to.equal("No authentication token provided");
        });
        it("should return authentication error if authentication token is not valid", async function(){
            const res = await chai
            .request(server)
            .post(`/api/v2/comments/${blogPostId}`)
            .set("authorization", `Bearer 5463g3gt7483yrgr748h`)
            .send({content});
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("error");
            expect(res.body).to.have.property("success").to.be.false;
            expect(res.body.error).to.equal("Invalid authentication");
        });
        it("should return bad request error if comment is not provided in the request body", async function(){
            const res = await chai
            .request(server)
            .post(`/api/v2/comments/${blogPostId}`)
            .set("authorization", `Bearer ${adminAuthToken}`)
            .send({});
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("comment content is required");
        });
        it("should create new comment with valid authentication provided", async function(){
            const res = await chai
            .request(server)
            .post(`/api/v2/comments/${blogPostId}`)
            .set("authorization", `Bearer ${adminAuthToken}`)
            .send({content});
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body).to.have.property("data").which.is.an("object");
            expect(res.body.data.comment).to.have.property("_id");
            expect(res.body.data.comment).to.have.property("content");
            expect(res.body.data.comment).to.have.property("createdBy");
            expect(res.body.data.comment).to.have.property("blogPostId");
            expect(res.body.data.comment).to.have.property("writer");
            expect(res.body.data.updatedPost).to.have.property("comments");
            expect(res.body.data.updatedPost).to.have.property('_id');
            expect(res.body.data.updatedPost.comments).to.include(commentId);
        });
    });

    describe("TESTING UPDATE COMMENT", () => {
        const updatedComment = "Testing comment update";
        it("should update comment with valid comment id provided", async function(){
            const res = await chai
            .request(server)
            .patch(`/api/v2/comments/${commentId}`)
            .set('authorization', `Bearer ${adminAuthToken}`)
            .send({'content': updatedComment});
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body).to.have.property("data").to.be.an("object");
            expect(res.body.data.comment).to.have.property("_id");
            expect(res.body.data.comment).to.have.property("content");
            expect(res.body.data.comment).to.have.property("blogPostId");
            expect(res.body.data.comment).to.have.property("writer");
            expect(res.body.data.comment).to.have.property("createdBy");
            expect(res.body.data.comment).to.have.property("createdAt");
            expect(res.body.data.comment).to.have.property("updatedAt");
            expect(res.body.data.comment).to.have.property("approved");
        });
        it("should return bad request error if content field is not provided in the request body", async function(){
            const res = await chai
            .request(server)
            .patch(`/api/v2/comments/${commentId}`)
            .set('authorization', `Bearer ${adminAuthToken}`)
            .send({});
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("No content field provided");
        });
        it("should return authentication error if authentication token is not provided", async function(){
            const res = await chai.request(server).patch(`/api/v2/comments/${commentId}`).send({updatedComment});
            expect(res.status).to.equal(400);
            expect(res.body).have.property("success").to.be.false;
            expect(res.body).to.have.property("error", "No authentication token provided");
        });
        it("should return authentication error if authentication token is not valid", async function(){
            const res = await chai
            .request(server)
            .patch(`/api/v2/comments/${commentId}`)
            .set("authorization", `Bearer 5463g3gt7483yrgr748h`)
            .send({updatedComment});
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Invalid authentication");
        });
    });
    
    describe("TESTING APPROVE COMMENT", () => {
        it("should return authentication error if authentication token is not provided", async function(){
            const res = await chai
            .request(server)
            .patch(`/api/v2/comments/${commentId}/approvecomment`)
            .send({approved: true});
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("success").to.be.false;
            expect(res.body).to.have.property("error", "No authentication token provided");
        });
        it("should return authentication error if authentication token is not valid", async function(){
            const res = await chai
            .request(server)
            .patch(`/api/v2/comments/${commentId}/approvecomment`)
            .set("authorization", `Bearer 5463g3gt7483yrgr748h`)
            .send({approved: true});
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("success").to.be.false;
            expect(res.body).to.have.property("error", "Invalid authentication");
        });
        it("should return authorisation error if user does not have access previlege", async function(){
            const res = await chai
            .request(server)
            .patch(`/api/v2/comments/${commentId}/approvecomment`)
            .set("authorization", `Bearer ${testUserAuthToken}`)
            .send({approved:true});
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("Unauthorized for this action");
        });
        it("should approve pending comment with valid id", async function(){
            const res = await chai
            .request(server)
            .patch(`/api/v2/comments/${commentId}/approvecomment`)
            .set("authorization", `Bearer ${adminAuthToken}`)
            .send({approved:true});
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an("object");
            expect(res.body.data.comment).to.have.property("_id").which.is.a("string");
            expect(res.body.data.comment).to.have.property("blogPostId").which.is.a("string");
            expect(res.body.data.comment).to.have.property("writer").which.is.a("string");
            expect(res.body.data.comment).to.have.property("content").which.is.a("string");
            expect(res.body.data.comment).to.have.property("createdBy").which.is.a("string");
            expect(res.body.data.comment).to.have.property("approved").which.is.a("boolean");
            expect(res.body.data.comment).to.have.property("createdAt").which.is.a("string");
            expect(res.body.data.comment).to.have.property("updatedAt").which.is.a("string");
            expect(res.body.data.comment.approved).to.be.true;
        });
        it("should set an approved comment to pending", async function(){
            const res = await chai
            .request(server)
            .patch(`/api/v2/comments/${commentId}/approvecomment`)
            .set("authorization", `Bearer ${adminAuthToken}`)
            .send({approved:'false'});
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body.data.comment).to.have.property("_id").which.is.a("string");
            expect(res.body.data.comment).to.have.property("blogPostId").which.is.a("string");
            expect(res.body.data.comment).to.have.property("writer").which.is.a("string");
            expect(res.body.data.comment).to.have.property("content").which.is.a("string");
            expect(res.body.data.comment).to.have.property("createdBy").which.is.a("string");
            expect(res.body.data.comment).to.have.property("approved").which.is.a("boolean");
            expect(res.body.data.comment).to.have.property("createdAt").which.is.a("string");
            expect(res.body.data.comment).to.have.property("updatedAt").which.is.a("string");
            expect(res.body.data.comment.approved).to.be.false;
        });
        it("should return an error if required field is not provided", async function(){
            const res = await chai
            .request(server)
            .patch(`/api/v2/comments/${commentId}/approvecomment`)
            .set("authorization", `Bearer ${adminAuthToken}`)
            .send({});
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("success").to.be.false;
            expect(res.body).to.have.property("error", "approval status must be provided in the request body");
        });
    });
        
    describe("TESTING DELETE COMMENT", () => {
        it("should return authentication error if authentication token is not provided", async function(){
            const res = await chai
            .request(server)
            .delete(`/api/v2/comments/${commentId}`);
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property("error");
            expect(res.body.error).to.equal("No authentication token provided");
        });
        it("should return authentication error if authentication token is not valid", async function(){
            const res = await chai
            .request(server)
            .delete(`/api/v2/comments/${commentId}`)
            .set("authorization", `Bearer 5463g3gt7483yrgr748h`);
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property("success").to.be.false;
            expect(res.body).to.have.property("error", "Invalid authentication");
        });
        it("should return authorisation error if user does not have access previlege", async function(){
            const res = await chai
            .request(server)
            .delete(`/api/v2/comments/${commentId}`)
            .set("authorization", `Bearer ${testUserAuthToken}`);
            expect(res.status).to.equal(403);
            expect(res.body).to.have.property("success").to.be.false;
            expect(res.body).to.have.property("error", "Unauthorized for this action");
        });
        it("should successfully delete a comment with valid authentication and authorisation provided", async function(){
            const res = await chai
            .request(server)
            .delete(`/api/v2/comments/${commentId}`)
            .set("authorization", `Bearer ${adminAuthToken}`);    
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property("success").to.be.true;
            expect(res.body).to.have.property("message", "comment deleted successfully")
        });
    });
});