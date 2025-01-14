/**
 * @swagger
 * tags:
 *   name: Activity Logs
 *   description: Activity log management endpoints
 */

import express from "express";
import { getActivityLogs } from "../controllers/activityLogController.js";

const router = express.Router();

// Loglarni olish
/**
 * @swagger
 * /api/activity-logs:
 *   get:
 *     summary: Retrieve activity logs
 *     description: Get a list of all activity logs.
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved activity logs.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Server error.
 */
router.get("/", getActivityLogs);

export default router;
