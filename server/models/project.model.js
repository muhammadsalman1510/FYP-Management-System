import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Project title is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        supervisorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // assigned later; can be unassigned at any stage
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        status: {
            type: String,
            enum: {
                values: ["available", "assigned", "completed"],
                message: '"{VALUE}" is not a valid project status',
            },
            default: "available",
        },
        maxStudents: {
            type: Number,
            required: [true, "maxStudents is required"],
            min: [1, "maxStudents must be at least 1"],
        },
    },
    {
        timestamps: true,
    }
);

// Index for quick lookup by supervisor and status
projectSchema.index({ supervisorId: 1, status: 1 });

export default mongoose.model("Project", projectSchema);