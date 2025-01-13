import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async (
	actionType,
	entity,
	entityId,
	performedBy
) => {
	try {
		await ActivityLog.create({
			actionType,
			entity,
			entityId,
			performedBy,
		});
	} catch (error) {
		console.error("Activity log yozishda xato:", error.message);
	}
};
