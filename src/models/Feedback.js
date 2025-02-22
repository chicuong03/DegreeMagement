import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        message: { type: String, required: true },
    },
    { timestamps: true } //MongoDB tự động thêm `createdAt` và `updatedAt`
);

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
