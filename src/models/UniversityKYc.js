
const mongoose = require("mongoose");

const UniversityKYCSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Tên trường
    registrationNumber: { type: String, required: true, unique: true }, // Mã số đăng ký
    email: { type: String, required: true, unique: true }, // Email liên hệ
    phone: { type: String, required: true }, // Số điện thoại
    address: { type: String, required: true }, // Địa chỉ trụ sở
    representative: {
        name: { type: String, required: true },
        position: { type: String, required: true }
    }, // Người đại diện
    documents: {
        license: { type: String, required: true }, // Link ảnh giấy phép đăng ký
        idCard: { type: String, required: true } // Link ảnh CMND/CCCD
    },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }, // Trạng thái KYC
    createdAt: { type: Date, default: Date.now }
});

// Kiểm tra nếu model đã tồn tại, nếu chưa thì tạo mới
module.exports = mongoose.models.UniversityKYC || mongoose.model("UniversityKYC", UniversityKYCSchema);
