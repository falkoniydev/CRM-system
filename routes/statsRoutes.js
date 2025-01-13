import express from "express";
import {
	getTasksOverTime,
	getTaskStatusStats,
	getUserActivityStats,
} from "../controllers/statsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Hozirgi foydalanuvchi statistikasi uchun endpoint
router.get("/user-activity", authMiddleware, getUserActivityStats);

// Task status statistikasi
router.get("/task-status", authMiddleware, getTaskStatusStats);

// Tasklar sanasi bo'yicha statistikasi
router.get("/tasks-over-time", authMiddleware, getTasksOverTime);

export default router;
