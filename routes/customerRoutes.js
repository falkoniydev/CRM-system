/**
 * @swagger
 * tags:
 *   name: Customer Service
 *   description: Mijozlarni boshqarish uchun API
 */

import express from "express";
import {
	createCustomer,
	getAllCustomers,
	getCustomerById,
	updateCustomer,
	deleteCustomer,
} from "../controllers/customerController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CREATE NEW CUSTOMER (ADMIN ONLY)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Mijoz yaratish
 *     tags: [Customer Service]
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
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *             required:
 *               - name
 *               - email
 *     responses:
 *       201:
 *         description: Mijoz muvaffaqiyatli yaratildi.
 *       400:
 *         description: Xato ma'lumotlar taqdim etilgan.
 *       403:
 *         description: Ruxsat yo'q.
 */
router.post("/", authMiddleware, roleMiddleware(["admin"]), createCustomer);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET ALL CUSTOMERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Barcha mijozlarni olish
 *     tags: [Customer Service]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     responses:
 *       200:
 *         description: Mijozlar ro'yxati.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *       403:
 *         description: Ruxsat yo'q.
 */
router.get(
	"/",
	authMiddleware,
	roleMiddleware(["admin", "teacher"]),
	getAllCustomers
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET SINGLE CUSTOMER - Role-based access
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: ID orqali mijozni olish
 *     tags: [Customer Service]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mijoz ID
 *     responses:
 *       200:
 *         description: Mijoz topildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *       403:
 *         description: Unauthorized access.
 *       404:
 *         description: Mijoz topilmadi.
 */
router.get(
	"/:id",
	authMiddleware,
	async (req, res, next) => {
		if (req.user.role === "student" && req.params.id !== req.user.id) {
			return res
				.status(403)
				.json({ error: "Access denied: Unauthorized user" });
		}
		next();
	},
	getCustomerById
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPDATE CUSTOMER - ADMIN ONLY
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: ID orqali mijozni yangilash
 *     tags: [Customer Service]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mijoz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe Updated
 *               email:
 *                 type: string
 *                 example: johndoeupdated@example.com
 *               phone:
 *                 type: string
 *                 example: "+9876543210"
 *             required:
 *               - name
 *               - email
 *     responses:
 *       200:
 *         description: Mijoz muvaffaqiyatli yangilandi.
 *       403:
 *         description: Unauthorized access.
 *       404:
 *         description: Mijoz topilmadi.
 */
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateCustomer);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DELETE CUSTOMER - ADMIN ONLY
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: ID orqali mijozni o'chirish
 *     tags: [Customer Service]
 *     security:
 *       - bearerAuth: [] # Token talab qilinadi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mijoz ID
 *     responses:
 *       200:
 *         description: Mijoz muvaffaqiyatli o'chirildi.
 *       403:
 *         description: Unauthorized access.
 *       404:
 *         description: Mijoz topilmadi.
 */
router.delete(
	"/:id",
	authMiddleware,
	roleMiddleware(["admin"]),
	deleteCustomer
);

export default router;
