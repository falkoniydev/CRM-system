import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/chat/");
	},
	filename: (req, file, cb) => {
		// Original fayl nomini saqlash
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, uniqueSuffix + ext); // kengaytmani saqlaymiz
	},
});

const fileFilter = (req, file, cb) => {
	// Ruxsat etilgan fayl turlarini tekshirish
	const allowedTypes = [
		"image/jpeg",
		"image/png",
		"image/gif",
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		// boshqa kerakli turlarni qo'shishingiz mumkin
	];

	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Ruxsat etilmagan fayl turi"));
	}
};

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
});
