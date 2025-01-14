/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Statistikani boshqarish uchun API
 */

import express from "express";
import {
	getTasksOverTime,
	getTaskStatusStats,
	getUserActivityStats,
} from "../controllers/statsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET USER ACTIVITY STATS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/stats/user-activity:
 *   get:
 *     summary: Foydalanuvchi faoliyati statistikasi
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     responses:
 *       200:
 *         description: Foydalanuvchi faoliyati statistikasi muvaffaqiyatli qaytarildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User activity stats retrieved
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       totalTasks:
 *                         type: number
 *                       completedTasks:
 *                         type: number
 *                       pendingTasks:
 *                         type: number
 *       500:
 *         description: Server xatoligi yuz berdi.
 */
router.get("/user-activity", authMiddleware, getUserActivityStats);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET TASK STATUS STATS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/stats/task-status:
 *   get:
 *     summary: Vazifalar holatini statistikasi
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     responses:
 *       200:
 *         description: Vazifalar holati statistikasi muvaffaqiyatli qaytarildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         example: pending
 *                       count:
 *                         type: number
 *                         example: 5
 *       500:
 *         description: Server xatoligi yuz berdi.
 */
router.get("/task-status", authMiddleware, getTaskStatusStats);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET TASKS OVER TIME STATS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/stats/tasks-over-time:
 *   get:
 *     summary: Vaqt bo'yicha vazifalar statistikasi
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     responses:
 *       200:
 *         description: Vaqt bo'yicha vazifalar statistikasi muvaffaqiyatli qaytarildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tasks over time stats retrieved
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: 2025-01-10
 *                       count:
 *                         type: number
 *                         example: 10
 *       500:
 *         description: Server xatoligi yuz berdi.
 */
router.get("/tasks-over-time", authMiddleware, getTasksOverTime);

export default router;
