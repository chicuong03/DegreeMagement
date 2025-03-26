
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";


function validateInput(email, password) {
  const errors = {};


  // if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  //   errors.email = "Email không hợp lệ";
  // }


  if (!password || password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }

  return {
    success: Object.keys(errors).length === 0,
    errors
  };
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Validate dữ liệu
    const { email, password } = body;
    const validation = validateInput(email, password);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Dữ liệu không hợp lệ", errors: validation.errors },
        { status: 400 }
      );
    }

    // Find user tong data
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Thông tin đăng nhập không chính xác!" },
        { status: 401 }
      );
    }

    // Check pass sau khi hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu không chính xác!" },
        { status: 401 }
      );
    }

    // Create response cập nhật cooki
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
      },
    });

    // Set userRole cookie
    response.cookies.set("userRole", user.role.toLowerCase(), {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    // Đưa degreeNumber vào cookie
    response.cookies.set("degreeNumber", email, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 ngày
    });


    // Set userName cookie 
    response.cookies.set("userName", encodeURIComponent(user.name), {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 h
    });

    // Add userId cookie 
    response.cookies.set("userId", user._id.toString(), {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
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

export const dynamic = "force-dynamic";