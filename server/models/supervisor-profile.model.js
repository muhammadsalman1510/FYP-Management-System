import mongoose from "mongoose";
import User from "./user.model.js";

const supervisorProfileSchema = new mongoose.Schema(
    {
        /**
         * validator note: runs automatically on .save().
         * for findByIdAndUpdate, pass { runValidators: true, context: 'query' }
         * or the role check is silently skipped.
         */
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            unique: true,
            validate: {
                validator: async function (userId) {
                    const session = this.$session();
                    const user = await User.findById(userId).session(session ?? null);
                    return user && user.role === 'supervisor';
                },
                message: "userId must reference a user with role 'supervisor'"
            },
        },
        department: {
            type: String,
            required: [true, "Department is required"],
            trim: true,
        },
        designation: {
            type: String,
            required: [true, "Designation is required"],
            trim: true,
        },
        maxProjects: {
            type: Number,
            required: [true, "maxProjects is required"],
            min: [0, "maxProjects cannot be negative"],
        },
        /**
         * validator note: runs automatically on .save().
         * for findByIdAndUpdate that increments currentProjects, pass { runValidators: true, context: 'query' }
         * or the cap is silently skipped.
         */
        currentProjects: {
            type: Number,
            default: 0,
            min: [0, "currentProjects cannot be negative"],
            validate: {
                validator: function (value) {
                    return value <= this.maxProjects;
                },
                message: "currentProjects cannot exceed maxProjects",
            },
        },
    },
    {
        timestamps: true,
    }
);

supervisorProfileSchema.virtual("availableSlots").get(function () {
    return this.maxProjects - this.currentProjects;
});

supervisorProfileSchema.methods.canAcceptProject = function () {
    return this.currentProjects < this.maxProjects;
};

export default mongoose.model("SupervisorProfile", supervisorProfileSchema);