import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
//  Xác thực dữ liệu đầu vào
const registerSchema = z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().min(1, "không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    role: z.enum(["admin", "student", "recruiter"]).default("student"),
});

export async function POST(request: Request) {
    try {
        //  Kết nối MongoDB
        await connectToDatabase();

        const body = await request.json();
        const validatedData = registerSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                { success: false, message: "Dữ liệu không hợp lệ", errors: validatedData.error.format() },
                { status: 400 }
            );
        }

        const { name, email, password, role } = validatedData.data;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "Email đã được sử dụng!" },
                { status: 400 }
            );
        }

        // Hash mật khẩu trước khi lưu vào DB
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();

        return NextResponse.json({
            success: true,
            message: "Đăng ký thành công!",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error("Lỗi API register:", error);
        return NextResponse.json(
            { success: false, message: "Đã có lỗi xảy ra, vui lòng thử lại sau!" },
            { status: 500 }
        );
    }
}



