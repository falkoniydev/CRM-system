/**
 * @swagger
 * tags:
 *   name: Course Service
 *   description: Kurslarni boshqarish uchun API
 */

import express from "express";
import {
	createCourse,
	getAllCourses,
	getCourseById,
	updateCourse,
	deleteCourse,
	addMaterial,
} from "../controllers/courseController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Yangi kurs yaratish
 *     tags: [Course Service]
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
 *               - description
 *               - price
 *               - duration
 *               - category
 *               - teachers
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Web Development"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 example: "Frontend va Backend dasturlash asoslari"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 1000000
 *               duration:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: number
 *                     minimum: 1
 *                     example: 3
 *                   unit:
 *                     type: string
 *                     enum: [day, week, month]
 *                     example: month
 *               category:
 *                 type: string
 *                 enum: [programming, design, marketing, business, language, other]
 *                 example: programming
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: beginner
 *               schedule:
 *                 type: object
 *                 properties:
 *                   daysOfWeek:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                   timeStart:
 *                     type: string
 *                     example: "14:00"
 *                   timeEnd:
 *                     type: string
 *                     example: "17:00"
 *               maxStudents:
 *                 type: number
 *                 minimum: 1
 *                 example: 20
 *               teachers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011"]
 *     responses:
 *       201:
 *         description: Kurs muvaffaqiyatli yaratildi
 *       400:
 *         description: Noto'g'ri ma'lumotlar
 *       401:
 *         description: Token xatosi
 *       403:
 *         description: Huquq yo'q
 */
router.post("/", authMiddleware, roleMiddleware(["admin"]), createCourse);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Kurslar ro'yxatini olish
 *     tags: [Course Service]
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
 *         description: Sahifadagi kurslar soni
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Nom yoki tavsif bo'yicha qidirish
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [programming, design, marketing, business, language, other]
 *         description: Kategoriya bo'yicha filtrlash
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Daraja bo'yicha filtrlash
 *       - in: query
 *         name: teacher
 *         schema:
 *           type: string
 *         description: O'qituvchi ID si bo'yicha filtrlash
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Faol/nofaol kurslarni filtrlash
 *     responses:
 *       200:
 *         description: Kurslar ro'yxati
 *       401:
 *         description: Token xatosi
 */
router.get("/", authMiddleware, getAllCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Kurs ma'lumotlarini olish
 *     tags: [Course Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kurs ID si
 *     responses:
 *       200:
 *         description: Kurs ma'lumotlari
 *       404:
 *         description: Kurs topilmadi
 */
router.get("/:id", authMiddleware, getCourseById);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Kursni yangilash
 *     tags: [Course Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kurs ID si
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Kurs yangilandi
 *       404:
 *         description: Kurs topilmadi
 */
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Kursni o'chirish
 *     tags: [Course Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kurs ID si
 *     responses:
 *       200:
 *         description: Kurs o'chirildi
 *       404:
 *         description: Kurs topilmadi
 */
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteCourse);

/**
 * @swagger
 * /api/courses/{id}/materials:
 *   post:
 *     summary: Kursga material qo'shish
 *     tags: [Course Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kurs ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: "1-dars materiallari"
 *               description:
 *                 type: string
 *                 example: "HTML asoslari bo'yicha materiallar"
 *               type:
 *                 type: string
 *                 enum: [video, document, link, other]
 *                 example: document
 *               url:
 *                 type: string
 *                 example: "https://example.com/materials/lesson1"
 *     responses:
 *       200:
 *         description: Material qo'shildi
 *       404:
 *         description: Kurs topilmadi
 */
router.post(
	"/:id/materials",
	authMiddleware,
	roleMiddleware(["admin", "teacher"]),
	addMaterial
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *         price:
 *           type: number
 *           minimum: 0
 *         duration:
 *           type: object
 *           properties:
 *             value:
 *               type: number
 *               minimum: 1
 *             unit:
 *               type: string
 *               enum: [day, week, month]
 *         category:
 *           type: string
 *           enum: [programming, design, marketing, business, language, other]
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         schedule:
 *           type: object
 *           properties:
 *             daysOfWeek:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *             timeStart:
 *               type: string
 *             timeEnd:
 *               type: string
 *         maxStudents:
 *           type: number
 *           minimum: 1
 *         teachers:
 *           type: array
 *           items:
 *             type: string
 *         materials:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [video, document, link, other]
 *               url:
 *                 type: string
 *         isActive:
 *           type: boolean
 */

export default router;
