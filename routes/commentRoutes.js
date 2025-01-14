/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management endpoints
 */

import express from "express";
import {
	createComment,
	getComments,
	deleteComment,
} from "../controllers/commentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a comment
/**
 * @swagger
 * /api/comments/{taskId}/comments:
 *   post:
 *     summary: Create a comment
 *     description: Add a new comment to a task.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the task to add the comment to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentText:
 *                 type: string
 *                 example: This task is very important!
 *             required:
 *               - commentText
 *     responses:
 *       201:
 *         description: Successfully created comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 comment:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     task:
 *                       type: string
 *                     user:
 *                       type: string
 *                     content:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Server error.
 */
router.post("/:taskId/comments", authMiddleware, createComment);

// Get comments for a task
/**
 * @swagger
 * /api/comments/{taskId}/comments:
 *   get:
 *     summary: Get comments for a task
 *     description: Retrieve all comments for a specific task.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the task to retrieve comments for
 *     responses:
 *       200:
 *         description: Successfully retrieved comments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   task:
 *                     type: string
 *                   user:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Server error.
 */
router.get("/:taskId/comments", authMiddleware, getComments);

// Delete a comment
/**
 * @swagger
 * /api/comments/{taskId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     description: Remove a specific comment from a task.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the task the comment belongs to
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the comment to delete
 *     responses:
 *       200:
 *         description: Successfully deleted comment.
 *       404:
 *         description: Comment not found.
 *       500:
 *         description: Server error.
 */
router.delete("/:taskId/comments/:commentId", authMiddleware, deleteComment);

export default router;
