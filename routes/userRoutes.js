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
	uploadAvatar,
} from "../controllers/userController.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PROFILE PHOTO UPLOADING
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Foydalanuvchi profilini yangilash
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
 *     responses:
 *       200:
 *         description: Profil muvaffaqiyatli yangilandi.
 *       400:
 *         description: Ma'lumotlarda xatolik mavjud.
 */
router.put("/profile/:userId", authMiddleware, updateProfile);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AVATAR UPLOAD
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/users/profile/{userId}/avatar:
 *   post:
 *     summary: Foydalanuvchi avatarini yuklash
 *     tags: [User Service]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Foydalanuvchi ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar muvaffaqiyatli yuklandi.
 *       400:
 *         description: Yuklashda xatolik.
 */
router.post(
	"/profile/:userId/avatar",
	authMiddleware,
	upload.single("avatar"),
	uploadAvatar
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPLOAD PROFILE PHOTO
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/users/upload-profile/{userId}:
 *   post:
 *     summary: Foydalanuvchi profil surati yuklash
 *     tags: [User Service]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Foydalanuvchi ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profil surati muvaffaqiyatli yuklandi.
 *       400:
 *         description: Yuklashda xatolik.
 */
router.post(
	"/upload-profile/:userId",
	authMiddleware,
	upload.single("profilePicture"),
	uploadProfilePhoto
);

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
 *       - bearerAuth: [] # Token talab qilinadi
 *     responses:
 *       200:
 *         description: Foydalanuvchilar ro'yxati muvaffaqiyatli qaytarildi.
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
 * /api/users/{id}:
 *   put:
 *     summary: Foydalanuvchini yangilash
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe Updated
 *               email:
 *                 type: string
 *                 example: janedoeupdated@example.com
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: Foydalanuvchi muvaffaqiyatli yangilandi.
 *       404:
 *         description: Foydalanuvchi topilmadi.
 */
router.put(
	"/:id",
	authMiddleware,
	roleMiddleware(["admin"]),
	async (req, res) => {
		try {
			const user = await User.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true,
			});
			if (!user) return res.status(404).json({ error: "User not found" });
			res.json(user);
		} catch (err) {
			res.status(400).json({ error: err.message });
		}
	}
);

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
