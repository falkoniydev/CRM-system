import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
	{
		task: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Task",
			required: true,
			index: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		content: {
			type: String,
			required: true,
			trim: true,
			minLength: [1, "Izoh bo'sh bo'lishi mumkin emas"],
			maxLength: [1000, "Izoh juda uzun"],
		},
		isEdited: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export default mongoose.model("Comment", commentSchema);
