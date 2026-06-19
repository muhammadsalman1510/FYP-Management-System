import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const documentSchema = new mongoose.Schema(
    {
        projectId: {
            type: ObjectId,
            ref: "Project",
            required: [true, "projectId is required"],
        },
        uploadedBy: {
            type: ObjectId,
            ref: "User",
            required: [true, "uploadedBy is required"],
        },
        type: {
            type: String,
            enum: {
                values: [
                    "Proposal",
                    "Literature Review",
                    "Progress Report",
                    "Implementation",
                    "Screenshots",
                    "Final Report",
                    "Other",
                ],
                message: '"{VALUE}" is not a valid document type',
            },
            required: [true, "Document type is required"],
        },
        fileName: {
            type: String,
            required: [true, "fileName is required"],
            trim: true,
        },
        fileUrl: {
            type: String,
            required: [true, "fileUrl is required"],
        },
        size: {
            type: String,
            default: "",
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

documentSchema.index({ projectId: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ type: 1 });

export default mongoose.model("Document", documentSchema);
