import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
    {
        action: { type: String, required: true },
        certificate: {
            type: Number,
            required: true
        },
        performed_by: {
            type: String,
            required: true
        },
        timestamp: { type: Date, default: Date.now }
    }
);


const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

export default AuditLog;