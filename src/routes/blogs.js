const express = require("express");
const authmiddleware = require("../middleware/authmiddleware");
const adminmiddleware = require("../middleware/adminmiddleware");
const {
  getAllPosts,
  getPost,
  createPost,
  editPost,
  deletePost,
  addLike,
  deleteLike,
} = require("../controllers/blogs");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Blog post management and user interactions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         image:
 *           type: string
 *         content:
 *           type: string
 *         author:
 *           type: string
 *         featured:
 *           type: boolean
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PostInput:
 *       type: object
 *       required:
 *         - title
 *         - image
 *         - content
 *         - tags
 *       properties:
 *         title:
 *           type: string
 *         image:
 *           type: string
 *         content:
 *           type: string
 *         featured:
 *           type: boolean
 *         tags:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all blog posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt]
 *       - in: query
 *         name: title
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: featured
 *         required: false
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: author
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: select
 *         required: false
 *         schema:
 *           type: string
 *           example: title,author
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *   post:
 *     summary: Create a new blog post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInput'
 *     responses:
 *       201:
 *         description: Blog post created
 */
router.route("/").get(getAllPosts);
router.route("/").post(authmiddleware, adminmiddleware, createPost);

/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     summary: Get a blog post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: uid
 *         schema:
 *           type: string
 *         description: User ID to check if post is liked
 *     responses:
 *       200:
 *         description: Blog post retrieved
 *   patch:
 *     summary: Edit a blog post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInput'
 *     responses:
 *       200:
 *         description: Blog post updated
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post deleted
 */
router.route("/:postId").get(getPost);
router.route("/:postId").patch(authmiddleware, adminmiddleware, editPost);
router.route("/:postId").delete(authmiddleware, adminmiddleware, deletePost);

/**
 * @swagger
 * /posts/{postId}/likes:
 *   patch:
 *     summary: Like a blog post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post liked successfully
 *   delete:
 *     summary: Unlike a blog post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post unliked successfully
 */
router.route("/:postId/likes").patch(authmiddleware, addLike);
router.route("/:postId/likes").delete(authmiddleware, deleteLike);

module.exports = router;