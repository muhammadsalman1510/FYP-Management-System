import mongoose from "mongoose";
import User from "./user.model.js";

const supervisorProfileSchema = new mongoose.Schema(
    {
        /**
         * ⚠️  VALIDATOR NOTICE
         * The role check validator below runs automatically on `.save()`.
         * If you use `findByIdAndUpdate` / `findOneAndUpdate` to change userId,
         * you MUST pass `{ runValidators: true, context: 'query' }` — otherwise
         * this validator is silently skipped and the role check will not be enforced.
         *
         * @example
         * await SupervisorProfile.findByIdAndUpdate(
         *   profileId,
         *   { userId: newUserId },
         *   { runValidators: true, context: 'query' }   // 👈 required
         * );
         */
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            unique: true, // one profile per supervisor
            validate: {
                validator: async function (userId) {
                    // Get the session from the calling context
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
         * ⚠️  VALIDATOR NOTICE
         * The currentProjects <= maxProjects validator below runs automatically on `.save()`.
         * If you use `findByIdAndUpdate` / `findOneAndUpdate` to increment currentProjects,
         * you MUST pass `{ runValidators: true, context: 'query' }` — otherwise
         * this validator is silently skipped and the cap will not be enforced.
         *
         * @example
         * await SupervisorProfile.findByIdAndUpdate(
         *   profileId,
         *   { $inc: { currentProjects: 1 } },
         *   { runValidators: true, context: 'query' }   // 👈 required
         * );
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

// Virtual: how many more projects this supervisor can take
supervisorProfileSchema.virtual("availableSlots").get(function () {
    return this.maxProjects - this.currentProjects;
});

// Convenience method: check if supervisor can take another project
supervisorProfileSchema.methods.canAcceptProject = function () {
    return this.currentProjects < this.maxProjects;
};

export default mongoose.model("SupervisorProfile", supervisorProfileSchema);