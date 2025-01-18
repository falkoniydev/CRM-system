import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		chatRoomId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ChatRoom",
			required: true,
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			enum: ["text", "file"],
			default: "text",
		},
		// Qo'shimcha fayl maydonlari
		fileDetails: {
			originalName: String,
			fileName: String,
			mimeType: String,
			size: Number,
			path: String,
		},
		edited: {
			type: Boolean,
			default: false,
		},
		timestamp: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Message", messageSchema);
