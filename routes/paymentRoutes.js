/**
 * @swagger
 * tags:
 *   name: Payment Service
 *   description: To'lovlarni boshqarish uchun API
 */

import express from "express";
import {
    createPayment,
    getAllPayments,
    getPaymentById,
    updatePaymentStatus,
    addPaymentNote,
    deletePayment
} from "../controllers/paymentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Yangi to'lov yaratish
 *     tags: [Payment Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - courseId
 *               - amount
 *               - type
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Talaba ID si
 *               courseId:
 *                 type: string
 *                 description: Kurs ID si
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 example: 1000000
 *               type:
 *                 type: string
 *                 enum: [cash, card, transfer]
 *               description:
 *                 type: string
 *                 example: "Yanvar oyi uchun to'lov"
 *               paymentMethod:
 *                 type: object
 *                 properties:
 *                   cardNumber:
 *                     type: string
 *                   cardHolder:
 *                     type: string
 *                   transactionId:
 *                     type: string
 *                   checkNumber:
 *                     type: string
 *                   bankDetails:
 *                     type: object
 *                     properties:
 *                       bankName:
 *                         type: string
 *                       accountNumber:
 *                         type: string
 *     responses:
 *       201:
 *         description: To'lov muvaffaqiyatli yaratildi
 *       400:
 *         description: Noto'g'ri ma'lumotlar
 *       404:
 *         description: Talaba yoki kurs topilmadi
 */
router.post("/", authMiddleware, roleMiddleware(["admin", "teacher"]), createPayment);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: To'lovlar ro'yxatini olish
 *     tags: [Payment Service]
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
 *         description: Sahifadagi to'lovlar soni
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Talaba ID si bo'yicha filtrlash
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Kurs ID si bo'yicha filtrlash
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, cancelled, refunded]
 *         description: Status bo'yicha filtrlash
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [cash, card, transfer]
 *         description: To'lov turi bo'yicha filtrlash
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Boshlanish sanasi
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Tugash sanasi
 *     responses:
 *       200:
 *         description: To'lovlar ro'yxati
 */
router.get("/", authMiddleware, roleMiddleware(["admin", "teacher"]), getAllPayments);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: To'lov ma'lumotlarini olish
 *     tags: [Payment Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: To'lov ID si
 *     responses:
 *       200:
 *         description: To'lov ma'lumotlari
 *       404:
 *         description: To'lov topilmadi
 */
router.get("/:id", authMiddleware, getPaymentById);

/**
 * @swagger
 * /api/payments/{id}/status:
 *   patch:
 *     summary: To'lov statusini yangilash
 *     tags: [Payment Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: To'lov ID si
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
 *                 enum: [pending, paid, cancelled, refunded]
 *     responses:
 *       200:
 *         description: To'lov statusi yangilandi
 *       404:
 *         description: To'lov topilmadi
 */
router.patch("/:id/status", authMiddleware, roleMiddleware(["admin"]), updatePaymentStatus);

/**
 * @swagger
 * /api/payments/{id}/notes:
 *   post:
 *     summary: To'lovga izoh qo'shish
 *     tags: [Payment Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: To'lov ID si
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
 *                 example: "To'lov cheki tasdiqlandi"
 *     responses:
 *       200:
 *         description: Izoh qo'shildi
 *       404:
 *         description: To'lov topilmadi
 */
router.post("/:id/notes", authMiddleware, addPaymentNote);

/**
 * @swagger
 * /api/payments/{id}:
 *   delete:
 *     summary: To'lovni o'chirish
 *     tags: [Payment Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: To'lov ID si
 *     responses:
 *       200:
 *         description: To'lov o'chirildi
 *       404:
 *         description: To'lov topilmadi
 */
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deletePayment);

export default router;