import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const createChatRoom = async (req, res) => {
	try {
		const { name, members } = req.body;

		// Foydalanuvchi roli tekshiruvi
		if (req.user.role !== "admin" && req.user.role !== "teacher") {
			return res
				.status(403)
				.json({ error: "Sizga guruh yaratishga ruxsat berilmagan." });
		}

		if (!name || !members || members.length === 0) {
			return res.status(400).json({ error: "Guruh nomi va a'zolar kerak." });
		}

		const newChat = await ChatRoom.create({
			name,
			members,
			createdBy: req.user.id,
		});

		res.status(201).json({
			message: "Chat room muvaffaqiyatli yaratildi",
			chatRoom: newChat,
		});
	} catch (error) {
		console.error("Error creating chat:", error);
		res.status(500).json({ error: "Chat yaratishda xatolik yuz berdi" });
	}
};

export const getAllChatRooms = async (req, res) => {
	try {
		const chatRooms = await ChatRoom.find().populate(
			"members",
			"name role profilePicture"
		);
		res.status(200).json({
			message: "Chatrooms retrieved successfully",
			chatRooms,
		});
	} catch (error) {
		console.error("Error retrieving chatrooms:", error);
		res.status(500).json({ error: "Failed to retrieve chatrooms" });
	}
};

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

export const deleteChatRoom = async (req, res) => {
	try {
		const { chatRoomId } = req.params;

		// Chatroomni bazadan o'chirish
		const deletedChatRoom = await ChatRoom.findByIdAndDelete(chatRoomId);

		if (!deletedChatRoom) {
			return res.status(404).json({ error: "Chatroom not found" });
		}

		res.status(200).json({ message: "Chatroom deleted successfully" });
	} catch (error) {
		console.error("Error deleting chatroom:", error);
		res.status(500).json({ error: "Failed to delete chatroom" });
	}
};

export const addMemberToChatRoom = async (req, res) => {
	try {
		const { chatRoomId } = req.params;
		const { userId } = req.body;

		// Chatroomni topish
		const chatRoom = await ChatRoom.findById(chatRoomId);
		if (!chatRoom) {
			return res.status(404).json({ error: "Chatroom not found" });
		}

		// Foydalanuvchini topish
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Foydalanuvchi allaqachon guruhda borligini tekshirish
		if (chatRoom.members.includes(userId)) {
			return res
				.status(400)
				.json({ error: "User is already a member of this chatroom" });
		}

		// Foydalanuvchini guruhga qo‘shish
		chatRoom.members.push(userId);
		await chatRoom.save();

		res.status(200).json({
			message: "Member added successfully",
			chatRoom,
		});
	} catch (error) {
		console.error("Error adding member to chatroom:", error);
		res.status(500).json({ error: "Failed to add member to chatroom" });
	}
};

export const removeMemberFromChatRoom = async (req, res) => {
	try {
		const { chatRoomId, memberId } = req.params;

		const chatRoom = await ChatRoom.findById(chatRoomId);

		if (!chatRoom) {
			return res.status(404).json({ error: "Chatroom not found" });
		}

		// Guruh a’zosini o'chirish
		chatRoom.members = chatRoom.members.filter(
			(member) => member.toString() !== memberId
		);

		await chatRoom.save();

		res.status(200).json({
			message: "Member removed from chatroom successfully",
		});
	} catch (error) {
		console.error("Error removing member:", error);
		res.status(500).json({ error: "Failed to remove member from chatroom" });
	}
};
