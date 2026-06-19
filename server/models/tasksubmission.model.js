import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const taskSubmissionSchema = new mongoose.Schema(
    {
        taskId: {
            type: ObjectId,
            ref: "Task",
            required: [true, "taskId is required"],
        },
        submittedBy: {
            type: ObjectId,
            ref: "User",
            required: [true, "submittedBy is required"],
        },
        projectId: {
            type: ObjectId,
            ref: "Project",
            required: [true, "projectId is required"],
        },
        fileUrl: {
            type: String,
            required: [true, "fileUrl is required"],
        },
        fileName: {
            type: String,
            required: [true, "fileName is required"],
            trim: true,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: {
                values: ["pending", "approved", "rejected"],
                message: '"{VALUE}" is not a valid submission status',
            },
            default: "pending",
        },
        feedback: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

taskSubmissionSchema.index({ taskId: 1 });
taskSubmissionSchema.index({ submittedBy: 1 });
taskSubmissionSchema.index({ projectId: 1 });
taskSubmissionSchema.index({ status: 1 });

export default mongoose.model("TaskSubmission", taskSubmissionSchema);
