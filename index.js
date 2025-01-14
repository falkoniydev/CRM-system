import express from "express";
import mongoose from "mongoose"; // MongoDB uchun
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan"; // Logger
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import { monitorTasks } from "./utils/scheduler.js";
import fileRoutes from "./routes/fileRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { Server } from "socket.io";
import { swaggerDocs } from "./swagger.js";
import http from "http";

// `dotenv` konfiguratsiyasi
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: [
			"http://localhost:3000", // localhosts
			"https://yourfrontend.com", // Frontend
			"https://crm-system.onrender.com", // production server
		], // Frontend URL
		methods: ["GET", "POST", "PUT", "DELETE"],
	},
});

// Real-time funksiyalar
io.on("connection", (socket) => {
	console.log(`User connected: ${socket.id}`);

	// Task statusini yangilash event
	socket.on("updateTaskStatus", (data) => {
		console.log("Task updated:", data);
		io.emit("taskStatusUpdated", data); // Hammasiga yuborish
	});

	// Foydalanuvchi uzilganida
	socket.on("disconnect", () => {
		console.log(`User disconnected: ${socket.id}`);
	});
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: ["http://localhost:3000", "https://yourfrontend.com"],
	})
);
app.use(morgan("dev")); // Logger

// Routes
app.use("/api/auth", authRoutes); // Auth marshrutlari
app.use("/api/users", userRoutes); // Foydalanuvchi marshrutlari
app.use("/api/customers", customerRoutes); // Customer management
app.use("/api/tasks", taskRoutes); // Task management
app.use("/api/comments", commentRoutes); // Comment management
app.use("/api/activity-logs", activityLogRoutes); // Activity log
app.use("/api/files", fileRoutes);
app.use("/api/stats", statsRoutes); // Foydalanuvchi faoliyati statistikasi uchun marshrut
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));

// Task monitoringni ishga tushirish
monitorTasks();

// MongoDB ulanishi
const mongooseURI =
	process.env.NODE_ENV === "production"
		? process.env.MONGO_URI // Production uchun masofaviy MongoDB
		: "mongodb://127.0.0.1:27017/mini_crm_db"; // Lokal uchun

mongoose
	.connect(mongooseURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 2000, // 2 soniya
		socketTimeoutMS: 45000, // 45 soniya
	})
	.then(() => console.log("MongoDB connected successfully!"))
	.catch((err) => console.error("MongoDB connection error:", err));

// Simple API
app.get("/", (req, res) => {
	res.send("Mini CRM backend is running!");
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Something went wrong!" });
});

// Server port
const PORT = process.env.PORT || 5000;

const BASE_URL = process.env.BASE_URL;

// Swagger-ni ishga tushirish
swaggerDocs(app, PORT);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
