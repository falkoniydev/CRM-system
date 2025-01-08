import Customer from "../models/Customer.js";

// Create new customer
export const createCustomer = async (req, res) => {
	try {
		const customer = new Customer(req.body);
		await customer.save();
		res
			.status(201)
			.json({ message: "Customer created successfully", customer });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

// Get all customers
export const getAllCustomers = async (req, res) => {
	try {
		let customers;
		if (req.user.role === "teacher") {
			// Teacher uchun o'z kursiga bog'langan mijozlarni ko'rish
			customers = await Customer.find({ course: req.user.assignedCourse });
		} else {
			// Admin uchun barcha mijozlarni ko'rish
			customers = await Customer.find();
		}
		res.status(200).json(customers);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Get single customer
export const getCustomerById = async (req, res) => {
	try {
		const customer = await Customer.findById(req.params.id);
		if (!customer) return res.status(404).json({ error: "Customer not found" });

		// Student uchun o'zini tekshirish
		if (
			req.user.role === "student" &&
			customer._id.toString() !== req.user.id
		) {
			return res
				.status(403)
				.json({ error: "Access denied: Unauthorized user" });
		}

		res.status(200).json(customer);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// Update customer
export const updateCustomer = async (req, res) => {
	try {
		const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!customer) return res.status(404).json({ error: "Customer not found" });
		res
			.status(200)
			.json({ message: "Customer updated successfully", customer });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

// Delete customer
export const deleteCustomer = async (req, res) => {
	try {
		const customer = await Customer.findByIdAndDelete(req.params.id);
		if (!customer) return res.status(404).json({ error: "Customer not found" });
		res.status(200).json({ message: "Customer deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
