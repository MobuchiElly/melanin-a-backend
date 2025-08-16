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

router.route("/").get(authmiddleware, adminmiddleware, getComments);
router.route("/:postId").post(authmiddleware, createComment);
router
  .route("/:commentId")
  .get(authmiddleware, adminmiddleware, getComment)
  .delete(authmiddleware, adminmiddleware, deleteComment)
  .patch(authmiddleware, editComment);
router
  .route("/:commentId/approvecomment")
  .patch(authmiddleware, adminmiddleware, approveComment);

module.exports = router;