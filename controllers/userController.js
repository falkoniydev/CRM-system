import User from "../models/User.js";
import path from "path";
import fs from "fs/promises";

export const uploadProfilePhoto = async (req, res) => {
	try {
		const { userId } = req.params;

		// Foydalanuvchini topish
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
		}

		// Fayl yuklanganligini tekshirish
		if (!req.file) {
			return res.status(400).json({ error: "Rasm yuklanmadi" });
		}

		// Uploads papkasini yaratish
		const uploadsDir = path.join(process.cwd(), "uploads", "profiles");
		await fs.mkdir(uploadsDir, { recursive: true });

		// Fayl nomi generatsiya qilish
		const fileExt = path.extname(req.file.originalname);
		const fileName = `${userId}-${Date.now()}${fileExt}`;
		const filePath = path.join(uploadsDir, fileName);

		// Eski rasmni o'chirish
		if (user.profilePicture && user.profilePicture.path) {
			try {
				await fs.unlink(path.join(process.cwd(), user.profilePicture.path));
			} catch (error) {
				console.error("Eski rasm o'chirishda xatolik:", error);
			}
		}

		// Yangi rasmni saqlash
		await fs.writeFile(filePath, req.file.buffer);

		// Ma'lumotlarni yangilash
		user.profilePicture = {
			filename: fileName,
			originalname: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size,
			path: `/uploads/profiles/${fileName}`, // Bu muhim!
			url: `/api/users/${userId}/profile-photo`, // Bu ham muhim!
		};

		await user.save();

		res.status(200).json({
			message: "Profil rasmi muvaffaqiyatli yuklandi",
			profilePicture: user.profilePicture,
		});
	} catch (error) {
		console.error("Profil rasmi yuklashda xatolik:", error);
		res.status(500).json({ error: "Xatolik yuz berdi" });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const { userId } = req.params;
		const updates = req.body;

		// Faqat ruxsat berilgan fieldlarni olish
		const allowedUpdates = ["name", "email", "password"];
		const updateData = {};
		Object.keys(updates).forEach((key) => {
			if (allowedUpdates.includes(key)) {
				updateData[key] = updates[key];
			}
		});

		// O'z profilini update qilayotganini tekshirish
		if (req.user.id !== userId) {
			return res.status(403).json({
				error: "Faqat o'z profilingizni yangilash mumkin",
			});
		}

		const user = await User.findByIdAndUpdate(userId, updateData, {
			new: true,
			runValidators: true,
		});

		if (!user) {
			return res.status(404).json({
				error: "Foydalanuvchi topilmadi",
			});
		}

		res.status(200).json({
			message: "Profil muvaffaqiyatli yangilandi",
			user,
		});
	} catch (error) {
		console.error("Profil yangilashda xatolik:", error);
		res.status(400).json({
			error: error.message || "Profil yangilashda xatolik yuz berdi",
		});
	}
};

export const getProfilePhoto = async (req, res) => {
	try {
		const { userId } = req.params;
		console.log("Requested userId:", userId);

		// Foydalanuvchini tekshirish
		const user = await User.findById(userId);
		console.log("Found user:", user);

		if (!user) {
			return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
		}

		console.log("Profile picture data:", user.profilePicture);

		// Profil rasmi mavjudligini tekshirish
		if (!user.profilePicture || !user.profilePicture.path) {
			return res.status(404).json({ error: "Profil rasmi mavjud emas" });
		}

		// Fayl path ni olish
		const filePath = path.join(process.cwd(), user.profilePicture.path);
		console.log("File path:", filePath);

		// Fayl mavjudligini tekshirish
		try {
			await fs.access(filePath);
		} catch (error) {
			return res.status(404).json({ error: "Profil rasmi topilmadi" });
		}

		// Contentni browser keshlamasligi uchun header
		res.setHeader("Cache-Control", "no-cache");
		// Content type o'rnatish
		res.setHeader("Content-Type", user.profilePicture.mimetype);

		// Faylni yuborish
		res.sendFile(filePath);
	} catch (error) {
		console.error("Profil rasmini olishda xatolik:", error);
		res.status(500).json({ error: "Serverda xatolik yuz berdi" });
	}
};
