const { BadRequestError, Unauthorisederror } = require("../errors/index.js");
const NotFoundError = require("../errors/custom_errors/not-found.js");
const Comment = require("../models/Comments");
const Post = require("../models/Posts");

const getComments = async (req, res) => {
  const {approved} = req.query;
  if (approved) {
    if (approved === "false") {
      const pendingComments = await Comment.find({
        approved: false,
      })
        .sort({ createdAt: -1 })
        .populate("blogPostId")
        .exec();
      return res.status(200).json({data: pendingComments});
    }
    if (approved === "true") {
      const approvedComments = await Comment.find({
        approved: true,
      })
        .sort({ updatedAt: -1 })
        .populate("blogPostId")
        .exec();
      return res.status(200).json({data: approvedComments});
    }
  }
  //would implement filter, sorting based on date and other features
  const comments = await Comment.find({}).sort({upDatedAt: -1}).populate("blogPostId").exec();
  const commentCount = await Comment.countDocuments();
  return res.status(200).json({data: comments, commentCount});
};

const approveComment = async (req, res) => {
  const { commentId } = req.params;
  const { approved } = req.body;

  if (approved === undefined || approved === null) {
    throw new BadRequestError(
      "approval status must be provided in the request body"
    );
  }
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { ...req.body },
    { new: true }
  );
  if (!comment) {
    throw new NotFoundError(`No id found with id ${commentId}`);
  }
  res.status(201).json(comment);
};

const createComment = async (req, res) => {
  const { userId: createdBy, name: writer } = req.user;
  const { postId: blogPostId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new BadRequestError("comment content is required");
  }
  const comment = await Comment.create({
    content,
    createdBy,
    blogPostId,
    writer,
  });
  if (!comment) {
    throw new BadRequestError("Unable to create post");
  }
  const updatedPost = await Post.findByIdAndUpdate(
    blogPostId,
    { $push: { comments: comment._id } },
    { new: true, useFindAndModify: false }
  );
  res.status(201).json({ comment, updatedPost });
};

const getComment = async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new NotFoundError(`No comment with ${commentId} exists`);
  res.status(200).json(comment);
};

const editComment = async (req, res) => {
  const { commentId } = req.params;
  const {content} = req.body;
  const {userId: createdBy} = req.user;
  if(!content) throw new BadRequestError("No content field provided");

  const comment = await Comment.findOneAndUpdate({
    _id: commentId,
    createdBy
  }, {content}, {new: true});
  if(!comment){
    throw new Unauthorisederror("You cannot update a comment not created by you");
  }
  return res.status(201).json(comment);
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  let delComment;

  //should also delete the comment id in the blog post comments array
  if (req.user.role === "admin") {
    delComment = await Comment.findOneAndDelete({ _id: commentId }); 
  }
  if (req.user.role !== "admin") {
    delComment = await Comment.findOneAndDelete({
      _id: commentId,
      createdBy: req.user.userId,
    });
  }
  return res.status(200).json(delComment);
};

module.exports = {
  getComments,
  createComment,
  deleteComment,
  editComment,
  getComment,
  approveComment,
};