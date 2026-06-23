import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const meetingSchema = new mongoose.Schema(
    {
        requestedBy: {
            type: ObjectId,
            ref: "User",
            required: [true, "requestedBy is required"],
        },
        requestedTo: {
            type: ObjectId,
            ref: "User",
            required: [true, "requestedTo is required"],
        },
        projectId: {
            type: ObjectId,
            ref: "Project",
            default: null,
        },
        proposedDate: {
            type: Date,
            required: [true, "proposedDate is required"],
        },
        proposedTime: {
            type: String,
            required: [true, "proposedTime is required"],
            trim: true,
        },
        topic: {
            type: String,
            required: [true, "topic is required"],
            trim: true,
        },
        status: {
            type: String,
            enum: {
                values: ["pending", "approved", "rejected"],
                message: '"{VALUE}" is not a valid meeting status',
            },
            default: "pending",
        },
        notes: {
            type: String,
            default: "",
        },
        location: {
            type: String,
            default: "",
        },
        meetingType: {
            type: String,
            enum: ["scheduled", "requested"],
            default: "requested",
        },
        studentReply: {
            type: String,
            default: "",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

meetingSchema.index({ requestedBy: 1 });
meetingSchema.index({ requestedTo: 1 });
meetingSchema.index({ projectId: 1 });
meetingSchema.index({ status: 1 });

export default mongoose.model("Meeting", meetingSchema);
