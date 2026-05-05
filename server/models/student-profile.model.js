import mongoose from "mongoose";
import User from "./user.model.js";

const studentProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            unique: true, // one profile per student
            validate: {
                validator: async function (userId) {
                    // Get the session from the calling context
                    const session = this.$session();
                    const user = await User.findById(userId).session(session ?? null);
                    return user && user.role === 'student';
                },
                message: "userId must reference a user with role 'student'",
            },
        },
        rollNumber: {
            type: String,
            required: [true, "Roll number is required"],
            unique: true,
            trim: true,
        },
        program: {
            type: String,
            required: [true, "Program is required"],
            trim: true,
        },
        batch: {
            type: String,
            required: [true, "Batch is required"],
            trim: true,
        },
        semester: {
            type: Number,
            required: [true, "Semester is required"],
            min: [7, "Semester must be at least 7"],
            max: [8, "Semester cannot exceed 8"],
        },
        section: {
            type: String,
            required: [true, "Section is required"],
            trim: true,
        },
        supervisorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SupervisorProfile",
            default: null, // assigned later, not at registration
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("StudentProfile", studentProfileSchema);