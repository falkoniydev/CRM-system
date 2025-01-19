// controllers/fileController.js
import Task from "../models/Task.js";
import fs from "fs/promises";
import path from "path";

export const uploadFile = async (req, res) => {
	try {
		const { taskId } = req.params;

		// Taskni tekshirish
		const task = await Task.findOne({ _id: taskId, isActive: true });
		if (!task) {
			return res.status(404).json({ error: "Vazifa topilmadi" });
		}

		// Faylni tekshirish
		if (!req.file) {
			return res.status(400).json({ error: "Fayl yuklanmadi" });
		}

		// Fayl ma'lumotlarini tayyorlash
		const fileData = {
			filename: req.file.filename,
			originalname: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size,
			path: req.file.path.replace(/\\/g, "/"),
			url: `/api/files/download/${taskId}/${req.file.filename}`,
			uploadedAt: new Date(),
			uploadedBy: req.user.id,
		};

		// Taskga fayl qo'shish
		task.attachments.push(fileData);
		await task.save();

		res.status(200).json({
			message: "Fayl muvaffaqiyatli yuklandi",
			file: fileData,
		});
	} catch (error) {
		console.error("Fayl yuklashda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};

export const getFileList = async (req, res) => {
	try {
		const { taskId } = req.params;

		const task = await Task.findOne({ _id: taskId, isActive: true }).populate(
			"attachments.uploadedBy",
			"name"
		);

		if (!task) {
			return res.status(404).json({ error: "Vazifa topilmadi" });
		}

		res.json({
			taskId,
			files: task.attachments,
		});
	} catch (error) {
		console.error("Fayllar ro'yxatini olishda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};

export const downloadFile = async (req, res) => {
	try {
		const { taskId, filename } = req.params;

		const task = await Task.findOne({ _id: taskId, isActive: true });
		if (!task) {
			return res.status(404).json({ error: "Vazifa topilmadi" });
		}

		const file = task.attachments.find((f) => f.filename === filename);
		if (!file) {
			return res.status(404).json({ error: "Fayl topilmadi" });
		}

		const filePath = path.join(process.cwd(), file.path);

		try {
			await fs.access(filePath);
		} catch {
			return res.status(404).json({ error: "Fayl topilmadi" });
		}

		res.setHeader("Content-Type", file.mimetype);
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${file.originalname}"`
		);

		res.sendFile(filePath);
	} catch (error) {
		console.error("Faylni yuklashda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};

export const deleteFile = async (req, res) => {
	try {
		const { taskId, filename } = req.params;

		const task = await Task.findOne({ _id: taskId, isActive: true });
		if (!task) {
			return res.status(404).json({ error: "Vazifa topilmadi" });
		}

		const fileIndex = task.attachments.findIndex(
			(f) => f.filename === filename
		);
		if (fileIndex === -1) {
			return res.status(404).json({ error: "Fayl topilmadi" });
		}

		const file = task.attachments[fileIndex];

		// Faylni filesystemdan o'chirish
		try {
			await fs.unlink(path.join(process.cwd(), file.path));
		} catch (error) {
			console.error("Faylni o'chirishda xatolik:", error);
		}

		// Faylni databasedan o'chirish
		task.attachments.splice(fileIndex, 1);
		await task.save();

		res.json({
			message: "Fayl muvaffaqiyatli o'chirildi",
			filename: file.originalname,
		});
	} catch (error) {
		console.error("Faylni o'chirishda xatolik:", error);
		res.status(500).json({ error: error.message });
	}
};
