import connectDB from "@/lib/mongodb";
import BlogPost from "@/models/Blog";
import { NextResponse } from "next/server";

export async function GET() {
    await connectDB();
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    return NextResponse.json(posts);
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        console.log("Data nhận được:", body);

        const { code, title, content } = body;
        if (!code || !title || !content) {
            return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
        }

        const newPost = new BlogPost({ code, title, content });
        await newPost.save();

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error("Lỗi server:", error);
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}