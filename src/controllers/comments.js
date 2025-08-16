const {
  getCommentsService,
  createCommentService,
  deleteCommentService,
  editCommentService,
  getCommentService,
  approveCommentService
} = require("../services/comment-service");

const getComments = async (req, res) => {
  const { approved } = req.query;

  const {comments, commentCount} = await getCommentsService(approved);

  return res.status(200).json({ 
    success: true,
    message:"Request successfull",
    data: {
      comments, 
      commentCount
    }
  });
};

const approveComment = async (req, res) => {
  const { commentId } = req.params;
  const { approved } = req.body;

  const comment = await approveCommentService({commentId, approved});

  res.status(200).json({
    success: true,
    message: "Successfull",
    data: {
      comment
    }
  });
};

const createComment = async (req, res) => {
  const { userId: createdBy, name: writer } = req.user;
  const { postId: blogPostId } = req.params;
  const { content } = req.body;

  const {comment, updatedPost} = await createCommentService({content, blogPostId, createdBy, writer});

  res.status(201).json({ 
    success: true,
    message: "Comment creation successfull",
    data: {
      comment,
      updatedPost
    }
  });
};

const getComment = async (req, res) => {
  const { commentId } = req.params;

  const comment = await getCommentService(commentId);

  res.status(200).json({
    success: true,
    message: "Request successfull",
    data: {
      comment
    }
  });
};

const editComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const { userId: createdBy } = req.user;

  const comment = await editCommentService({commentId, content, createdBy});

  return res.status(200).json({
    success: true,
    message:"Comment update successfull",
    data: {
      comment
    }});
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const user = req.user;

  const delComment = await deleteCommentService({commentId, user});

  return res.status(200).json({
    success: true,
    message:"comment deleted successfully",
    data: null});
};

module.exports = {
  getComments,
  createComment,
  deleteComment,
  editComment,
  getComment,
  approveComment,
};
