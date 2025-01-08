import express from "express";
import {
	createTask,
	getAllTasks,
	getTaskById,
	updateTask,
	deleteTask,
} from "../controllers/taskController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Create new task
router.post(
	"/",
	authMiddleware,
	roleMiddleware(["admin", "teacher"]),
	createTask
);

// Get all tasks
router.get("/", authMiddleware, getAllTasks);

// Get single task by ID
router.get("/:id", authMiddleware, getTaskById);

// Update task
router.put(
	"/:id",
	authMiddleware,
	roleMiddleware(["admin", "teacher"]),
	updateTask
);

// Delete task
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteTask);

export default router;
