// routes/commentRoutes.js

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Vazifalar uchun izohlarni boshqarish
 */

import express from "express";
import {
	createComment,
	getComments,
	deleteComment,
	updateComment,
} from "../controllers/commentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/comments/{taskId}/comments:
 *   post:
 *     summary: Vazifaga izoh qo'shish
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vazifa ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 example: Bu vazifa muhim, albatta tugatish kerak!
 *     responses:
 *       201:
 *         description: Izoh muvaffaqiyatli qo'shildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Izoh qo'shildi
 *                 comment:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     task:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     content:
 *                       type: string
 *                     isEdited:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Noto'g'ri ma'lumotlar
 *       404:
 *         description: Vazifa topilmadi
 *       500:
 *         description: Server xatosi
 */
router.post("/:taskId/comments", authMiddleware, createComment);

/**
 * @swagger
 * /api/comments/{taskId}/comments:
 *   get:
 *     summary: Vazifa uchun izohlarni olish
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vazifa ID si
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         default: desc
 *         description: Saralash tartibi
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 50
 *         description: Bir sahifadagi izohlar soni
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         default: 0
 *         description: O'tkazib yuborish uchun izohlar soni
 *     responses:
 *       200:
 *         description: Izohlar muvaffaqiyatli olindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       task:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       content:
 *                         type: string
 *                       isEdited:
 *                         type: boolean
 *                       replies:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Comment'
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     skip:
 *                       type: integer
 *       404:
 *         description: Vazifa topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/:taskId/comments", authMiddleware, getComments);

/**
 * @swagger
 * /api/comments/{taskId}/comments/{commentId}:
 *   put:
 *     summary: Izohni yangilash
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vazifa ID si
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Izoh ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Yangilangan izoh matni
 *     responses:
 *       200:
 *         description: Izoh muvaffaqiyatli yangilandi
 *       400:
 *         description: Noto'g'ri ma'lumotlar
 *       403:
 *         description: Huquq yo'q
 *       404:
 *         description: Izoh topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/:taskId/comments/:commentId", authMiddleware, updateComment);

/**
 * @swagger
 * /api/comments/{taskId}/comments/{commentId}:
 *   delete:
 *     summary: Izohni o'chirish
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vazifa ID si
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Izoh ID si
 *     responses:
 *       200:
 *         description: Izoh muvaffaqiyatli o'chirildi
 *       403:
 *         description: Huquq yo'q
 *       404:
 *         description: Izoh topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/:taskId/comments/:commentId", authMiddleware, deleteComment);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - task
 *         - user
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: Izoh ID si
 *         task:
 *           type: string
 *           description: Vazifa ID si
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         content:
 *           type: string
 *           description: Izoh matni
 *         isEdited:
 *           type: boolean
 *           description: Izoh tahrirlanganmi
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
