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
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("StudentProfile", studentProfileSchema);