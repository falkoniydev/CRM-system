/**
 * @swagger
 * tags:
 *   name: Auth Service
 *   description: Foydalanuvchi autentifikatsiyasi uchun API
 */

import express from "express";
import {
	signup,
	verifyEmail,
	login,
	forgotPassword,
	resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SIGNUP - No middleware required
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Foydalanuvchini ro'yxatdan o'tkazish
 *     tags: [Auth Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       201:
 *         description: Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi.
 *       400:
 *         description: Xato yuz berdi yoki email talab qilinadi.
 */
router.post("/signup", signup);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VERIFY
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Emailni tasdiqlash
 *     tags: [Auth Service]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Tasdiqlash uchun token
 *     responses:
 *       200:
 *         description: Email muvaffaqiyatli tasdiqlandi.
 *       400:
 *         description: Token yaroqsiz yoki eskirgan.
 */
router.get("/verify-email", verifyEmail);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LOGIN - No middleware required
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Foydalanuvchini tizimga kirishi
 *     tags: [Auth Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Kirish muvaffaqiyatli amalga oshirildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Foydalanuvchi uchun JWT token.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *       401:
 *         description: Login yoki parol noto'g'ri.
 */
router.post("/login", login);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FORGOT PASSWORD
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Parolni tiklash uchun link yuborish
 *     tags: [Auth Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Parolni tiklash linki yuborildi.
 *       404:
 *         description: Foydalanuvchi topilmadi.
 */
router.post("/forgot-password", forgotPassword);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RESET PASSWORD
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Parolni tiklash
 *     tags: [Auth Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Parol muvaffaqiyatli tiklandi.
 *       400:
 *         description: Token yaroqsiz yoki eskirgan.
 */
router.post("/reset-password", resetPassword);

export default router;
