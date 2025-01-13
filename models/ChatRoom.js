import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		members: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		roleRestricted: {
			type: Boolean,
			default: true, // Guruhni yaratish roli bilan cheklanganmi.
		},
	},
	{ timestamps: true }
);

export default mongoose.model("ChatRoom", chatRoomSchema);
