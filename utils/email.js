import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
	try {
		// Nodemailer transportni sozlash
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.EMAIL_USER, // Gmail account
				pass: process.env.EMAIL_PASS, // Gmail password yoki App Password
			},
		});

		// Email ma'lumotlari
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to,
			subject,
			text,
		};

		// Emailni yuborish
		await transporter.sendMail(mailOptions);
		console.log("Email sent successfully");
	} catch (err) {
		console.error("Email send failed:", err.message);
		throw new Error("Email send failed");
	}
};
