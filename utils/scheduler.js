import cron from "node-cron";
import Task from "../models/Task.js";
import { sendEmail } from "./email.js";
import moment from "moment-timezone";

export const monitorTasks = () => {
	console.log("Task monitoring ishga tushdi...");

	cron.schedule("0 0 * * *", async () => {
		console.log("Task muddatlarini tekshirish boshlandi...");
		try {
			const tasks = await Task.find({ status: "pending" }).populate(
				"assignedTo",
				"name email"
			);

			console.log("Topilgan tasklar:", tasks);

			const now = moment().tz("Asia/Tashkent"); // Hozirgi vaqtni Toshkent zonasi bo‘yicha olish
			console.log("Hozirgi vaqt (Toshkent):", now);

			tasks.forEach(async (task) => {
				try {
					if (!task.assignedTo || !task.assignedTo.email) {
						console.error(`Task ID ${task._id} uchun email mavjud emas.`);
						return;
					}

					const dueDate = moment(task.dueDate).tz("Asia/Tashkent"); // Task muddati Toshkent vaqt zonasida
					const hoursDiff = dueDate.diff(now, "hours");
					console.log("Soat farqi:", hoursDiff);

					// Farqni hisoblash
					const timeDiff = dueDate.diff(now, "hours", true); // Soatda farq
					console.log(
						`Task ID: ${task._id}, Time Diff: ${timeDiff.toFixed(2)} soat`
					);

					if (timeDiff > 0 && timeDiff <= 1) {
						await sendEmail({
							to: task.assignedTo.email,
							subject: "1 soat qoldi!",
							text: `Hurmatli ${task.assignedTo.name}, "${task.title}" topshiriqning muddati 1 soatdan keyin tugaydi.`,
						});
					} else if (timeDiff > 0 && timeDiff <= 12) {
						await sendEmail({
							to: task.assignedTo.email,
							subject: "12 soat qoldi!",
							text: `Hurmatli ${task.assignedTo.name}, "${task.title}" topshiriqning muddati 12 soatdan keyin tugaydi.`,
						});
					} else if (timeDiff > 0 && timeDiff <= 24) {
						await sendEmail({
							to: task.assignedTo.email,
							subject: "24 soat qoldi!",
							text: `Hurmatli ${task.assignedTo.name}, "${task.title}" topshiriqning muddati 24 soatdan keyin tugaydi.`,
						});
					}
				} catch (error) {
					console.error(
						`Task ID ${task._id} uchun email yuborishda xatolik:`,
						error
					);
				}
			});
		} catch (error) {
			console.error("Task monitoring xatosi:", error);
		}
	});
};
