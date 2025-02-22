import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

// ✅ Xác thực dữ liệu đầu vào
const loginSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export async function POST(request: Request) {
    try {
        await connectToDatabase(); // ✅ Kết nối MongoDB
        const body = await request.json();

        // ✅ Xác thực dữ liệu đầu vào với `zod`
        const validatedData = loginSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json(
                { success: false, message: "Dữ liệu không hợp lệ", errors: validatedData.error.format() },
                { status: 400 }
            );
        }

        const { email, password } = validatedData.data;

        // 🔹 Tìm user trong MongoDB theo email
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Thông tin đăng nhập không chính xác!" },
                { status: 401 }
            );
        }

        // 🔹 Kiểm tra mật khẩu với `bcrypt`
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: "Mật khẩu không chính xác!" },
                { status: 401 }
            );
        }

        // 🔹 Tạo response và set cookie với role
        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role.toLowerCase(),
            },
        });

        response.cookies.set("userRole", user.role.toLowerCase(), {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 24 giờ
        });

        return response;
    } catch (error) {
        console.error("Lỗi trong API login:", error);
        return NextResponse.json(
            { success: false, message: "Đã có lỗi xảy ra, vui lòng thử lại sau!" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { message: "Please use POST method for login" },
        { status: 405 }
    );
}
