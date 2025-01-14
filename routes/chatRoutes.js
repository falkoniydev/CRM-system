/**
 * @swagger
 * tags:
 *   name: Real-Time Chat
 *   description: Chat tizimi uchun API
 */

import express from "express";
import {
	createChatRoom,
	addMemberToChatRoom,
	getAllChatRooms,
	deleteChatRoom,
	removeMemberFromChatRoom,
} from "../controllers/chatController.js";
import {
	deleteMessage,
	downloadChatFile,
	sendMessage,
	uploadChatFile,
	getMessagesForChatRoom,
	editMessage,
} from "../controllers/messageController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import multer from "multer";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const upload = multer({ dest: "uploads/chat/" });

const router = express.Router();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CREATE GROUP CHAT
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/chat/create:
 *   post:
 *     summary: Yangi chat xonasi yaratish
 *     tags: [Real-Time Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Project Team Chat
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user1_id", "user2_id"]
 *     responses:
 *       201:
 *         description: Chat xonasi muvaffaqiyatli yaratildi.
 *       400:
 *         description: Xato ma'lumotlar taqdim etilgan.
 */
router.post(
	"/create",
	authMiddleware,
	roleMiddleware(["admin", "teacher"]),
	createChatRoom
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ADD MEMBERS TO GROUP CHAT
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/chat/add-member/:chatRoomId:
 *   put:
 *     summary: Chatga yangi a'zolar qo'shish
 *     tags: [Real-Time Chat]
 *     security:
 *       - bearerAuth: []
 * 	   parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat xonasi ID*
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["new_user_id1", "new_user_id2"]
 *     responses:
 *       200:
 *         description: A'zolar muvaffaqiyatli qo'shildi.
 *       404:
 *         description: Chat topilmadi.
 */
router.put(
	"/api/chat/add-member/:chatRoomId",
	authMiddleware,
	addMemberToChatRoom
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET ALL CHAT ROOMS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/chat/all:
 *   get:
 *     summary: Barcha chat xonalarini olish
 *     tags: [Real-Time Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat xonalar ro'yxati.
 */
router.get("/all", authMiddleware, getAllChatRooms);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DELETE CHAT ROOM
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/chat/{chatRoomId}:
 *   delete:
 *     summary: Chat xonasini o'chirish
 *     tags: [Real-Time Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat xonasi ID
 *     responses:
 *       200:
 *         description: Chat muvaffaqiyatli o'chirildi.
 *       404:
 *         description: Chat topilmadi.
 */
router.delete("/:chatRoomId", authMiddleware, deleteChatRoom);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DELETE A MEMBER FROM GROUP CHAT
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/chat/:chatRoomId/members/:memberId:
 *   delete:
 *     summary: Chatdan a'zoni o'chirish
 *     tags: [Real-Time Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat xonasi ID
 *         - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Guruh a'zosi ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: A'zo muvaffaqiyatli o'chirildi.
 *       404:
 *         description: Chat yoki a'zo topilmadi.
 */
router.delete(
	"/api/chat/:chatRoomId/members/:memberId",
	authMiddleware,
	removeMemberFromChatRoom
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SEND MESSAGE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/chat/send-message:
 *   post:
 *     summary: Xabarni chatga yuborish
 *     tags: [Real-Time Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatRoomId:
 *                 type: string
 *                 example: chat_id
 *               message:
 *                 type: string
 *                 example: Hello Team!
 *     responses:
 *       201:
 *         description: Xabar muvaffaqiyatli yuborildi.
 */
router.post("/send-message", authMiddleware, sendMessage);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DELETE MESSAGE IN THE CHAT
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/chat/message/{messageId}:
 *   delete:
 *     summary: Chatdagi xabarni o'chirish
 *     tags: [Real-Time Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Xabar ID
 *     responses:
 *       200:
 *         description: Xabar muvaffaqiyatli o'chirildi.
 *       404:
 *         description: Xabar topilmadi.
 */
router.delete("/message/:messageId", authMiddleware, deleteMessage);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EDIT MESSAGE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/chat/message/{messageId}:
 *   put:
 *     summary: Chatdagi xabarni tahrirlash
 *     tags: [Real-Time Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Xabar ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Yangilangan xabar matni
 *     responses:
 *       200:
 *         description: Xabar muvaffaqiyatli tahrirlandi.
 *       404:
 *         description: Xabar topilmadi.
 */
router.put("/message/:messageId", authMiddleware, editMessage);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPLOAD FILES TO CHAT
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/chat/upload-file:
 *   post:
 *     summary: Chatga faylni yuklash
 *     tags: [Real-Time Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 * 				chatRoomId:
 *                 type: string
 *                 example: chat_id
 *     responses:
 *       201:
 *         description: Fayl muvaffaqiyatli yuklandi.
 */
router.post(
	"/upload-file",
	authMiddleware,
	upload.single("file"),
	uploadChatFile
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DOWNLOAD FILES FROM CHAT
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/chat/download-file/{chatRoomId}/{messageId}:
 *   get:
 *     summary: Chatdan faylni yuklab olish
 *     tags: [Real-Time Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat xonasi ID
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Xabar ID
 *     responses:
 *       200:
 *         description: Fayl muvaffaqiyatli yuklab olindi.
 *       404:
 *         description: Fayl topilmadi.
 */
router.get(
	"/download-file/:chatRoomId/:messageId",
	authMiddleware,
	downloadChatFile
);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GET MESSAGES IN CHATROOM
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @swagger
 * /api/chat/messages/{chatRoomId}:
 *   get:
 *     summary: Chat xonasidagi barcha xabarlarni olish
 *     tags: [Real-Time Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat xonasi ID
 *     responses:
 *       200:
 *         description: Xabarlar muvaffaqiyatli qaytarildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       chatRoomId:
 *                         type: string
 *                       sender:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           profilePicture:
 *                             type: string
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *       404:
 *         description: Xabarlar topilmadi.
 *       500:
 *         description: Server xatosi.
 */
router.get("/messages/:chatRoomId", authMiddleware, getMessagesForChatRoom);

export default router;
