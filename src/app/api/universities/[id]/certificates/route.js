import { connectToDatabase } from "@/lib/mongodb";
import Certificate from "@/models/Certificate";
import { NextResponse } from "next/server";

// Lấy danh sách bằng cấp của một trường
export async function GET(req, { params }) {
    await connectToDatabase();
    const { id } = params; // ID của trường đại học

    if (!id) {
        return NextResponse.json({ error: "Thiếu ID trường đại học!" }, { status: 400 });
    }

    try {
        const certificates = await Certificate.find({ university: id }).populate("university");
        return NextResponse.json(certificates);
    } catch (error) {
        return NextResponse.json({ error: "Lỗi khi lấy danh sách bằng cấp!" }, { status: 500 });
    }
}
