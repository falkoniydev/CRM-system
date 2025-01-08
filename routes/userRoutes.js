import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Create new user (Admin only)
router.post(
	"/",
	authMiddleware,
	roleMiddleware(["admin"]),
	async (req, res) => {
		try {
			const user = new User(req.body);
			await user.save();
			res.status(201).json(user);
		} catch (err) {
			res.status(400).json({ error: err.message });
		}
	}
);

// Get all users (Admin only)
router.get("/", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
	try {
		const users = await User.find();
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Get single user by ID (Admin only)
router.get(
	"/:id",
	authMiddleware,
	roleMiddleware(["admin"]),
	async (req, res) => {
		try {
			const user = await User.findById(req.params.id);
			if (!user) return res.status(404).json({ error: "User not found" });
			res.json(user);
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	}
);

// Update user by ID (Admin only)
router.put(
	"/:id",
	authMiddleware,
	roleMiddleware(["admin"]),
	async (req, res) => {
		try {
			const user = await User.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true,
			});
			if (!user) return res.status(404).json({ error: "User not found" });
			res.json(user);
		} catch (err) {
			res.status(400).json({ error: err.message });
		}
	}
);

// Delete user by ID (Admin only)
router.delete(
	"/:id",
	authMiddleware,
	roleMiddleware(["admin"]),
	async (req, res) => {
		try {
			const user = await User.findByIdAndDelete(req.params.id);
			if (!user) return res.status(404).json({ error: "User not found" });
			res.json({ message: "User deleted successfully" });
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
	}
);

export default router;
