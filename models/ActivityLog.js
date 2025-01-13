import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
	actionType: {
		type: String,
		required: true,
	},
	entity: {
		type: String,
		required: true,
	},
	entityId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		refPath: "entity",
	},
	performedBy: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.model("ActivityLog", activityLogSchema);
