// controllers/paymentController.js
import Payment from "../models/Payment.js";
import Customer from "../models/Customer.js";
import Course from "../models/Course.js";
import { logActivity } from "../utils/logActivity.js";
import { sendEmail } from "../utils/emailNotifications.js";

// Create payment
export const createPayment = async (req, res) => {
    try {
        const { customerId, courseId, amount, type, description } = req.body;

        // Customer va Course mavjudligini tekshirish
        const customer = await Customer.findOne({ _id: customerId, isActive: true });
        if (!customer) {
            return res.status(404).json({ error: "Talaba topilmadi" });
        }

        const course = await Course.findOne({ _id: courseId, isActive: true });
        if (!course) {
            return res.status(404).json({ error: "Kurs topilmadi" });
        }

        const payment = new Payment({
            customer: customerId,
            course: courseId,
            amount,
            type,
            description,
            processedBy: req.user.id
        });

        await payment.save();
        
        // Customer ga to'lovni qo'shish
        customer.payments.push({
            amount,
            date: new Date(),
            course: courseId,
            type,
            status: "pending"
        });
        await customer.save();

        await payment.populate([
            { path: 'customer', select: 'name email phone' },
            { path: 'course', select: 'name' },
            { path: 'processedBy', select: 'name' }
        ]);

        // Log yozish
        await logActivity(
            "payment_created",
            "Payment",
            payment._id,
            req.user.id,
            `Payment created for ${customer.name}: ${amount} (${type})`
        );

        // Email yuborish
        if (customer.email) {
            const subject = "To'lov qabul qilindi";
            const text = `Hurmatli ${customer.name},\n\n` +
                        `${course.name} kursi uchun ${amount} so'mlik to'lovingiz qabul qilindi.\n` +
                        `To'lov turi: ${type}\n` +
                        `Status: Kutilmoqda\n\n` +
                        `Hurmat bilan,\nIT Center`;
            await sendEmail(customer.email, subject, text);
        }

        res.status(201).json({
            message: "To'lov muvaffaqiyatli yaratildi",
            payment
        });

    } catch (error) {
        console.error("To'lov yaratishda xatolik:", error);
        res.status(400).json({ error: error.message });
    }
};

// Get all payments with filtering
export const getAllPayments = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            customerId,
            courseId,
            status,
            type,
            startDate,
            endDate,
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        // Filter
        const filter = { isActive: true };
        
        if (customerId) filter.customer = customerId;
        if (courseId) filter.course = courseId;
        if (status) filter.status = status;
        if (type) filter.type = type;
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Sort
        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        const payments = await Payment.find(filter)
            .populate('customer', 'name email phone')
            .populate('course', 'name')
            .populate('processedBy', 'name')
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments(filter);

        res.json({
            payments,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("To'lovlarni olishda xatolik:", error);
        res.status(500).json({ error: error.message });
    }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findOne({ 
            _id: req.params.id,
            isActive: true 
        })
        .populate('customer', 'name email phone')
        .populate('course', 'name')
        .populate('processedBy', 'name')
        .populate('notes.createdBy', 'name');

        if (!payment) {
            return res.status(404).json({ error: "To'lov topilmadi" });
        }

        res.json(payment);

    } catch (error) {
        console.error("To'lovni olishda xatolik:", error);
        res.status(500).json({ error: error.message });
    }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const payment = await Payment.findOne({ 
            _id: req.params.id,
            isActive: true 
        });

        if (!payment) {
            return res.status(404).json({ error: "To'lov topilmadi" });
        }

        // Status o'zgarishi
        payment.status = status;
        if (status === 'paid') {
            payment.paidAt = new Date();
        }

        await payment.save();
        await payment.populate([
            { path: 'customer', select: 'name email' },
            { path: 'course', select: 'name' }
        ]);

        // Customer modelidagi to'lovni ham yangilash
        const customer = await Customer.findById(payment.customer);
        if (customer) {
            const paymentIndex = customer.payments.findIndex(
                p => p.course.toString() === payment.course.toString() &&
                p.amount === payment.amount
            );
            if (paymentIndex !== -1) {
                customer.payments[paymentIndex].status = status;
                await customer.save();
            }
        }

        // Log yozish
        await logActivity(
            "payment_status_updated",
            "Payment",
            payment._id,
            req.user.id,
            `Payment status updated to ${status}`
        );

        // Email yuborish
        if (payment.customer.email) {
            const subject = "To'lov statusi yangilandi";
            const text = `Hurmatli ${payment.customer.name},\n\n` +
                        `${payment.course.name} kursi uchun to'lovingiz statusi yangilandi: ${status}\n` +
                        `Summa: ${payment.amount}\n\n` +
                        `Hurmat bilan,\nIT Center`;
            await sendEmail(payment.customer.email, subject, text);
        }

        res.json({
            message: "To'lov statusi yangilandi",
            payment
        });

    } catch (error) {
        console.error("To'lov statusini yangilashda xatolik:", error);
        res.status(400).json({ error: error.message });
    }
};

// Add note to payment
export const addPaymentNote = async (req, res) => {
    try {
        const { content } = req.body;

        const payment = await Payment.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            {
                $push: {
                    notes: {
                        content,
                        createdBy: req.user.id
                    }
                }
            },
            { new: true }
        ).populate('notes.createdBy', 'name');

        if (!payment) {
            return res.status(404).json({ error: "To'lov topilmadi" });
        }

        res.json({
            message: "Izoh qo'shildi",
            note: payment.notes[payment.notes.length - 1]
        });

    } catch (error) {
        console.error("To'lovga izoh qo'shishda xatolik:", error);
        res.status(400).json({ error: error.message });
    }
};

// Delete payment (soft delete)
export const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            { isActive: false },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ error: "To'lov topilmadi" });
        }

        // Log yozish
        await logActivity(
            "payment_deleted",
            "Payment",
            payment._id,
            req.user.id,
            `Payment deleted`
        );

        res.json({ message: "To'lov o'chirildi" });

    } catch (error) {
        console.error("To'lovni o'chirishda xatolik:", error);
        res.status(500).json({ error: error.message });
    }
};