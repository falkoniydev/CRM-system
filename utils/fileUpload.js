import multer from "multer";

// Faylni xotirada saqlash uchun konfiguratsiya
const storage = multer.memoryStorage(); // Disk o‘rniga xotirada saqlash

// Fayl filtri (faqat ruxsat etilgan fayl turlarini qabul qilish)
const fileFilter = (req, file, cb) => {
	const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error("Noto‘g‘ri fayl turi. Faqat JPEG, PNG yoki PDF ruxsat etiladi.")
		);
	}
};

// Multer konfiguratsiyasi
const upload = multer({ storage, fileFilter });

export default upload;
