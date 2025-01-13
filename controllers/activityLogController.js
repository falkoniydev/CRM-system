import ActivityLog from "../models/ActivityLog.js";

export const getActivityLogs = async (req, res) => {
	try {
		const logs = await ActivityLog.find().populate("performedBy", "name email");
		res.json(logs);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
