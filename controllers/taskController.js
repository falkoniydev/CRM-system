import Task from "../models/Task.js";
import User from "../models/User.js";
import { logActivity } from "../utils/logActivity.js";
import { sendEmail } from "../utils/emailNotifications.js";
import moment from "moment-timezone";

// Create new task
export const createTask = async (req, res) => {
	const { title, description, assignedTo, dueDate } = req.body;

	// Vaqtni Toshkent zonasi bo‘yicha olish
	const createdAt = moment().tz("Asia/Tashkent").toDate();

	try {
		const task = new Task({
			...req.body,
			title,
			description,
			assignedTo,
			dueDate,
			createdAt, // Local vaqt bilan saqlash
			createdBy: req.user.id,
		});
		await task.save();
		await task.populate("assignedTo", "name email role"); // `assignedTo` to'ldiriladi

		// Log yozish
		await logActivity("task_created", "Task", task._id, req.user.id);

		// Email yuborish
		const assignedUser = await User.findById(assignedTo);
		if (assignedUser) {
			const subject = "Yangi vazifa tayinlandi";
			const text = `Sizga yangi vazifa berildi: ${title}\nBatafsil ma'lumot uchun tizimga kiring.`;
			await sendEmail(assignedUser.email, subject, text);
		}

		// Real-time event
		io.emit("taskStatusUpdated", { taskId, status });

		res.status(201).json({
			message: "Task created successfully",
			task,
		});
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

// Get all tasks
export const getAllTasks = async (req, res) => {
	try {
		const {
			status,
			assignedTo,
			sortBy,
			order,
			page = 1,
			limit = 10,
		} = req.query;

		// Filtering
		const filter = {};
		if (status) filter.status = status;
		if (assignedTo) filter.assignedTo = assignedTo;

		// Sorting
		const sortOptions = {};
		if (sortBy) sortOptions[sortBy] = order === "desc" ? -1 : 1;

		// Pagination
		const skip = (page - 1) * limit;

		// Query execution
		const tasks = await Task.find(filter)
			.sort(sortOptions)
			.skip(skip)
			.limit(parseInt(limit))
			.populate("assignedTo", "name email")
			.populate("createdBy", "name email");

		const totalTasks = await Task.countDocuments(filter);

		res.json({
			message: "Tasks retrieved successfully",
			tasks,
			totalTasks,
			page: parseInt(page),
			limit: parseInt(limit),
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Get single task by ID
export const getTaskById = async (req, res) => {
	try {
		const task = await Task.findById(req.params.id).populate(
			"assignedTo createdBy",
			"name email"
		);
		if (!task) return res.status(404).json({ error: "Task not found" });

		if (
			req.user.role === "student" &&
			task.assignedTo.toString() !== req.user.id
		) {
			return res.status(403).json({ error: "Access denied" });
		}

		res.status(200).json(task);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Update task
export const updateTask = async (req, res) => {
	try {
		const task = await Task.findById(req.params.id);
		if (!task) return res.status(404).json({ error: "Task not found" });

		if (
			req.user.role === "student" ||
			(req.user.role === "teacher" && task.createdBy.toString() !== req.user.id)
		) {
			return res.status(403).json({ error: "Access denied" });
		}

		Object.assign(task, req.body);
		await task.save();

		// Log yozish
		await logActivity("task_updated", "Task", task._id, req.user.id);

		res.status(200).json({ message: "Task updated successfully", task });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Delete a task
export const deleteTask = async (req, res) => {
	try {
		const task = await Task.findById(req.params.id);
		if (!task) {
			return res.status(404).json({ error: "Task not found" });
		}

		// Yangi funksiyadan foydalanamiz
		await task.deleteOne();

		// Log yozish
		await logActivity("task_deleted", "Task", task._id, req.user.id);

		// Email yuborish
		const assignedUser = await User.findById(task.assignedTo);
		if (assignedUser) {
			const subject = "Vazifa o'chirildi";
			const text = `Sizga tayinlangan vazifa o'chirildi: ${task.title}`;
			await sendEmail(assignedUser.email, subject, text);
		}

		res.status(200).json({ message: "Task deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
