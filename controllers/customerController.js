import Customer from "../models/Customer.js";
import { logActivity } from "../utils/logActivity.js";

// Create new customer
export const createCustomer = async (req, res) => {
	try {
		const { email, phone } = req.body;

		// Email va telefon raqam band emasligini tekshirish
		const existingCustomer = await Customer.findOne({
			$or: [{ email }, { phone }],
		});

		if (existingCustomer) {
			let field = existingCustomer.email === email ? "email" : "phone";
			return res.status(400).json({
				error: `Bu ${field} allaqachon ro'yxatdan o'tgan`,
			});
		}

		const customer = new Customer({
			...req.body,
			createdBy: req.user.id,
		});

		await customer.save();
		await customer.populate([
			{ path: "courses.course", select: "name" },
			{ path: "courses.teacher", select: "name" },
		]);

		// Log yozish
		await logActivity(
			"customer_created",
			"Customer",
			customer._id,
			req.user.id,
			`New student registered: ${customer.name}`
		);

		res.status(201).json({
			message: "Talaba muvaffaqiyatli qo'shildi",
			customer,
		});
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

// Get all customers with filtering and pagination
export const getAllCustomers = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			search,
			course,
			status,
			sortBy = "createdAt",
			order = "desc",
			paymentStatus,
		} = req.query;

		// Filter
		const filter = { isActive: true };

		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
				{ phone: { $regex: search, $options: "i" } },
			];
		}

		if (course) {
			filter["courses.course"] = course;
		}

		if (status) {
			filter["courses.status"] = status;
		}

		if (paymentStatus) {
			filter["payments.status"] = paymentStatus;
		}

		// Teacher faqat o'z kursidagi talabalarni ko'radi
		if (req.user.role === "teacher") {
			filter["courses.teacher"] = req.user.id;
		}

		// Sort
		const sortOptions = {};
		sortOptions[sortBy] = order === "desc" ? -1 : 1;

		const customers = await Customer.find(filter)
			.populate("courses.course", "name")
			.populate("courses.teacher", "name")
			.sort(sortOptions)
			.skip((page - 1) * limit)
			.limit(parseInt(limit));

		const total = await Customer.countDocuments(filter);

		res.status(200).json({
			customers,
			pagination: {
				total,
				page: parseInt(page),
				pages: Math.ceil(total / limit),
			},
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Get single customer
export const getCustomerById = async (req, res) => {
	try {
		const customer = await Customer.findOne({
			_id: req.params.id,
			isActive: true,
		})
			.populate("courses.course", "name")
			.populate("courses.teacher", "name")
			.populate("notes.createdBy", "name");

		if (!customer) {
			return res.status(404).json({ error: "Talaba topilmadi" });
		}

		// Student faqat o'zining ma'lumotlarini ko'ra oladi
		if (
			req.user.role === "student" &&
			customer._id.toString() !== req.user.id
		) {
			return res.status(403).json({ error: "Ruxsat berilmagan" });
		}

		res.status(200).json(customer);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Update customer
export const updateCustomer = async (req, res) => {
	try {
		const { email, phone } = req.body;

		// Email/phone band emasligini tekshirish
		if (email || phone) {
			const existingCustomer = await Customer.findOne({
				_id: { $ne: req.params.id },
				$or: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
			});

			if (existingCustomer) {
				let field = existingCustomer.email === email ? "email" : "phone";
				return res.status(400).json({
					error: `Bu ${field} allaqachon ro'yxatdan o'tgan`,
				});
			}
		}

		const customer = await Customer.findOneAndUpdate(
			{ _id: req.params.id, isActive: true },
			req.body,
			{ new: true, runValidators: true }
		).populate([
			{ path: "courses.course", select: "name" },
			{ path: "courses.teacher", select: "name" },
		]);

		if (!customer) {
			return res.status(404).json({ error: "Talaba topilmadi" });
		}

		// Log yozish
		await logActivity(
			"customer_updated",
			"Customer",
			customer._id,
			req.user.id,
			`Student updated: ${customer.name}`
		);

		res.status(200).json({
			message: "Talaba ma'lumotlari yangilandi",
			customer,
		});
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

// Delete customer (soft delete)
export const deleteCustomer = async (req, res) => {
	try {
		const customer = await Customer.findOneAndUpdate(
			{ _id: req.params.id, isActive: true },
			{ isActive: false },
			{ new: true }
		);

		if (!customer) {
			return res.status(404).json({ error: "Talaba topilmadi" });
		}

		// Log yozish
		await logActivity(
			"customer_deleted",
			"Customer",
			customer._id,
			req.user.id,
			`Student deleted: ${customer.name}`
		);

		res.status(200).json({
			message: "Talaba o'chirildi",
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Add note to customer
export const addNote = async (req, res) => {
	try {
		const { content } = req.body;

		const customer = await Customer.findOneAndUpdate(
			{ _id: req.params.id, isActive: true },
			{
				$push: {
					notes: {
						content,
						createdBy: req.user.id,
					},
				},
			},
			{ new: true }
		).populate("notes.createdBy", "name");

		if (!customer) {
			return res.status(404).json({ error: "Talaba topilmadi" });
		}

		res.status(200).json({
			message: "Izoh qo'shildi",
			note: customer.notes[customer.notes.length - 1],
		});
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};
