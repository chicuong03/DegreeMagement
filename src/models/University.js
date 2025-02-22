import mongoose from "mongoose";

const UniversitySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        email: { type: String, required: true },
        address: { type: String },
        representative: { type: String },
        isAuthorized: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.University || mongoose.model("University", UniversitySchema);
