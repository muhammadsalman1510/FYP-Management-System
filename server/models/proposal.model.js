import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const groupMemberSchema = new mongoose.Schema(
    {
        name:       { type: String, required: true, trim: true },
        rollNumber: { type: String, required: true, trim: true },
        section:    { type: String, required: true, trim: true },
        email:      { type: String, required: true, trim: true, lowercase: true },
    },
    { _id: false }
);

const proposalSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Proposal title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        problemStatement: {
            type: String,
            required: [true, "Problem statement is required"],
            trim: true,
        },
        techStack: {
            type: String,
            trim: true,
            default: "",
        },
        groupMembers: {
            type: [groupMemberSchema],
            default: [],
        },
        supervisorName: {
            type: String,
            trim: true,
            default: "",
        },
        supervisorEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        submittedBy: {
            type: ObjectId,
            ref: "User",
            required: [true, "submittedBy is required"],
        },
        projectId: {
            type: ObjectId,
            ref: "Project",
            default: null,
        },
        attachmentUrl: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: {
                values: ["pending", "approved", "rejected"],
                message: '"{VALUE}" is not a valid proposal status',
            },
            default: "pending",
        },
        coordinatorFeedback: {
            type: String,
            default: "",
        },
        supervisorRecommendation: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        supervisorFeedback: {
            type: String,
            default: '',
        },
        supervisorReviewedAt: {
            type: Date,
            default: null,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

proposalSchema.index({ submittedBy: 1 });
proposalSchema.index({ status: 1 });
proposalSchema.index({ supervisorEmail: 1 });

export default mongoose.model("Proposal", proposalSchema);
