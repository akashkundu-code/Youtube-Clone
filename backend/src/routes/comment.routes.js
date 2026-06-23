import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT, optionalVerifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Reading comments is public (video pages are public); writing requires auth.
router.route("/:videoId").get(optionalVerifyJWT, getVideoComments);
router.route("/:videoId").post(verifyJWT, addComment);
router.route("/c/:commentId").delete(verifyJWT, deleteComment);
router.route("/c/:commentId").patch(verifyJWT, updateComment);

export default router;
