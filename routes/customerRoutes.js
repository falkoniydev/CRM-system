/**
 * @swagger
 * tags:
 *   name: Customer Service
 *   description: Mijozlarni boshqarish uchun API service
 */

import express from "express";
import {
	createCustomer,
	getAllCustomers,
	getCustomerById,
	updateCustomer,
	deleteCustomer,
	addNote,
} from "../controllers/customerController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Yangi talaba qo'shish
 *     tags: [Customer Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - education
 *               - source
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Abdullayev Abror"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "abror@example.com"
 *               phone:
 *                 type: string
 *                 pattern: ^\+998[0-9]{9}$
 *                 example: "+998901234567"
 *               education:
 *                 type: object
 *                 required:
 *                   - level
 *                   - institution
 *                   - grade
 *                 properties:
 *                   level:
 *                     type: string
 *                     enum: [school, college, university, working]
 *                     example: "university"
 *                   institution:
 *                     type: string
 *                     example: "TATU"
 *                   grade:
 *                     type: string
 *                     example: "3-kurs"
 *               source:
 *                 type: string
 *                 enum: [instagram, telegram, facebook, website, referral, other]
 *                 example: "instagram"
 *               courses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     course:
 *                       type: string
 *                       description: Kurs ID si
 *                     status:
 *                       type: string
 *                       enum: [active, completed, dropped]
 *                       default: active
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *               payments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     amount:
 *                       type: number
 *                       example: 1000000
 *                     course:
 *                       type: string
 *                       description: Kurs ID si
 *                     type:
 *                       type: string
 *                       enum: [cash, card, transfer]
 *                     status:
 *                       type: string
 *                       enum: [paid, pending, cancelled]
 *                       default: pending
 *               attendance:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                       enum: [present, absent, late]
 *                     course:
 *                       type: string
 *                       description: Kurs ID si
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [passport, diploma, certificate, other]
 *                     number:
 *                       type: string
 *                     url:
 *                       type: string
 *               notes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                     createdBy:
 *                       type: string
 *                       description: User ID
 *     responses:
 *       201:
 *         description: Talaba muvaffaqiyatli ro'yxatga olindi
 *       400:
 *         description: Noto'g'ri ma'lumotlar
 *       403:
 *         description: Ruxsat yo'q
 */
router.post("/", authMiddleware, roleMiddleware(["admin"]), createCustomer);

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Talabalar ro'yxatini olish
 *     tags: [Customer Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sahifa raqami
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Sahifadagi talabalar soni
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Ism, email yoki telefon bo'yicha qidirish
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *         description: Kurs ID si bo'yicha filtrlash
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, dropped]
 *         description: Kurs holati bo'yicha filtrlash
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [paid, pending, cancelled]
 *         description: To'lov holati bo'yicha filtrlash
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Saralash maydoni
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Saralash tartibi
 *     responses:
 *       200:
 *         description: Talabalar ro'yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get("/", authMiddleware, getAllCustomers);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: ID bo'yicha talaba ma'lumotlarini olish
 *     tags: [Customer Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Talaba ID si
 *     responses:
 *       200:
 *         description: Talaba ma'lumotlari
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Talaba topilmadi
 */
router.get("/:id", authMiddleware, getCustomerById);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Talaba ma'lumotlarini yangilash
 *     tags: [Customer Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Talaba ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerUpdate'
 *     responses:
 *       200:
 *         description: Ma'lumotlar yangilandi
 *       404:
 *         description: Talaba topilmadi
 */
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateCustomer);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Talabani o'chirish
 *     tags: [Customer Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Talaba ID si
 *     responses:
 *       200:
 *         description: Talaba o'chirildi
 *       404:
 *         description: Talaba topilmadi
 */
router.delete(
	"/:id",
	authMiddleware,
	roleMiddleware(["admin"]),
	deleteCustomer
);

/**
 * @swagger
 * /api/customers/{id}/notes:
 *   post:
 *     summary: Talabaga izoh qo'shish
 *     tags: [Customer Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Talaba ID si
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
 *                 example: "Darsga kech qoldi"
 *     responses:
 *       200:
 *         description: Izoh qo'shildi
 *       404:
 *         description: Talaba topilmadi
 */
router.post("/:id/notes", authMiddleware, addNote);

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         education:
 *           type: object
 *           properties:
 *             level:
 *               type: string
 *             institution:
 *               type: string
 *             grade:
 *               type: string
 *         courses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               course:
 *                 type: object
 *               status:
 *                 type: string
 *               progress:
 *                 type: number
 *               teacher:
 *                 type: object
 *         payments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *               status:
 *                 type: string
 *         attendance:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               status:
 *                 type: string
 *         notes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               createdBy:
 *                 type: object
 *               createdAt:
 *                 type: string
 *     CustomerUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         education:
 *           type: object
 *           properties:
 *             level:
 *               type: string
 *             institution:
 *               type: string
 *             grade:
 *               type: string
 */

export default router;
