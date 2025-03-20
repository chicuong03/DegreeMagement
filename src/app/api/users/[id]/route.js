import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs"; // 
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// API xóa người dùng theo ID

export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "ID không hợp lệ!" }, { status: 400 });
        }

        await connectToDatabase();
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return NextResponse.json({ success: false, message: "Không tìm thấy người dùng!" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Xóa người dùng thành công!" }, { status: 200 });

    } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        return NextResponse.json({ success: false, message: "Lỗi máy chủ!" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = params;
        const { name, email, role, password } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "ID không hợp lệ!" }, { status: 400 });
        }

        await connectToDatabase();

        // has mật khẩu mới
        let updatedFields = { name, email, role };
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedFields.password = hashedPassword;
        }

        // Cập nhật tt
        const updatedUser = await User.findByIdAndUpdate(id, updatedFields, { new: true });

        if (!updatedUser) {
            return NextResponse.json({ success: false, message: "Không tìm thấy người dùng!" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Cập nhật thành công!", user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error("Lỗi khi cập nhật người dùng:", error);
        return NextResponse.json({ success: false, message: "Lỗi máy chủ!" }, { status: 500 });
    }
}