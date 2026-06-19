import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Task title is required"],
            trim: true,
        },
        instructions: {
            type: String,
            trim: true,
            default: "",
        },
        openDate: {
            type: Date,
            required: [true, "openDate is required"],
        },
        dueDate: {
            type: Date,
            required: [true, "dueDate is required"],
        },
        projectId: {
            type: ObjectId,
            ref: "Project",
            default: null, // null when targetScope is 'all'
        },
        createdBy: {
            type: ObjectId,
            ref: "User",
            required: [true, "createdBy is required"],
        },
        creatorRole: {
            type: String,
            enum: {
                values: ["supervisor", "coordinator"],
                message: '"{VALUE}" is not a valid creator role',
            },
            required: [true, "creatorRole is required"],
        },
        attachmentUrl: {
            type: String,
            default: null,
        },
        targetScope: {
            type: String,
            enum: {
                values: ["project", "all"],
                message: '"{VALUE}" is not a valid target scope',
            },
            default: "project",
        },
    },
    {
        timestamps: true,
    }
);

taskSchema.index({ projectId: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });

export default mongoose.model("Task", taskSchema);
