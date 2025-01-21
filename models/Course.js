// models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Kurs nomi kiritilishi shart"],
			trim: true,
			minLength: [3, "Kurs nomi kamida 3 ta belgidan iborat bo'lishi kerak"],
			maxLength: [100, "Kurs nomi 100 ta belgidan oshmasligi kerak"],
		},
		description: {
			type: String,
			required: [true, "Kurs tavsifi kiritilishi shart"],
			trim: true,
			minLength: [
				10,
				"Kurs tavsifi kamida 10 ta belgidan iborat bo'lishi kerak",
			],
			maxLength: [1000, "Kurs tavsifi 1000 ta belgidan oshmasligi kerak"],
		},
		price: {
			type: Number,
			required: [true, "Kurs narxi kiritilishi shart"],
			min: [0, "Kurs narxi 0 dan kam bo'lishi mumkin emas"],
		},
		duration: {
			value: {
				type: Number,
				required: [true, "Kurs davomiyligi kiritilishi shart"],
				min: [1, "Kurs davomiyligi 1 dan kam bo'lishi mumkin emas"],
			},
			unit: {
				type: String,
				enum: ["day", "week", "month"],
				required: true,
				default: "month",
			},
		},
		level: {
			type: String,
			enum: ["beginner", "intermediate", "advanced"],
			required: true,
			default: "beginner",
		},
		category: {
			type: String,
			required: [true, "Kurs kategoriyasi kiritilishi shart"],
			enum: [
				"programming",
				"design",
				"marketing",
				"business",
				"language",
				"other",
			],
		},
		schedule: {
			daysOfWeek: [
				{
					type: String,
					enum: [
						"monday",
						"tuesday",
						"wednesday",
						"thursday",
						"friday",
						"saturday",
						"sunday",
					],
				},
			],
			timeStart: String,
			timeEnd: String,
		},
		maxStudents: {
			type: Number,
			required: true,
			min: [1, "Minimal talabalar soni 1 dan kam bo'lishi mumkin emas"],
			default: 20,
		},
		teachers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
		],
		materials: [
			{
				name: String,
				description: String,
				type: {
					type: String,
					enum: ["video", "document", "link", "other"],
				},
				url: String,
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

// Virtual field - joriy talabalar soni
courseSchema.virtual("currentStudents").get(function () {
	// Bu yerda Customer modelidan ushbu kursga yozilgan active talabalar sonini olish kerak
	// Buni keyinroq implement qilamiz
	return 0;
});

// Indexlar
courseSchema.index({ name: 1 });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ isActive: 1 });

export default mongoose.model("Course", courseSchema);
