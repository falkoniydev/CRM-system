/**
 * @swagger
 * tags:
 *   name: Task Management
 *   description: Vazifalarni boshqarish uchun API
 */

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CREATE NEW TASK
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Vazifa yaratish
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete Project
 *               description:
 *                 type: string
 *                 example: Finalize the project documentation
 *               assignedTo:
 *                 type: string
 *                 example: 5f4dcc3b5aa765d61d8327deb882cf99
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-01-20T12:00:00.000Z
 *     responses:
 *       201:
 *         description: Vazifa muvaffaqiyatli yaratildi.
 *       400:
 *         description: Xato ma'lumotlar taqdim etilgan.
 */
router.post(
	"/",
	authMiddleware,
	roleMiddleware(["admin", "teacher"]),
	createTask
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET ALL TASKS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Barcha vazifalarni olish
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     responses:
 *       200:
 *         description: Vazifalar ro'yxati.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   assignedTo:
 *                     type: string
 *                   dueDate:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Ruxsat etilmagan foydalanuvchi.
 */
router.get("/", authMiddleware, getAllTasks);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET SINGLE TASK BY ID
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: ID orqali vazifani olish
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vazifa ID
 *     responses:
 *       200:
 *         description: Vazifa topildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 assignedTo:
 *                   type: string
 *                 dueDate:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Vazifa topilmadi.
 */
router.get("/:id", authMiddleware, getTaskById);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPDATE TASK
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: ID orqali vazifani yangilash
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vazifa ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete Project Updated
 *               description:
 *                 type: string
 *                 example: Update project with new requirements
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-01-25T12:00:00.000Z
 *     responses:
 *       200:
 *         description: Vazifa muvaffaqiyatli yangilandi.
 *       404:
 *         description: Vazifa topilmadi.
 */
router.put(
	"/:id",
	authMiddleware,
	roleMiddleware(["admin", "teacher"]),
	updateTask
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DELETE TASK
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: ID orqali vazifani o'chirish
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vazifa ID
 *     responses:
 *       200:
 *         description: Vazifa muvaffaqiyatli o'chirildi.
 *       404:
 *         description: Vazifa topilmadi.
 */
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteTask);

export default router;
