import express from "express";
import {
	signup,
	verifyEmail,
	login,
	forgotPassword,
	resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Signup - No middleware required
router.post("/signup", signup);

// Verify
router.get("/verify-email", verifyEmail);

// Login - No middleware required
router.post("/login", login);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.post("/reset-password", resetPassword);



export default router;
