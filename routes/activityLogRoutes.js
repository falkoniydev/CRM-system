import express from "express";
import { getActivityLogs } from "../controllers/activityLogController.js";

const router = express.Router();

// Loglarni olish
router.get("/", getActivityLogs);

export default router;
