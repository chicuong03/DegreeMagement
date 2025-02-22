import { connectToDatabase } from "@/lib/mongodb";
import Certificate from "@/models/Certificate";
import { NextResponse } from "next/server";

// 📌 Lấy thông tin chi tiết của một bằng cấp
export async function GET(req, { params }) {
    await connectToDatabase();
    const { id } = params; // 📌 Lấy degreeId từ URL

    if (!id) {
        return NextResponse.json({ error: "Thiếu mã bằng cấp!" }, { status: 400 });
    }

    try {
        const degree = await Certificate.findById(id).populate("university");
        if (!degree) {
            return NextResponse.json({ error: "Không tìm thấy bằng cấp!" }, { status: 404 });
        }
        return NextResponse.json(degree);
    } catch (error) {
        return NextResponse.json({ error: "Lỗi khi lấy bằng cấp!" }, { status: 500 });
    }
}
