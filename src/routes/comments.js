const express = require("express");
const {
  getComments,
  createComment,
  deleteComment,
  editComment,
  getComment,
  approveComment,
} = require("../controllers/comments");
const adminmiddleware = require("../middleware/adminmiddleware");
const authmiddleware = require("../middleware/authmiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Blog comments management and user interactions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         writer:
 *           type: string
 *         createdBy:
 *           type: string
 *         blogPostId:
 *           type: string
 *         approved:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CommentInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           example: "This is a comment"
 *     ApproveCommentInput:
 *       type: object
 *       required:
 *         - approved
 *       properties:
 *         approved:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments (admin only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: approved
 *         schema:
 *           type: boolean
 *         description: Filter by approval status
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Comment'
 *                     commentCount:
 *                       type: integer
 */
router.route("/").get(authmiddleware, adminmiddleware, getComments);

/**
 * @swagger
 * /comments/{postId}:
 *   post:
 *     summary: Add a new comment to a post
 *     tags: [Comments]
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
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       201:
 *         description: Comment created successfully
 */
router.route("/:postId").post(authmiddleware, createComment);

/**
 * @swagger
 * /comments/{commentId}:
 *   get:
 *     summary: Get a single comment by ID (admin only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment retrieved
 */
router.route("/:commentId").get(authmiddleware, adminmiddleware, getComment);

/**
 *   patch:
 *     summary: Edit a comment (owner only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       200:
 *         description: Comment updated
 */
router.route("/:commentId").patch(authmiddleware, editComment);

/**
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
router.route("/:commentId").delete(authmiddleware, adminmiddleware, deleteComment);

/**
 * @swagger
 * /comments/{commentId}/approvecomment:
 *   patch:
 *     summary: Approve or reject a comment (admin only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApproveCommentInput'
 *     responses:
 *       200:
 *         description: Comment approval updated
 */
router.route("/:commentId/approvecomment").patch(authmiddleware, adminmiddleware, approveComment);

module.exports = router;