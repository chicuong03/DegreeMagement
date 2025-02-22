import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
    {
        action: { type: String, required: true }, // Ví dụ: 'issue_certificate', 'approve_certificate'
        certificate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Certificate",
            required: true
        },
        performed_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        timestamp: { type: Date, default: Date.now }
    }
);

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
