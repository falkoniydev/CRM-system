import express from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  
} from "../controllers/customerController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Create new customer - faqat admin qo'sha oladi
router.post("/", authMiddleware, roleMiddleware(["admin"]), createCustomer);

// Get all customers - faqat admin va teacher ko'ra oladi
router.get("/", authMiddleware, roleMiddleware(["admin", "teacher"]), getAllCustomers);

// Get single customer - admin va teacher ham ko'ra oladi, student faqat o'zini ko'radi
router.get("/:id", authMiddleware, async (req, res, next) => {
  if (req.user.role === "student" && req.params.id !== req.user.id) {
    return res.status(403).json({ error: "Access denied: Unauthorized user" });
  }
  next();
}, getCustomerById);

// Update customer - faqat admin yangilashi mumkin
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateCustomer);

// Delete customer - faqat admin o'chirishi mumkin
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteCustomer);

export default router;
