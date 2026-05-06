import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: [true, "Project reference is required"],
        },
        /**
         * ⚠️  VALIDATOR NOTICE
         * The maxStudents validator below runs automatically on `.save()`.
         * If you use `findByIdAndUpdate` / `findOneAndUpdate` to push students,
         * you MUST pass `{ runValidators: true, context: 'query' }` — otherwise
         * this validator is silently skipped and the limit will not be enforced.
         *
         * @example
         * await Group.findByIdAndUpdate(
         *   groupId,
         *   { $push: { studentIds: newStudentId } },
         *   { runValidators: true, context: 'query' }   // 👈 required
         * );
         */
        studentIds: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
            default: [],
        },
        status: {
            type: String,
            enum: {
                values: ["forming", "submitted", "approved", "locked"],
                message: '"{VALUE}" is not a valid group status',
            },
            default: "forming",
        },
    },
    {
        timestamps: true,
    }
);

// A project should only have one non-rejected group (optional unique guard)
groupSchema.index({ projectId: 1, status: 1 });

export default mongoose.model("Group", groupSchema);