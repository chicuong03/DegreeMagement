import { connectToDatabase } from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { success: false, message: "Vui lòng điền đầy đủ thông tin!" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const newFeedback = await Feedback.create({ name, email, message });

        return NextResponse.json(
            { success: true, message: "Gửi phản hồi thành công!", feedback: newFeedback },
            { status: 201 }
        );
    } catch (error) {
        console.error("Lỗi khi gửi phản hồi:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi máy chủ, vui lòng thử lại sau!" },
            { status: 500 }
        );
    }
}

// 🔹 Lấy tất cả phản hồi
export async function GET() {
    try {
        await connectToDatabase();
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });

        return NextResponse.json({ success: true, feedbacks }, { status: 200 });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách phản hồi:", error);
        return NextResponse.json(
            { success: false, message: "Không thể lấy danh sách phản hồi!" },
            { status: 500 }
        );
    }
}
