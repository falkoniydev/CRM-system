import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";

// SIGN UP
export const signup = async (req, res) => {
	const { name, email, password, role } = req.body;

	// Emailni tekshirish
	if (!email) {
		return res.status(400).json({ error: "Email is required." });
	}

	try {
		// Foydalanuvchini yaratish
		const user = await User.create({ name, email, password, role });

		// Email verification uchun token yaratish
		const verificationToken = jwt.sign(
			{ id: user._id },
			process.env.JWT_SECRET,
			{
				expiresIn: "4h",
			}
		);

		// Verification link
		const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;

		// Emailni yuborish
		await sendEmail({
			to: email,
			subject: "Email Verification",
			text: `Verify your email: ${verificationLink}`,
		});

		res
			.status(201)
			.json({ message: "Signup successful. Please verify your email." });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

// EMAIL VERIFICATION
export const verifyEmail = async (req, res) => {
	const { token } = req.query;

	try {
		// Tokenni tekshirish
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findByIdAndUpdate(
			decoded.id,
			{ isVerified: true },
			{ new: true }
		);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json({ message: "Email verified successfully" });
	} catch (err) {
		res.status(400).json({ error: "Invalid or expired token" });
	}
};

// LOGIN
export const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ error: "Invalid credentials" });
		}

		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{
				expiresIn: "1h",
			}
		);

		res.json({ token });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Reset token yaratish
		const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "15m",
		});

		// Reset link
		const resetLink = `${process.env.BASE_URL}/api/auth/reset-password?token=${resetToken}`;

		// Emailni yuborish
		await sendEmail({
			to: email,
			subject: "Reset Password",
			text: `Reset your password: ${resetLink}`,
		});

		res.json({ message: "Reset password link sent to your email." });
	} catch (err) {
		res.status(500).json({ error: "Email send failed" });
	}
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
	const { token, newPassword } = req.body;

	try {
		// Tokenni tekshirish
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Parolni yangilash
		user.password = newPassword;
		await user.save();

		res.json({ message: "Password reset successful" });
	} catch (err) {
		res.status(400).json({ error: "Invalid or expired token" });
	}
};
