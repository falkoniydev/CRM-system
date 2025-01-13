import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import { logActivity } from "../utils/logActivity.js";

// Create a new comment
export const createComment = async (req, res) => {
	const { content } = req.body;
	const { taskId } = req.params;

	try {
		const task = await Task.findById(taskId);
		if (!task) {
			return res.status(404).json({ error: "Task not found" });
		}

		const comment = new Comment({
			task: taskId,
			user: req.user.id, // Authenticated user ID
			content,
		});

		await comment.save();

		// console.log("Task ID:", taskId);
		// console.log("User ID from req.user:", req.user.id);
		// console.log("Content:", content);

		// Log yozish
		await logActivity("comment_created", "Task", comment._id, req.user.id);

		res.status(201).json({ message: "Comment added successfully", comment });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Get all comments for a task
export const getComments = async (req, res) => {
	try {
		const { taskId } = req.params;

		const comments = await Comment.find({ task: taskId })
			.populate("user", "name email")
			.sort({ createdAt: -1 });

		res.status(200).json(comments);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Delete a comment
export const deleteComment = async (req, res) => {
	try {
		const { taskId, commentId } = req.params;
		console.log("Task ID:", taskId);
		console.log("Comment ID:", commentId);

		const comment = await Comment.findById(commentId);
		console.log("Found Comment:", comment);

		if (!comment) {
			return res.status(404).json({ error: "Comment not found" });
		}

		if (comment.user.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ error: "Unauthorized to delete this comment" });
		}

		await comment.deleteOne();

		// Log yozish
		await logActivity("comment_deleted", "Task", comment._id, req.user.id);

		res.status(200).json({ message: "Comment deleted successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
};
