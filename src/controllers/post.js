const express = require("express");
const {
  createPostService,
  getPostService,
  getAllPostsService,
  editPostService,
  deletePostService,
  addLikeService,
  deleteLikeService
} = require("../services/blog-post-service");



const createPost = async (req, res) => {
  const { title, image, content, featured, tags } = req.body;
  const author = req.body.author || req.user.name;
  const uid = req.user.userId;

  const blogPost = await createPostService({title, image, content, featured, tags, author, uid});

  res.status(201).json({ 
    success: true, 
    message: "Blog post creation successfull",
    data: {
      blogPost
    }
  });
};

const getAllPosts = async (req, res) => {
  const { sort, title, tags, search, featured, author, startDate, endDate, select } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const {posts, totalPages} = await getAllPostsService({ sort, title, tags, search, featured, author, startDate, endDate, select, page, limit });

  res.status(200).json({
    success: true,
    message: "Blog posts returned successfully",
    data:{
      posts,
      totalPages
    }
  });
};

const getPost = async (req, res) => {
  const { postId } = req.params;
  const {uid} = req.query;
 
  const {post, totalLikes, isLiked} = await getPostService({postId, uid});

  res.status(200).json({
    success: true,
    message: "Blog post retrieved successfully",
    data:{
      post, 
      totalLikes, 
      isLiked
    }
  });
};

const editPost = async (req, res) => {
  const { postId } = req.params;
  const body = req.body;

  const updatedPost = await editPostService({postId, body});

  res.status(200).json({ 
    success: true,
    message:"Blog post updated successfully",
    data: {
      updatedPost
    }
   });
};

const deletePost = async (req, res) => {
  const { postId } = req.params;

  const {deletedPost, deletedComments} = await deletePostService(postId); 

  res.status(200).json({ 
    success: true,
    message: "Blog Post deleted sucessfully",
    data: {
      deletedPost,
      deletedComments
    } 
  });
};

const addLike = async(req, res) => {
  const {postId} = req.params;
  const uid = req.user.userId;

  const post = await addLikeService({postId, uid});

  res.status(200).json({
    success: true,
    message:"successfully liked post", 
    data: {
      post
    }
  });
};


const deleteLike = async(req, res) => {
  const {postId} = req.params;
  const uid = req.user.userId;

  const post = await deleteLikeService({postId, uid});
  
  res.status(200).json({ 
    success: true,
    message: "Successfully unliked post", 
    data: {
      post
    } 
  });
};

module.exports = {
  getAllPosts,
  getPost,
  createPost,
  editPost,
  deletePost,
  addLike,
  deleteLike
};