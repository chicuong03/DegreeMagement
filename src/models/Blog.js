import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        publishedAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
