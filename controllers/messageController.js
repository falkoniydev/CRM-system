import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";

// SEND MESSAGES
export const sendMessage = async (req, res) => {
	try {
		const { chatRoomId, content, type } = req.body;

		const message = await Message.create({
			chatRoomId,
			sender: req.user.id,
			content,
			type,
		});

		res
			.status(201)
			.json({ message: "Xabar muvaffaqiyatli yuborildi", message });
	} catch (error) {
		console.error("Error sending message:", error);
		res.status(500).json({ error: "Xabarni yuborishda xatolik yuz berdi." });
	}
};

// GET MESSAGES
export const getMessagesForChatRoom = async (req, res) => {
	try {
		const { chatRoomId } = req.params;
		const messages = await Message.find({ chatRoomId }).populate(
			"sender",
			"name"
		);
		if (!messages) {
			return res
				.status(404)
				.json({ error: "Messages not found for this chat room." });
		}
		res.status(200).json(messages);
	} catch (error) {
		console.error("Error retrieving messages:", error);
		res.status(500).json({ error: "Failed to retrieve messages." });
	}
};

// UPDATE MESSAGES
export const editMessage = async (req, res) => {
	try {
		const { messageId } = req.params;
		const { newContent } = req.body;

		// Yangi xabar matni mavjudligini tekshirish
		if (!newContent || newContent.trim() === "") {
			return res.status(400).json({ error: "New content cannot be empty" });
		}

		// Bazada xabarni yangilash
		const updatedMessage = await Message.findByIdAndUpdate(
			messageId,
			{ content: newContent, edited: true },
			{ new: true } // Yangilangan hujjatni qaytaradi
		);

		if (!updatedMessage) {
			return res.status(404).json({ error: "Message not found" });
		}

		res.status(200).json({
			message: "Message updated successfully",
			updatedMessage,
		});
	} catch (error) {
		console.error("Error editing message:", error);
		res.status(500).json({ error: "Failed to edit message" });
	}
};

// DELETE MESSAGES
export const deleteMessage = async (req, res) => {
	try {
		const { messageId } = req.params;

		// Bazadan xabarni o'chirish
		const deletedMessage = await Message.findByIdAndDelete(messageId);

		if (!deletedMessage) {
			return res.status(404).json({ error: "Message not found" });
		}

		res.status(200).json({ message: "Message deleted successfully" });
	} catch (error) {
		console.error("Error deleting message:", error);
		res.status(500).json({ error: "Failed to delete message" });
	}
};

// FILE UPLOAD IN CHAT
export const uploadChatFile = async (req, res) => {
	try {
		const { chatRoomId } = req.body;

		if (!req.file) {
			return res.status(400).json({
				error: "Fayl yuklanmadi yoki hajmi oshib ketdi.",
			});
		}

		const chatRoom = await ChatRoom.findById(chatRoomId);
		if (!chatRoom) {
			return res.status(404).json({ error: "Chat room topilmadi." });
		}

		// Fayl ma'lumotlarini saqlash
		const message = await Message.create({
			chatRoomId,
			sender: req.user.id,
			type: "file",
			content: req.file.originalname, // original fayl nomi
			fileDetails: {
				originalName: req.file.originalname,
				fileName: req.file.filename,
				mimeType: req.file.mimetype,
				size: req.file.size,
				path: req.file.path,
			},
		});

		await message.populate("sender", "name email");

		res.status(200).json({
			message: "Fayl muvaffaqiyatli yuklandi",
			chatMessage: message,
		});
	} catch (error) {
		console.error("Faylni yuklashda xatolik:", error);
		res.status(500).json({ error: "Xatolik yuz berdi" });
	}
};

// FILE DONWLOAD IN CHAT
export const downloadChatFile = async (req, res) => {
	try {
		const { chatRoomId, messageId } = req.params;

		// Xabarni tekshirish va sender ma'lumotlarini olish
		const message = await Message.findById(messageId).populate(
			"sender",
			"name email"
		);

		if (!message || message.chatRoomId.toString() !== chatRoomId) {
			return res.status(404).json({ error: "Xabar yoki fayl topilmadi." });
		}

		if (!message.fileDetails || !message.fileDetails.path) {
			return res.status(404).json({ error: "Fayl topilmadi." });
		}

		// Faylning MIME type va original nomini o'rnatish
		const filePath = message.fileDetails.path;
		const originalFileName = message.fileDetails.originalName;
		const mimeType = message.fileDetails.mimeType;

		// Response headerlarini to'g'ri o'rnatish
		res.setHeader("Content-Type", mimeType);
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${originalFileName}"`
		);

		// Faylni yuborish
		res.sendFile(filePath, {
			root: "./", // yoki fayllar saqlanadigan to'liq yo'l
			headers: {
				"Content-Type": mimeType,
				"Content-Disposition": `attachment; filename="${originalFileName}"`,
			},
		});
	} catch (error) {
		console.error("Faylni yuklab olishda xatolik:", error);
		res.status(500).json({ error: "Xatolik yuz berdi." });
	}
};
