import mongoose from "mongoose";
import Task from "../models/Task.js";

export const getUserActivityStats = async (req, res) => {
	try {
		const userId = req.user.id;

		console.log("User ID:", userId); // Log foydalanuvchi ID'sini

		const stats = await Task.aggregate([
			{
				$match: {
					$or: [
						{ createdBy: new mongoose.Types.ObjectId(userId) }, // new bilan ishlatildi
						{ assignedTo: new mongoose.Types.ObjectId(userId) }, // new bilan ishlatildi
					],
				},
			},
			{
				$group: {
					_id: null,
					totalTasks: { $sum: 1 },
					completedTasks: {
						$sum: {
							$cond: [{ $eq: ["$status", "completed"] }, 1, 0],
						},
					},
					pendingTasks: {
						$sum: {
							$cond: [{ $ne: ["$status", "completed"] }, 1, 0],
						},
					},
				},
			},
		]);

		console.log("Stats:", stats); // Log statistik ma'lumotlar

		const userStats = stats.length
			? stats[0]
			: {
					totalTasks: 0,
					completedTasks: 0,
					pendingTasks: 0,
			  };

		res.status(200).json({
			message: "User activity stats retrieved",
			stats: {
				userId,
				...userStats,
			},
		});
	} catch (error) {
		console.error("Error retrieving user activity stats:", error); // Xatolikni loglash
		res.status(500).json({ error: "Failed to retrieve stats" });
	}
};

// FOR DIAGRAM STATISTCS 

// STATUS
export const getTaskStatusStats = async (req, res) => {
	try {
		const stats = await Task.aggregate([
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		res.status(200).json({
			message: "Task status statistics retrieved successfully",
			stats,
		});
	} catch (error) {
		console.error("Error retrieving task status statistics:", error);
		res
			.status(500)
			.json({ error: "Failed to retrieve task status statistics" });
	}
};


// OVERTIME
export const getTasksOverTime = async (req, res) => {
    try {
        const stats = await Task.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 } // Sana bo'yicha o'sish tartibida
            }
        ]);

        res.status(200).json({
            message: "Tasks over time statistics retrieved successfully",
            stats,
        });
    } catch (error) {
        console.error("Error retrieving tasks over time statistics:", error);
        res.status(500).json({ error: "Failed to retrieve tasks over time statistics" });
    }
};
