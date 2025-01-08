import express from "express";
import {
	createComment,
	getComments,
	deleteComment,
} from "../controllers/commentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a comment
router.post("/:taskId/comments", authMiddleware, createComment);

// Get comments for a task
router.get("/:taskId/comments", authMiddleware, getComments);

// Delete a comment
router.delete("/:taskId/comments/:commentId", authMiddleware, deleteComment);

export default router;
