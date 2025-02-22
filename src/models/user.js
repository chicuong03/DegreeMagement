import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        id: { type: String },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "student", "university", "recruiter"], default: "student" },
    },
    { timestamps: true }
);

// Trước khi lưu, tự động gán `id = _id`
UserSchema.pre("save", function (next) {
    this.id = this._id.toString();
    next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
