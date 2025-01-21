// controllers/courseController.js
import Course from "../models/Course.js";
import { logActivity } from "../utils/logActivity.js";

// Create new course
export const createCourse = async (req, res) => {
	try {
		const course = new Course({
			...req.body,
			teachers: Array.isArray(req.body.teachers)
				? req.body.teachers
				: [req.body.teachers],
		});

		await course.save();
		await course.populate("teachers", "name email");

		// Log yozish
		await logActivity(
			"course_created",
			"Course",
			course._id,
			req.user.id,
			`New course created: ${course.name}`
		);

		res.status(201).json({
			message: "Kurs muvaffaqiyatli yaratildi",
			course,
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

// Get all courses
export const getAllCourses = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			search,
			category,
			level,
			teacher,
			isActive = true,
			sortBy = "createdAt",
			order = "desc",
		} = req.query;

		// Filter
		const filter = { isActive: isActive === "true" };

		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
			];
		}

		if (category) filter.category = category;
		if (level) filter.level = level;
		if (teacher) filter.teachers = teacher;

		// Sorting
		const sortOptions = {};
		sortOptions[sortBy] = order === "desc" ? -1 : 1;

		const courses = await Course.find(filter)
			.populate("teachers", "name email")
			.sort(sortOptions)
			.skip((page - 1) * limit)
			.limit(Number(limit));

		const total = await Course.countDocuments(filter);

		res.json({
			courses,
			pagination: {
				total,
				page: Number(page),
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get course by ID
export const getCourseById = async (req, res) => {
	try {
		const course = await Course.findOne({
			_id: req.params.id,
			isActive: true,
		}).populate("teachers", "name email");

		if (!course) {
			return res.status(404).json({ error: "Kurs topilmadi" });
		}

		res.json(course);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Update course
export const updateCourse = async (req, res) => {
	try {
		if (req.body.teachers) {
			req.body.teachers = Array.isArray(req.body.teachers)
				? req.body.teachers
				: [req.body.teachers];
		}

		const course = await Course.findOneAndUpdate(
			{ _id: req.params.id, isActive: true },
			req.body,
			{ new: true, runValidators: true }
		).populate("teachers", "name email");

		if (!course) {
			return res.status(404).json({ error: "Kurs topilmadi" });
		}

		// Log yozish
		await logActivity(
			"course_updated",
			"Course",
			course._id,
			req.user.id,
			`Course updated: ${course.name}`
		);

		res.json({
			message: "Kurs ma'lumotlari yangilandi",
			course,
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

// Delete course (soft delete)
export const deleteCourse = async (req, res) => {
	try {
		const course = await Course.findOneAndUpdate(
			{ _id: req.params.id, isActive: true },
			{ isActive: false },
			{ new: true }
		);

		if (!course) {
			return res.status(404).json({ error: "Kurs topilmadi" });
		}

		// Log yozish
		await logActivity(
			"course_deleted",
			"Course",
			course._id,
			req.user.id,
			`Course deleted: ${course.name}`
		);

		res.json({ message: "Kurs o'chirildi" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Add material to course
export const addMaterial = async (req, res) => {
	try {
		const course = await Course.findOneAndUpdate(
			{ _id: req.params.id, isActive: true },
			{ $push: { materials: req.body } },
			{ new: true, runValidators: true }
		);

		if (!course) {
			return res.status(404).json({ error: "Kurs topilmadi" });
		}

		res.json({
			message: "Materiallar qo'shildi",
			material: course.materials[course.materials.length - 1],
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
