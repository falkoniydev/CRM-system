/**
 * @swagger
 * tags:
 *   name: User Service
 *   description: Foydalanuvchilarni boshqarish uchun API
 */

import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import {
	uploadProfilePhoto,
	updateProfile,
	getProfilePhoto,
} from "../controllers/userController.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPLOAD PROFILE PHOTO
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/users/{userId}/profile-photo:
 *   post:
 *     summary: Profil rasmini yuklash
 *     tags: [User Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Rasm muvaffaqiyatli yuklandi
 *       400:
 *         description: Xato format yoki rasm yuklanmadi
 *       403:
 *         description: Ruxsat berilmagan
 *       404:
 *         description: Foydalanuvchi topilmadi
 */
router.post(
	"/:userId/profile-photo",
	authMiddleware,
	upload.single("photo"),
	uploadProfilePhoto
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET PROFILE PHOTO
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/users/{userId}/profile-photo:
 *   get:
 *     summary: Profil rasmini olish
 *     tags: [User Service]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profil rasmi
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Rasm topilmadi
 */
router.get("/:userId/profile-photo", getProfilePhoto);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CREATE NEW USER
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Yangi foydalanuvchi yaratish
 *     tags: [User Service]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 example: janedoe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       201:
 *         description: Foydalanuvchi muvaffaqiyatli yaratildi.
 *       400:
 *         description: Ma'lumotlarda xatolik mavjud.
 */
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET ALL USERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Barcha foydalanuvchilarni olish
 *     tags: [User Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Foydalanuvchilar ro'yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 507f1f77bcf86cd799439011
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: john@example.com
 *                   role:
 *                     type: string
 *                     enum: [admin, teacher, student]
 *                     example: student
 *                   profilePicture:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                         example: profile-123.jpg
 *                       originalname:
 *                         type: string
 *                         example: my-photo.jpg
 *                       mimetype:
 *                         type: string
 *                         example: image/jpeg
 *                       size:
 *                         type: number
 *                         example: 1048576
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2024-01-19T12:00:00Z
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2024-01-19T12:00:00Z
 *       401:
 *         description: Token xatosi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Foydalanuvchi admin emas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Admin huquqi kerak
 *       500:
 *         description: Server xatosi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
	try {
		const users = await User.find();
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET SINGLE USER BY ID
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Foydalanuvchini ID orqali olish
 *     tags: [User Service]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Foydalanuvchi ID
 *     responses:
 *       200:
 *         description: Foydalanuvchi topildi.
 *       404:
 *         description: Foydalanuvchi topilmadi.
 */
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPDATE USER BY ID
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/users/{userId}/profile:
 *   put:
 *     summary: Foydalanuvchi profilini yangilash
 *     tags: [User Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Profil muvaffaqiyatli yangilandi
 *       400:
 *         description: Noto'g'ri ma'lumotlar
 *       401:
 *         description: Token xatosi
 *       404:
 *         description: Foydalanuvchi topilmadi
 */
router.put("/:userId/profile", authMiddleware, updateProfile);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DELETE USER BY ID
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Foydalanuvchini o'chirish
 *     tags: [User Service]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Foydalanuvchi ID
 *     responses:
 *       200:
 *         description: Foydalanuvchi muvaffaqiyatli o'chirildi.
 *       404:
 *         description: Foydalanuvchi topilmadi.
 */
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
