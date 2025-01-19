/**
 * @swagger
 * tags:
 *   name: Task Management
 *   description: Vazifalarni boshqarish uchun API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - assignedTo
 *         - dueDate
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           example: Proyektni yakunlash
 *         description:
 *           type: string
 *           maxLength: 1000
 *           example: Barcha modullarni test qilish va dokumentatsiya yozish
 *         assignedTo:
 *           type: string
 *           format: uuid
 *           example: 5f7c3b3f9d3e2a1b3c9d8e7f
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *           default: pending
 *           example: pending
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           default: medium
 *           example: medium
 *         dueDate:
 *           type: object
 *           properties:
 *             date:
 *               type: string
 *               format: date
 *               example: 2025-01-20
 *             time:
 *               type: string
 *               pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               example: "14:30"
 */

import express from "express";
import {
	createTask,
	getAllTasks,
	getTaskById,
	updateTask,
	deleteTask,
	updateTaskStatus,
} from "../controllers/taskController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import { fileUpload, handleFileUploadError } from "../utils/fileUpload.js";
import { uploadFile } from "../controllers/fileController.js";

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CREATE NEW TASK
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Yangi vazifa yaratish
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - assignedTo
 *               - dueDate
 *               - time
 *             properties:
 *               title:
 *                 type: string
 *                 example: Proyektni yakunlash
 *               description:
 *                 type: string
 *                 example: Barcha modullarni test qilish va dokumentatsiya yozish
 *               assignedTo:
 *                 type: string
 *                 example: 678d13620686293b4aeb259
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 default: pending
 *                 example: pending
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *                 example: medium
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-20
 *               time:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "14:30"
 *     responses:
 *       201:
 *         description: Vazifa muvaffaqiyatli yaratildi
 *       400:
 *         description: Noto'g'ri ma'lumotlar
 *       401:
 *         description: Avtorizatsiya xatosi
 *       403:
 *         description: Huquqlar yetarli emas
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
 *     summary: Vazifalar ro'yxatini olish
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Vazifalar ro'yxati
 *       401:
 *         description: Avtorizatsiya xatosi
 *
 */
router.get("/", authMiddleware, getAllTasks);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET SINGLE TASK BY ID
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Vazifani ID bo'yicha olish
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vazifa ma'lumotlari
 *       404:
 *         description: Vazifa topilmadi
 */
router.get("/:id", authMiddleware, getTaskById);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPDATE TASK
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Vazifani yangilash
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: []
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
 *                 example: Proyektni yangilash
 *               description:
 *                 type: string
 *                 example: Vazifa tavsifi yangilandi
 *               assignedTo:
 *                 type: string
 *                 example: 678d13620686293b4aeb259
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 example: in-progress
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: high
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-20
 *               time:
 *                 type: string
 *                 pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "14:30"
 *     responses:
 *       200:
 *         description: Vazifa muvaffaqiyatli yangilandi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vazifa muvaffaqiyatli yangilandi
 *                 task:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     assignedTo:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     status:
 *                       type: string
 *                     priority:
 *                       type: string
 *                     dueDate:
 *                       type: string
 *                     time:
 *                       type: string
 *                     createdBy:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Noto'g'ri ma'lumotlar
 *       401:
 *         description: Token xatosi
 *       403:
 *         description: Ruxsat berilmagan
 *       404:
 *         description: Vazifa topilmadi
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
 *     summary: Vazifani o'chirish
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vazifa o'chirildi
 *       404:
 *         description: Vazifa topilmadi
 */
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteTask);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPDATE TASK STATUS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Vazifa statusini yangilash
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *     responses:
 *       200:
 *         description: Status yangilandi
 *       400:
 *         description: Noto'g'ri status
 *       404:
 *         description: Vazifa topilmadi
 */
router.patch("/:id/status", authMiddleware, updateTaskStatus);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ATTACH FILES TO TASK
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/tasks/{taskId}/attachments:
 *   post:
 *     summary: Vazifaga fayl yuklash
 *     tags: [Task Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Fayl yuklandi
 *       400:
 *         description: Fayl yuklanmadi
 *       404:
 *         description: Vazifa topilmadi
 */
router.post(
	"/:taskId/attachments",
	authMiddleware,
	fileUpload.single("file"),
	handleFileUploadError,
	uploadFile
);

export default router;
