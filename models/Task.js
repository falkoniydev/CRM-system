// models/Task.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			minLength: 3,
			maxLength: 100,
		},
		description: {
			type: String,
			trim: true,
			maxLength: 1000,
		},
		assignedTo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "in-progress", "completed"],
			default: "pending",
			required: true,
		},
		priority: {
			type: String,
			enum: ["low", "medium", "high"],
			default: "medium",
		},
		dueDate: {
			date: {
				type: Date,
				required: true,
			},
			time: {
				type: String,
				required: true,
				match: [
					/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
					"Vaqt formati noto'g'ri (HH:mm)",
				],
			},
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		attachments: [
			{
				filename: String,
				originalname: String,
				mimetype: String,
				size: Number,
				path: String,
				url: String,
				uploadedAt: {
					type: Date,
					default: Date.now,
				},
				uploadedBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
			},
		],
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

// Vazifa muddati o'tganini tekshirish
taskSchema.virtual("isOverdue").get(function () {
	if (!this.dueDate) return false;
	const dueDateTime = new Date(
		`${this.dueDate.date.toDateString()} ${this.dueDate.time}`
	);
	return dueDateTime < new Date();
});

// Fayl URL yasash
taskSchema.methods.getFileUrl = function (filename) {
	return `/api/files/download/${this._id}/${filename}`;
};

export default mongoose.model("Task", taskSchema);
