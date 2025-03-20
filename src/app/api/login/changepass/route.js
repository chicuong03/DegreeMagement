
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await connectToDatabase();

        // Lấy cookies trực tiếp
        const cookieStore = cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "Bạn chưa đăng nhập!"
            }, { status: 200 });
        }

        const { currentPassword, newPassword } = await request.json();

        // Tìm user trong database
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Người dùng không tồn tại!"
            }, { status: 200 });
        }

        // Kiểm tra mật khẩu hiện tại
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({
                success: false,
                message: "Mật khẩu hiện tại không chính xác!"
            }, { status: 200 });
        }

        // Hash mật khẩu mới
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return NextResponse.json({
            success: true,
            message: " Mật khẩu đã được cập nhật thành công!"
        });
    } catch (error) {
        console.error("Lỗi đổi mật khẩu:", error);
        return NextResponse.json({
            success: false,
            message: " Có lỗi xảy ra khi đổi mật khẩu!"
        }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";