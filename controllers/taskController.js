// controllers/taskController.js
import Task from "../models/Task.js";
import User from "../models/User.js";
import { logActivity } from "../utils/logActivity.js";
import { sendEmail } from "../utils/emailNotifications.js";

// Create new task
export const createTask = async (req, res) => {
	try {
		const { title, description, assignedTo, dueDate, time, priority, status } =
			req.body;

		// Tayinlangan userni tekshirish
		const assignedUser = await User.findById(assignedTo);
		if (!assignedUser) {
			return res
				.status(404)
				.json({ error: "Tayinlanadigan foydalanuvchi topilmadi" });
		}

		// DueDate validatsiyasi
		let parsedDate;
		try {
			parsedDate = new Date(dueDate);
			if (isNaN(parsedDate.getTime())) {
				return res
					.status(400)
					.json({ error: "Sanani to'g'ri formatda kiriting (YYYY-MM-DD)" });
			}
		} catch (error) {
			return res
				.status(400)
				.json({ error: "Sanani to'g'ri formatda kiriting (YYYY-MM-DD)" });
		}

		// Time validatsiyasi
		const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
		if (!timeRegex.test(time)) {
			return res
				.status(400)
				.json({ error: "Vaqtni to'g'ri formatda kiriting (HH:mm)" });
		}

		const task = new Task({
			title,
			description,
			assignedTo,
			status: status || "pending",
			priority: priority || "medium",
			dueDate: {
				date: parsedDate,
				time,
			},
			createdBy: req.user.id,
		});

		await task.save();
		await task.populate([
			{ path: "assignedTo", select: "name email" },
			{ path: "createdBy", select: "name email" },
		]);

		// Log yozish
		await logActivity("task_created", "Task", task._id, req.user.id);

		// Email yuborish
		const subject = "Yangi vazifa tayinlandi";
		const text = `Sizga yangi vazifa berildi: ${title}\nMuddat: ${dueDate} ${time}\nBatafsil ma'lumot uchun tizimga kiring.`;
		await sendEmail(assignedUser.email, subject, text);

		res.status(201).json({
			message: "Vazifa muvaffaqiyatli yaratildi",
			task,
		});
	} catch (error) {
		console.error("Vazifa yaratishda xatolik:", error);
		res.status(400).json({ error: error.message });
	}
};

// Get all tasks
export const getAllTasks = async (req, res) => {
	try {
		const {
			status,
			assignedTo,
			priority,
			sortBy = "createdAt",
			order = "desc",
			page = 1,
			limit = 10,
			search,
		} = req.query;

		// Filtering
		const filter = { isActive: true };
		if (status) filter.status = status;
		if (assignedTo) filter.assignedTo = assignedTo;
		if (priority) filter.priority = priority;
		if (search) {
			filter.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
			];
		}

		// Student faqat o'ziga tayinlangan vazifalarni ko'rishi mumkin
		if (req.user.role === "student") {
			filter.assignedTo = req.user.id;
		}

		// Sorting
		const sortOptions = {};
		sortOptions[sortBy] = order === "desc" ? -1 : 1;

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
			message: "Vazifalar ro'yxati",
			tasks,
			pagination: {
				total: totalTasks,
				page: parseInt(page),
				pages: Math.ceil(totalTasks / limit),
				limit: parseInt(limit),
			},
		});
	} catch (error) {
		console.error("Vazifalarni olishda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};

// Get task by ID
export const getTaskById = async (req, res) => {
	try {
		const task = await Task.findOne({
			_id: req.params.id,
			isActive: true,
		}).populate([
			{ path: "assignedTo", select: "name email" },
			{ path: "createdBy", select: "name email" },
		]);

		if (!task) {
			return res.status(404).json({ error: "Vazifa topilmadi" });
		}

		// Student faqat o'ziga tayinlangan vazifani ko'ra oladi
		if (
			req.user.role === "student" &&
			task.assignedTo._id.toString() !== req.user.id
		) {
			return res.status(403).json({ error: "Ruxsat berilmagan" });
		}

		res.json(task);
	} catch (error) {
		console.error("Vazifani olishda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};

// Update task
export const updateTask = async (req, res) => {
	try {
		const { title, description, assignedTo, status, priority, dueDate, time } =
			req.body;

		// Avval taskni topamiz
		const task = await Task.findOne({ _id: req.params.id, isActive: true });
		if (!task) {
			return res.status(404).json({ error: "Vazifa topilmadi" });
		}

		// Ruxsatlarni tekshirish
		if (
			req.user.role === "student" ||
			(req.user.role === "teacher" && task.createdBy.toString() !== req.user.id)
		) {
			return res.status(403).json({ error: "Ruxsat berilmagan" });
		}

		// AssignedTo user mavjudligini tekshirish
		if (assignedTo) {
			const assignedUser = await User.findById(assignedTo);
			if (!assignedUser) {
				return res
					.status(404)
					.json({ error: "Tayinlanadigan foydalanuvchi topilmadi" });
			}
		}

		// Sana va vaqtni tekshirish
		if (dueDate || time) {
			if (dueDate) {
				const parsedDate = new Date(dueDate);
				if (isNaN(parsedDate.getTime())) {
					return res
						.status(400)
						.json({ error: "Sanani to'g'ri formatda kiriting (YYYY-MM-DD)" });
				}
				task.dueDate.date = parsedDate;
			}

			if (time) {
				const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
				if (!timeRegex.test(time)) {
					return res
						.status(400)
						.json({ error: "Vaqtni to'g'ri formatda kiriting (HH:mm)" });
				}
				task.dueDate.time = time;
			}
		}

		// Boshqa fieldlarni yangilash
		if (title) task.title = title;
		if (description) task.description = description;
		if (assignedTo) task.assignedTo = assignedTo;
		if (status) task.status = status;
		if (priority) task.priority = priority;

		await task.save();

		// Populate qilib to'liq ma'lumotlar bilan qaytarish
		await task.populate([
			{ path: "assignedTo", select: "name email" },
			{ path: "createdBy", select: "name email" },
		]);

		await logActivity("task_updated", "Task", task._id, req.user.id);

		// Email yuborish
		if (task.assignedTo) {
			const assignedUser = await User.findById(task.assignedTo);
			if (assignedUser && assignedUser.email) {
				const subject = "Vazifa yangilandi";
				const text = `"${task.title}" vazifasida o'zgarishlar bo'ldi.\nIltimos, tizimga kirib tekshiring.`;
				await sendEmail(assignedUser.email, subject, text);
			}
		}

		res.json({
			message: "Vazifa muvaffaqiyatli yangilandi",
			task,
		});
	} catch (error) {
		console.error("Vazifani yangilashda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};

// Delete task
export const deleteTask = async (req, res) => {
	try {
		const task = await Task.findOne({ _id: req.params.id, isActive: true });

		if (!task) {
			return res.status(404).json({ error: "Vazifa topilmadi" });
		}

		// Soft delete
		task.isActive = false;
		await task.save();

		// Log yozish
		await logActivity("task_deleted", "Task", task._id, req.user.id);

		res.json({ message: "Vazifa muvaffaqiyatli o'chirildi" });
	} catch (error) {
		console.error("Vazifani o'chirishda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};

// Update task status
export const updateTaskStatus = async (req, res) => {
	try {
		const { status } = req.body;
		const task = await Task.findOne({ _id: req.params.id, isActive: true });

		if (!task) {
			return res.status(404).json({ error: "Vazifa topilmadi" });
		}

		// Status validatsiyasi
		if (!["pending", "in-progress", "completed"].includes(status)) {
			return res.status(400).json({ error: "Noto'g'ri status" });
		}

		// Student faqat o'ziga tayinlangan vazifa statusini o'zgartira oladi
		if (
			req.user.role === "student" &&
			task.assignedTo.toString() !== req.user.id
		) {
			return res.status(403).json({ error: "Ruxsat berilmagan" });
		}

		task.status = status;
		await task.save();

		await logActivity("task_status_updated", "Task", task._id, req.user.id);

		res.json({
			message: "Vazifa statusi yangilandi",
			task,
		});
	} catch (error) {
		console.error("Status yangilashda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};
