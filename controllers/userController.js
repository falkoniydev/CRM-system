import User from "../models/User.js";

export const uploadProfilePhoto = async (req, res) => {
	try {
		const { userId } = req.params;

		// Foydalanuvchini topish
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "Foydalanuvchi topilmadi." });
		}

		// Fayl yuklanganligini tekshirish
		if (!req.file) {
			return res.status(400).json({ error: "Rasm yuklanmadi." });
		}

		// Fayl ma'lumotlarini olish
		const fileData = {
			filename: req.file.filename,
			originalname: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size,
			buffer: req.file.buffer, // Faylni binary formatda olish uchun multer.memoryStorage ishlatiladi
		};

		// Foydalanuvchi obyektiga profil fotosini qo'shish
		user.profilePicture = fileData; // `profilePicture` modeli ichida mavjud bo'lishi kerak
		await user.save();

		// Javob qaytarish
		res.status(200).json({
			message: "Profil rasmi muvaffaqiyatli yuklandi.",
			profilePicture: user.profilePicture,
		});
	} catch (error) {
		console.error("Profil rasmi yuklashda xatolik:", error);
		res.status(500).json({ error: "Xatolik yuz berdi." });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const { userId } = req.params; // URL params orqali user ID olinadi
		const updates = req.body; // Yangilanishlar request body'dan olinadi

		// Foydalanuvchini topish
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "Foydalanuvchi topilmadi." });
		}

		// Ma'lumotlarni yangilash
		Object.keys(updates).forEach((key) => {
			user[key] = updates[key];
		});

		// Saqlash
		await user.save();

		res.status(200).json({
			message: "Profil muvaffaqiyatli yangilandi.",
			user,
		});
	} catch (error) {
		console.error("Profil yangilashda xatolik:", error);
		res.status(500).json({ error: "Profil yangilashda xatolik yuz berdi." });
	}
};

export const uploadAvatar = async (req, res) => {
	try {
		const { userId } = req.params;

		// Foydalanuvchini topish
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "Foydalanuvchi topilmadi." });
		}

		// Fayl yuklanganligini tekshirish
		if (!req.file) {
			return res.status(400).json({ error: "Avatar yuklanmadi." });
		}

		// Eski avatarni o'chirish mexanizmi (agar mavjud bo'lsa)
		if (user.avatar && user.avatar.filename) {
			// Eski faylni o'chirish funksiyasi qo'shilishi mumkin (hozircha shart emas)
		}

		// Avatarni saqlash
		user.avatar = {
			filename: req.file.filename,
			contentType: req.file.mimetype,
			data: req.file.buffer, // Multer orqali RAMda saqlanadi
		};

		await user.save();

		res.status(200).json({
			message: "Avatar muvaffaqiyatli yuklandi.",
			avatar: user.avatar,
		});
	} catch (error) {
		console.error("Avatar yuklashda xatolik:", error);
		res.status(500).json({ error: "Avatar yuklashda xatolik yuz berdi." });
	}
};

