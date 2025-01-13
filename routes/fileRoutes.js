import express from "express";
import multer from "multer";
import {
	uploadFile,
	downloadFile,
	deleteFile,
	getFileList,
} from "../controllers/fileController.js";

// Fayl yuklashni sozlash (10 MB limit)
const upload = multer({
	limits: {
		fileSize: 10 * 1024 * 1024, // 10 MB
	},
});

const router = express.Router();

// Fayl yuklash endpointi
router.post(
	"/upload",
	upload.single("file"),
	(req, res, next) => {
		console.log("Middleware orqali o'tdi!");
		next();
	},
	uploadFile
);

// Faylni yuklab olish endpointi
router.get("/download/:taskId/:filename", downloadFile);

// Faylni o'chirish endpointi
router.delete("/delete/:taskId/:filename", deleteFile);

// Task uchun yuklangan fayllar ro'yxatini olish endpointi
router.get("/list/:taskId", getFileList);

export default router;
