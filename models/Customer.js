import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
		},
		phone: {
			type: String,
			required: [true, "Phone number is required"],
			unique: true,
		},
		course: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "active",
		},
		paymentStatus: {
			type: String,
			enum: ["paid", "pending"],
			default: "pending",
		},
		startDate: {
			type: Date,
			default: Date.now,
		},
		endDate: {
			type: Date,
		},
	},
	{ timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
