const Post = require("../models/Posts");
const Comment = require("../models/Comments");
const {
    BadRequestError,
    NotFoundError
} = require("../errors");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const createPostService = async({ title, image, content, featured, tags, author, uid }) => {
    if (!title || !content || !tags || !image) {
        throw new BadRequestError("Title, content, image and atleast two tags are required");
    }
    if (!Array.isArray(tags) || tags.length < 2) {
        throw new BadRequestError("At least two tags are required");
    }
       
    const post = await Post.create({
        title,
        image,
        content,
        author,
        createdBy: uid,
        featured,
        tags
    });

    if (!post) {
    throw new BadRequestError("Blog post creation was unsuccessful. Please try again");
    }
    return post;
};

const getAllPostsService = async({ sort, title, tags, search, featured, author, startDate, endDate, select, page, limit }) => {
    let queryObj = {}; 
    let sortObj = {};
    if (title) queryObj.title = { $regex:title, $options:"i" };

    if (tags) {
        const tagArray = tags.split(",").map(tag => tag.trim());
        const tagConditions = tagArray.map(tag => ({ tags: { $regex: `^${tag}$`, $options: "i" } }));
        queryObj.$or = [...(queryObj.$or || []), ...tagConditions];
    }
    
    if (search) {
        const searchConditions = [
            { title: {$regex:search, $options:"i"} },
            { content: { $regex:search, $options:"i" }  },
            { author: { $regex:search, $options:"i" } }
        ];
        queryObj.$or = [...(queryObj.$or || []), ...searchConditions];
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

    const skip = (page - 1) * limit;

    if(select) {
        const fields = select.split(',').join(' ');
        postsQuery = postsQuery.select(fields);
    }

    const posts = await postsQuery.populate("comments").skip(skip).limit(limit).exec();
    const totalQueryPosts = await Post.countDocuments(queryObj);
    console.log("total:", totalQueryPosts);
    const totalPages = Math.ceil(totalQueryPosts/limit);

    return {posts: posts || [], totalPages};
};

const getPostService = async({postId, uid}) => {
    const singlePost = await Post.findById(postId).populate("comments").exec();
    if (!singlePost) {
      throw new NotFoundError(`No post with id ${postId}`);
    }
    //Get alll likes in the blog post
    const totalLikes = singlePost.likes.length;
    //Find out if the logged in user liked the blog post
    const isLiked = uid ?  singlePost.likes.includes(uid) : false;
    const post = singlePost.toObject();
    const approvedComments = post.comments.filter(comment => comment.approved === true);
    post.comments = approvedComments;
    delete post.likes;
    return {post, totalLikes, isLiked};
};

const editPostService = async({postId, body}) => {
    if (!postId || !ObjectId.isValid(postId)) {
        throw new BadRequestError("Invalid postId");
      }
    if (!body || Object.keys(body).length == 0) {
        throw new BadRequestError(
          "No update field provided"
        );
    };
    const allowedFields = ["title", "image", "content", "featured", "tags"];
    
    const invalidFields = Object.keys(body).filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        throw new BadRequestError(`Invalid fields: ${invalidFields.join(", ")}`);
    };
    
    const updatedPost = await Post.findByIdAndUpdate(postId, body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    if (!updatedPost) {
        throw new NotFoundError(`No post with id ${postId}`);
    }
    return updatedPost;
};

const deletePostService = async(postId) => {
    if (!postId || !ObjectId.isValid(postId)) {
        throw new BadRequestError("Invalid postId");
    }
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      throw new NotFoundError(`No post with id ${postId}`);
    }
    const deletedComments = await Comment.deleteMany({ blogPostId: postId });
    return { deletedPost, deletedComments };
};

const addLikeService = async({postId, uid}) => {
    if(!postId || !uid) {
        throw new BadRequestError("postId and uid are required");
    }
    const post = await Post.findById(postId);
    if(!post){
        throw new NotFoundError("The blog post you attempted to like does not exist");
    };
    const hasLiked = post.likes.some((id) => id.toString() === uid.toString());
    if (!hasLiked) {
      post.likes.push(uid);
      await post.save();
    }
    return post;
};

const deleteLikeService = async({postId, uid}) => {
    if(!postId || !uid) {
        throw new BadRequestError("postId and uid are required");
    }
    const post = await Post.findByIdAndUpdate(postId, {$pull:{likes: uid}}, {new:true, useFindAndModify:false});

    if(!post){
      throw new NotFoundError("Post not found");
    }
    return post;
};

module.exports = {
    createPostService,
    getPostService,
    getAllPostsService,
    editPostService,
    deletePostService,
    addLikeService,
    deleteLikeService
}