const express = require("express");
const Post = require("../models/Posts");
const Comment = require("../models/Comments");
const { BadRequestError, NotFoundError } = require("../errors");


const app = express();

const createPost = async (req, res) => {
  const { title, image, content, featured, tags } = req.body;
  const author = req.body.author || req.user.name;

  if (!title || !content || !tags || !image) {
    throw new BadRequestError("Title, content, image and atleast two tags are required");
  }

  const post = await Post.create({
    title,
    image,
    content,
    author,
    createdBy: req.user.userId,
    featured,
    tags
  });
  if (!post) {
    throw new BadRequestError("Blog post creation was unsuccessful. Please try again");
  }
  res.status(201).json({ post });
};

const getAllPosts = async (req, res) => {
  try {
    const { sort, title, tags, search, featured, author, startDate, endDate, select } = req.query;
    
    let queryObj = {}; 
    let sortObj = {};
   if (title) queryObj.title = { $regex:title, $options:"i" };

  if (tags) {
    const tagArray = tags.split(",").map(tag => tag.trim());
    queryObj.$or = tagArray.map(tag => ({ tags: { $regex: `^${tag}$`, $options: "i" } }));
  }
  
   if (search) {
    queryObj.$or = [
      { title: {$regex:search, $options:"i"} },
      { content: { $regex:search, $options:"i" }  },
      { author: { $regex:search, $options:"i" } }
    ]
   }
   if(featured) queryObj.featured = featured;
   
   if(startDate || endDate){
    queryObj.createdAt = {};
    if(startDate){
      queryObj.createdAt.$gte = new Date(startDate);
    }
    if(endDate){
      queryObj.createdAt.$lte = new Date(endDate);
    }
   }
  
   let postsQuery = Post.find(queryObj);
   
    if (sort === "createdAt" || sort === "updatedAt") {
      sortObj[sort] = -1;
    } else {
      sortObj = { updatedAt: -1 };
    }
    
    postsQuery.sort(sortObj);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    if(select) {
      const fields = select.split(',').join(' ');
      postsQuery = postsQuery.select(fields);
    }

    const posts = await postsQuery.populate("comments").skip(skip).limit(limit).exec();
    if (!posts || posts.length === 0) {
      throw new NotFoundError("No blog posts found");
    };
    const totalQueryPosts = await Post.countDocuments(queryObj);
    const totalPages = Math.ceil(totalQueryPosts/limit);
    res.status(200).json({data:posts, totalPages});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getPost = async (req, res) => {
  const { postId } = req.params;
  const {uid} = req.query;
  
  const singlePost = await Post.findById(postId).populate("comments").exec();
  if (!singlePost) {
    throw new NotFoundError(`No post with id ${postId}`);
  }

  const totalLikes = singlePost.likes.length;
  const isLiked = uid ?  singlePost.likes.includes(uid) : false;

  const data = singlePost.toObject();
  delete data.likes;
  res.status(200).json({data, totalLikes, isLiked});
};

const editPost = async (req, res) => {
  const { postId } = req.params;
  const body = req.body;
  if (Object.keys(body).length == 0) {
    throw new BadRequestError(
      "no title or body or author was passed in for update"
    );
  }
  const editedPost = await Post.findByIdAndUpdate(postId, body, {
    new: true,
    runValidators: true,
  });
  if (!editedPost) {
    throw new NotFoundError(`No post with id ${postId}`);
  }
  res.status(201).json({ editedPost });
};

const deletePost = async (req, res) => {
  const { postId } = req.params;
  const deletedPost = await Post.findByIdAndDelete(postId);
  if (!deletedPost) {
    return res(404).json({ msg: `no post with id ${postId}` });
  }
  const deletedComments = await Comment.deleteMany({ blogPostId: postId });
  res.status(201).json({ deletedPost, deletedComments });
};

const addLike = async(req, res) => {
  const {postId} = req.params;
  const uid = req?.user?.userId;
  const post = await Post.findByIdAndUpdate(postId, { $addToSet: {likes: uid} },{new:true, useFindAndModify:false});
  
  if(!post){
    throw new NotFoundError("The blog post you attempted to like does not exist");
  }
  res.status(201).json({message:"successfully liked post", post:post});
}


const deleteLike = async(req, res) => {
  const {postId} = req.params;
  const uid = req.user.userId;
  const post = await Post.findByIdAndUpdate(postId, {$pull:{likes: uid}}, {new:true, useFindAndModify:false});

  if(!post){
    throw new NotFoundError("Post not found");
  }
  res.status(200).json({ message: "Successfully unliked post", post });
}

module.exports = {
  getAllPosts,
  getPost,
  createPost,
  editPost,
  deletePost,
  addLike,
  deleteLike
};