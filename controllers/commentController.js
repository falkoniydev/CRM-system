import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import { logActivity } from "../utils/logActivity.js";

// Create comment
export const createComment = async (req, res) => {
	try {
		const { content } = req.body;
		const { taskId } = req.params;

		// Content validatsiyasi
		if (!content || content.trim().length === 0) {
			return res.status(400).json({ error: "Izoh matnini kiriting" });
		}

		// Task mavjudligini tekshirish
		const task = await Task.findOne({ _id: taskId, isActive: true });
		if (!task) {
			return res.status(404).json({ error: "Vazifa topilmadi" });
		}

		const comment = new Comment({
			task: taskId,
			user: req.user.id,
			content: content.trim(),
		});

		await comment.save();
		await comment.populate("user", "name email");

		// Log yozish
		await logActivity("comment_created", "Task", taskId, req.user.id);

		res.status(201).json({
			message: "Izoh qo'shildi",
			comment,
		});
	} catch (error) {
		console.error("Izoh yaratishda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};

// Get comments
export const getComments = async (req, res) => {
	try {
		const { taskId } = req.params;
		const { sort = "desc", limit = 50, skip = 0 } = req.query;

		// Task mavjudligini tekshirish
		const task = await Task.findOne({ _id: taskId, isActive: true });
		if (!task) {
			return res.status(404).json({ error: "Vazifa topilmadi" });
		}

		// Izohlarni olish
		const comments = await Comment.find({
			task: taskId,
			isActive: true,
		})
			.populate("user", "name email")
			.sort({ createdAt: sort === "desc" ? -1 : 1 })
			.skip(Number(skip))
			.limit(Number(limit));

		const total = await Comment.countDocuments({
			task: taskId,
			isActive: true,
		});

		res.json({
			comments,
			pagination: {
				total,
				limit: Number(limit),
				skip: Number(skip),
			},
		});
	} catch (error) {
		console.error("Izohlarni olishda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};

// Delete comment
export const deleteComment = async (req, res) => {
	try {
		const { taskId, commentId } = req.params;

		const comment = await Comment.findOne({
			_id: commentId,
			task: taskId,
			isActive: true,
		});

		if (!comment) {
			return res.status(404).json({ error: "Izoh topilmadi" });
		}

		// Faqat izoh egasi yoki admin o'chira oladi
		if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
			return res
				.status(403)
				.json({ error: "Bu amalni bajarish uchun huquq yo'q" });
		}

		// Soft delete
		comment.isActive = false;
		await comment.save();

		// Log yozish
		await logActivity("comment_deleted", "Task", taskId, req.user.id);

		res.json({ message: "Izoh o'chirildi" });
	} catch (error) {
		console.error("Izohni o'chirishda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};

// Update comment
export const updateComment = async (req, res) => {
	try {
		const { commentId } = req.params;
		const { content } = req.body;

		if (!content || content.trim().length === 0) {
			return res.status(400).json({ error: "Izoh matnini kiriting" });
		}

		const comment = await Comment.findOne({
			_id: commentId,
			isActive: true,
		});

		if (!comment) {
			return res.status(404).json({ error: "Izoh topilmadi" });
		}

		if (comment.user.toString() !== req.user.id) {
			return res
				.status(403)
				.json({ error: "Bu amalni bajarish uchun huquq yo'q" });
		}

		comment.content = content.trim();
		comment.isEdited = true;
		await comment.save();

		await logActivity("comment_updated", "Task", comment.task, req.user.id);

		res.json({
			message: "Izoh yangilandi",
			comment,
		});
	} catch (error) {
		console.error("Izohni yangilashda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};
