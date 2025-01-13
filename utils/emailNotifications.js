import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST, // SMTP server (gmail uchun smtp.gmail.com)
	port: process.env.SMTP_PORT, // Port (587 yoki 465)
	secure: false, // true agar SSL ishlatsangiz, 465 port uchun
	auth: {
		user: process.env.SMTP_USER, // Gmail manzilingiz
		pass: process.env.SMTP_PASS, // Gmail App Password
	},
});

export const sendEmail = async (to, subject, text) => {
	try {
		const info = await transporter.sendMail({
			from: process.env.SMTP_USER, // Kimdan
			to, // Kimga
			subject, // Email mavzusi
			text, // Email matni
		});

		console.log("Email sent: %s", info.messageId);
	} catch (error) {
		console.error("Failed to send email:", error);
		throw new Error("Email send failed");
	}
};
