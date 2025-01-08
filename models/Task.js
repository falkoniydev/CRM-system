import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		assignedTo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // Mijozga tayinlash
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "in-progress", "completed"],
			default: "pending",
		},
		dueDate: {
			type: Date,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // Kim tomonidan yaratilgan
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Task", taskSchema);
