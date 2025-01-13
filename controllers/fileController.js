import Task from "../models/Task.js";

export const uploadFile = async (req, res) => {
	console.log("Fayl yuklash funksiyasi ishga tushdi!");
	try {
		if (!req.file) {
			return res
				.status(400)
				.json({
					error: "Fayl yuklanmadi yoki hajmi oshib ketdi (maksimal 10 MB).",
				});
		}

		console.log("Request Body:", req.body);
		console.log("File:", req.file);

		const { taskId } = req.body;

		// 1. Task ID ni validatsiya qilish
		if (!taskId) {
			return res.status(400).json({ error: "Task ID kiritilmagan." });
		}

		// 2. Fayl yuklanganligini tekshirish
		if (!req.file) {
			return res.status(400).json({ error: "Fayl yuklanmadi." });
		}

		// 3. Taskni topish
		const task = await Task.findById(taskId);
		if (!task) {
			return res.status(404).json({ error: "Task topilmadi." });
		}

		console.log("Task topildi:", task);

		// 4. Fayl ma'lumotlarini olamiz
		const fileData = {
			filename: req.file.originalname,
			contentType: req.file.mimetype,
			data: req.file.buffer, // memoryStorage bilan buffer orqali olamiz
		};

		// 5. Faylni taskning attachments arrayiga qo'shamiz
		task.attachments.push(fileData);
		console.log("Attachments after push:", task.attachments);

		// 6. Taskni saqlash
		await task.save();
		console.log("Task saqlandi:", task);

		// 7. Javob qaytarish
		res.status(200).json({
			message: "Fayl muvaffaqiyatli yuklandi va saqlandi.",
			taskId: task._id,
		});
	} catch (error) {
		console.error("Fayl yuklashda xatolik:", error);
		res.status(500).json({ error: "Xatolik yuz berdi." });
	}
};

export const getFileList = async (req, res) => {
	try {
		const { taskId } = req.params;

		// Taskni topish
		const task = await Task.findById(taskId);
		if (!task) {
			return res.status(404).json({ error: "Task topilmadi." });
		}

		// Taskning attachments arrayini qaytarish
		res.status(200).json({
			message: "Fayllar ro'yxati muvaffaqiyatli olindi",
			files: task.attachments,
		});
	} catch (error) {
		console.error("Error retrieving file list:", error);
		res
			.status(500)
			.json({ error: "Fayllar ro'yxatini olishda xatolik yuz berdi." });
	}
};

export const downloadFile = async (req, res) => {
	try {
		const { taskId, filename } = req.params;

		// Taskni topish
		const task = await Task.findById(taskId);
		if (!task) {
			return res.status(404).json({ error: "Task topilmadi." });
		}

		// Faylni `attachments` dan qidirish
		const file = task.attachments.find((att) => att.filename === filename);
		if (!file) {
			return res.status(404).json({ error: "Fayl topilmadi." });
		}

		// Faylni yuborish
		res.set({
			"Content-Type": file.contentType,
			"Content-Disposition": `attachment; filename="${file.filename}"`,
		});
		res.send(file.data);
	} catch (error) {
		console.error("Faylni yuklab olishda xatolik:", error);
		res.status(500).json({ error: "Xatolik yuz berdi." });
	}
};

export const deleteFile = async (req, res) => {
	try {
		const { taskId, filename } = req.params;

		// Taskni topish
		const task = await Task.findById(taskId);
		if (!task) {
			return res.status(404).json({ error: "Task topilmadi." });
		}

		// Faylni `attachments` dan o'chirish
		const fileIndex = task.attachments.findIndex(
			(att) => att.filename === filename
		);
		if (fileIndex === -1) {
			return res.status(404).json({ error: "Fayl topilmadi." });
		}

		task.attachments.splice(fileIndex, 1);
		await task.save();

		res.status(200).json({ message: "Fayl muvaffaqiyatli o'chirildi." });
	} catch (error) {
		console.error("Faylni o'chirishda xatolik:", error);
		res.status(500).json({ error: "Xatolik yuz berdi." });
	}
};
