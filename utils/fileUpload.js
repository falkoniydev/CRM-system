// utils/fileUpload.js
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// Task ID bo'yicha papka yaratish
		let uploadPath = "uploads/tasks";
		if (req.params.taskId) {
			uploadPath = `uploads/tasks/${req.params.taskId}`;
		}

		// Papkani yaratish
		fs.mkdirSync(uploadPath, { recursive: true });
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		// Xavfsiz fayl nomi yaratish
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, uniqueSuffix + ext);
	},
});

const fileFilter = (req, file, cb) => {
	const allowedTypes = [
		"image/jpeg",
		"image/png",
		"image/gif",
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"text/plain",
		"application/zip",
		"application/x-zip-compressed",
	];

	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error(`Ruxsat etilmagan fayl turi: ${file.mimetype}`));
	}
};

export const fileUpload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
});

// Error handler
export const handleFileUploadError = (error, req, res, next) => {
	if (error instanceof multer.MulterError) {
		if (error.code === "LIMIT_FILE_SIZE") {
			return res.status(400).json({
				error: "Fayl hajmi 10MB dan oshmasligi kerak",
			});
		}
		return res.status(400).json({ error: error.message });
	} else if (error) {
		return res.status(400).json({ error: error.message });
	}
	next();
};
