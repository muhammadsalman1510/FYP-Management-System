import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const milestoneSchema = new mongoose.Schema(
    {
        id:          { type: Number, required: true },
        name:        { type: String, required: true },
        description: { type: String, default: "" },
        completed:   { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
    },
    { _id: false }
);

const DEFAULT_MILESTONES = [
    { id: 1, name: "Project Proposal",   description: "Proposal submitted and approved by coordinator.", completed: false, completedAt: null },
    { id: 2, name: "Project Defense",    description: "Initial defense presented to supervisor and coordinator.", completed: false, completedAt: null },
    { id: 3, name: "Implementation",     description: "Core development and implementation phase.", completed: false, completedAt: null },
    { id: 4, name: "Documentation",      description: "Full project documentation submitted.", completed: false, completedAt: null },
    { id: 5, name: "Final Presentation", description: "Final project presented and signed off.", completed: false, completedAt: null },
];

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
        supervisors: [
            {
                type: ObjectId,
                ref: "User",
            }
        ],
        coordinator: {
            type: ObjectId,
            ref: "User",
            default: null,
        },
        students: [
            {
                type: ObjectId,
                ref: "User",
            }
        ],
        status: {
            type: String,
            enum: {
                values: ["pending_proposal", "active", "completed"],
                message: '"{VALUE}" is not a valid project status',
            },
            default: "pending_proposal",
        },
        maxStudents: {
            type: Number,
            required: [true, "maxStudents is required"],
            min: [1, "maxStudents must be at least 1"],
        },
        milestones: {
            type: [milestoneSchema],
            default: () => DEFAULT_MILESTONES.map(m => ({ ...m })),
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        proposalId: {
            type: ObjectId,
            ref: "Proposal",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

projectSchema.index({ supervisors: 1 });
projectSchema.index({ students: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ coordinator: 1 });

export default mongoose.model("Project", projectSchema);
