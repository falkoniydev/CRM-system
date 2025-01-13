import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }) => {
	try {
		console.log("Email yuborilmoqda:", { to, subject, text }); // Log qo'shing

		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: false, // True only for 465, false for other ports
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});

		const mailOptions = {
			from: process.env.SMTP_USER, // Sender address
			to: to, // Recipient address
			subject: subject,
			text: text,
		};

		await transporter.sendMail(mailOptions);
		console.log("Email muvaffaqiyatli yuborildi!");
	} catch (error) {
		console.error("Email yuborishda xatolik:", error);
		throw error;
	}
};
