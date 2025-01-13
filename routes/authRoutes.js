import express from "express";
import {
	signup,
	verifyEmail,
	login,
	forgotPassword,
	resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Signup - No middleware required
/**
 * @swagger
 * tags:
 *   name: Auth Service
 *   description: Foydalanuvchi autentifikatsiyasi uchun endpointlar
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: "Foydalanuvchini ro'yxatdan o'tkazish"
 *     tags: [Auth Service]
 *     description: "Yangi foydalanuvchini ro'yxatdan o'tkazish uchun endpoint."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi"
 *       400:
 *         description: "Xatolik"
 */
router.post("/signup", signup);

// Verify
router.get("/verify-email", verifyEmail);

// Login - No middleware required
router.post("/login", login);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.post("/reset-password", resetPassword);

export default router;
