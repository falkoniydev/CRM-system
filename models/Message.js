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
