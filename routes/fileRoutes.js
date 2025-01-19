/**
 * @swagger
 * tags:
 *   name: File Management
 *   description: Fayllarni boshqarish uchun API
 */

import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
	uploadFile,
	downloadFile,
	deleteFile,
	getFileList,
} from "../controllers/fileController.js";

// Fayl yuklashni sozlash (10 MB limit)
const upload = multer({
	limits: {
		fileSize: 10 * 1024 * 1024, // 10 MB
	},
});

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FILE DONWLAODING
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/files/download/{taskId}/{filename}:
 *   get:
 *     summary: Faylni yuklab olish
 *     tags: [File Management]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fayl tegishli bo'lgan task ID
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Yuklab olinadigan fayl nomi
 *     responses:
 *       200:
 *         description: Fayl muvaffaqiyatli yuklandi.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Fayl topilmadi.
 *       500:
 *         description: Server xatoligi.
 */
router.get("/download/:taskId/:filename", downloadFile);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DELETE FILE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/files/delete/{taskId}/{filename}:
 *   delete:
 *     summary: Faylni o'chirish
 *     tags: [File Management]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Fayl tegishli bo'lgan task ID
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: O'chiriladigan fayl nomi
 *     responses:
 *       200:
 *         description: Fayl muvaffaqiyatli o'chirildi.
 *       404:
 *         description: Fayl topilmadi.
 *       500:
 *         description: Server xatoligi.
 */
router.delete("/delete/:taskId/:filename", deleteFile);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET FILE LIST
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/files/list/{taskId}:
 *   get:
 *     summary: Task uchun yuklangan fayllar ro'yxatini olish
 *     tags: [File Management]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Fayllar ro'yxati muvaffaqiyatli qaytarildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   filename:
 *                     type: string
 *                   size:
 *                     type: number
 *                   contentType:
 *                     type: string
 *       404:
 *         description: Task yoki fayllar topilmadi.
 *       500:
 *         description: Server xatoligi.
 */
router.get("/list/:taskId", authMiddleware, getFileList);

export default router;
