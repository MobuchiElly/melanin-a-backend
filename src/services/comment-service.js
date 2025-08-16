const Comment = require("../models/Comments");
const Post = require("../models/Posts");
const {
    BadRequestError,
    NotFoundError,
    ForbiddenError
} = require("../errors");
const ObjectId = require("mongoose").Types.ObjectId;

const getCommentsService = async(approved) => {
  const queryField = {};

  if(approved === "true" || approved === "false"){
    queryField.approved = approved === "true"; 
  }
  //would implement filter, sorting based on date and other features
  const comments = await Comment.find(queryField)
  .sort({ updatedAt: -1 })
  .populate("blogPostId")
  .exec();
  const commentCount = await Comment.countDocuments(queryField);
  return {comments, commentCount}
};

const createCommentService = async({content, blogPostId, createdBy, writer}) => {
    if (!content) {
        throw new BadRequestError("comment content is required");
      }
      const comment = await Comment.create({
        content,
        createdBy,
        blogPostId,
        writer
      });
      if (!comment) {
        throw new BadRequestError("Unable to create post");
      }
      const updatedPost = await Post.findByIdAndUpdate(
        blogPostId,
        { $push: { comments: comment._id } },
        { new: true}
      );
      return { comment, updatedPost }
};

const editCommentService = async({commentId, content, createdBy}) => {
    if (!content) throw new BadRequestError("No content field provided");
    const comment = await Comment.findOneAndUpdate(
      {
        _id: commentId,
        createdBy
      },
      { content },
      { new: true }
    ).populate("blogPostId");
    if (!comment) {
      throw new ForbiddenError(
        "You cannot update a comment not created by you"
      );
    }
    return comment;
};

const deleteCommentService = async({commentId, user}) => {
    let delComment;
    //should also delete the comment id in the blog post comments array
    if (user.role === "admin") {
      delComment = await Comment.findOneAndDelete({ _id: commentId });
    }
    if (user.role !== "admin") {
      delComment = await Comment.findOneAndDelete({
        _id: commentId,
        createdBy: user.userId,
    });
    }
    return delComment;
};

const getCommentService = async(commentId) => {
  if (!ObjectId.isValid(commentId)) {
    throw new BadRequestError("Invalid comment ID");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) throw new NotFoundError(`No comment with ${commentId} exists`);
  return comment;
};

const approveCommentService = async({commentId, approved}) => {
  if (approved === undefined || approved === null) {
    throw new BadRequestError(
      "approval status must be provided in the request body"
    );
  }
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { approved },
    { new: true }
  ).populate("blogPostId");

  if (!comment) {
    throw new NotFoundError(`No id found with id ${commentId}`);
  }
  return comment;
};

module.exports = {
    getCommentsService,
    createCommentService,
    deleteCommentService,
    editCommentService,
    getCommentService,
    approveCommentService
};