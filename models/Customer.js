import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Ism kiritilishi shart"],
			trim: true,
			minLength: [2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"],
			maxLength: [50, "Ism 50 ta belgidan oshmasligi kerak"],
		},
		email: {
			type: String,
			required: [true, "Email kiritilishi shart"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Noto'g'ri email format",
			],
		},
		phone: {
			type: String,
			required: [true, "Telefon raqam kiritilishi shart"],
			unique: true,
			trim: true,
			match: [
				/^\+998[0-9]{9}$/,
				"Telefon raqam formati noto'g'ri (+998XXXXXXXXX)",
			],
		},
		courses: [
			{
				course: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Course",
					required: true,
				},
				status: {
					type: String,
					enum: ["active", "completed", "dropped"],
					default: "active",
				},
				startDate: {
					type: Date,
					default: Date.now,
				},
				endDate: Date,
				progress: {
					type: Number,
					min: 0,
					max: 100,
					default: 0,
				},
				teacher: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
			},
		],
		education: {
			level: {
				type: String,
				enum: ["school", "college", "university", "working"],
				required: true,
			},
			institution: String,
			grade: String,
		},
		payments: [
			{
				amount: {
					type: Number,
					required: true,
				},
				date: {
					type: Date,
					default: Date.now,
				},
				course: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Course",
					required: true,
				},
				type: {
					type: String,
					enum: ["cash", "card", "transfer"],
					required: true,
				},
				status: {
					type: String,
					enum: ["paid", "pending", "cancelled"],
					default: "pending",
				},
			},
		],
		source: {
			type: String,
			enum: [
				"instagram",
				"telegram",
				"facebook",
				"website",
				"referral",
				"other",
			],
			required: true,
		},
		attendance: [
			{
				date: {
					type: Date,
					required: true,
				},
				status: {
					type: String,
					enum: ["present", "absent", "late"],
					required: true,
				},
				course: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Course",
				},
			},
		],
		documents: [
			{
				type: {
					type: String,
					enum: ["passport", "diploma", "certificate", "other"],
					required: true,
				},
				number: String,
				url: String,
				uploadedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		notes: [
			{
				content: {
					type: String,
					required: true,
				},
				createdBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
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

// Kurslar bo'yicha umumiy to'lov virtual field
customerSchema.virtual("totalPayments").get(function () {
	if (!this.payments) return 0;
	return this.payments.reduce((total, payment) => {
		return total + (payment.status === "paid" ? payment.amount : 0);
	}, 0);
});

// O'rtacha davomat virtual field
customerSchema.virtual("averageAttendance").get(function () {
	if (!this.attendance || this.attendance.length === 0) return 0;
	const present = this.attendance.filter((a) => a.status === "present").length;
	return (present / this.attendance.length) * 100;
});

// Indexlar
customerSchema.index({ email: 1, phone: 1 });
customerSchema.index({ "courses.course": 1 });
customerSchema.index({ isActive: 1 });

export default mongoose.model("Customer", customerSchema);
