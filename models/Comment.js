import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
	{
		task: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Task",
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // User modeliga referens
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
