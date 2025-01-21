// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
	{
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Customer",
			required: true,
			index: true,
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: true,
		},
		amount: {
			type: Number,
			required: true,
			min: [0, "To'lov summasi 0 dan kam bo'lishi mumkin emas"],
		},
		type: {
			type: String,
			enum: ["cash", "card", "transfer"],
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "paid", "cancelled", "refunded"],
			default: "pending",
		},
		paidAt: {
			type: Date,
		},
		paymentMethod: {
			cardNumber: String, // Card to'lovi uchun
			cardHolder: String, // Card to'lovi uchun
			transactionId: String, // Online to'lov uchun
			checkNumber: String, // Naqd to'lov uchun chek
			bankDetails: {
				// Bank o'tkazmasi uchun
				bankName: String,
				accountNumber: String,
			},
		},
		description: {
			type: String,
			trim: true,
		},
		invoice: {
			// Hujjatlar
			number: String,
			url: String,
			issuedAt: Date,
		},
		processedBy: {
			// To'lovni qabul qilgan admin/o'qituvchi
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		notes: [
			{
				// Qo'shimcha izohlar
				content: String,
				createdBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
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

// To'lov qilingan sanani avtomatik qo'yish
paymentSchema.pre("save", function (next) {
	if (this.isModified("status") && this.status === "paid" && !this.paidAt) {
		this.paidAt = new Date();
	}
	next();
});

export default mongoose.model("Payment", paymentSchema);
