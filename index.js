import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

// `dotenv` konfiguratsiyasi
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes); // Auth marshrutlari (signup, login, va boshqalar)
app.use("/api/users", userRoutes); // Foydalanuvchi marshrutlari (CRUD)
app.use("/api/customers", customerRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tasks", commentRoutes);

// MongoDB ulanishi
mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB connection error:", err));

// Simple API
app.get("/", (req, res) => {
	res.send("Mini CRM backend is running!");
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
