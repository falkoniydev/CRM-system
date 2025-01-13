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

const upload = multer({ dest: "uploads/chat/" }); // Multer configuration for chat file upload (should be moved to a separate file)

const router = express.Router();

// Guruh yaratish
router.post(
	"/create",
	authMiddleware,
	roleMiddleware(["admin", "teacher"]), // Faqat admin va teacher rollariga ruxsat
	createChatRoom
);

// Guruhga foydalanuvchi qo'shish
router.post("/add-member", authMiddleware, addMemberToChatRoom);

router.put("/add-member/:chatRoomId", authMiddleware, addMemberToChatRoom);

// Xabar yuborish
router.post("/send-message", authMiddleware, sendMessage);

// Guruhga o'tgan xabarlar olish
router.get("/messages/:chatRoomId", getMessagesForChatRoom);

// Chatroomlarni olish
router.get("/all", authMiddleware, getAllChatRooms);

// Chatroomni o'chirish
router.delete("/:chatRoomId", authMiddleware, deleteChatRoom);

// Xabarni o'chirish endpointi
router.delete("/message/:messageId", authMiddleware, deleteMessage);

// Xabarni tahrirlash endpointi
router.put("/message/:messageId", authMiddleware, editMessage);

// Guruhdan a'zo o'chirish
router.delete(
	"/:chatRoomId/members/:memberId",
	authMiddleware,
	removeMemberFromChatRoom
);

// Chat uchun fayl yuklash
router.post(
	"/upload-file",
	authMiddleware,
	upload.single("file"),
	uploadChatFile
);

// Chat uchun fayl yuklab olish
router.get(
	"/download-file/:chatRoomId/:messageId",
	authMiddleware,
	downloadChatFile
);

export default router;
