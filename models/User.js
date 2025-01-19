import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minLength: 2,
			maxLength: 50,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Noto'g'ri email format",
			],
		},
		password: {
			type: String,
			required: true,
			minLength: 6,
		},
		role: {
			type: String,
			enum: ["admin", "teacher", "student"],
			default: "student",
		},
		profilePicture: {
			filename: String,
			originalname: String,
			mimetype: {
				type: String,
				enum: ["image/jpeg", "image/png", "image/gif"],
			},
			size: {
				type: Number,
				max: 10 * 1024 * 1024, // 10MB limit
			},
			path: String, // Qo'shildi
			url: String, // Qo'shildi
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastLogin: {
			type: Date,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Password hash qilish
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Password tekshirish metodi
UserSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// User ma'lumotlarini JSON formatga o'tkazishda password ni olib tashlash
UserSchema.methods.toJSON = function () {
	const user = this.toObject();
	delete user.password;
	return user;
};

const User = mongoose.model("User", UserSchema);

export default User;
