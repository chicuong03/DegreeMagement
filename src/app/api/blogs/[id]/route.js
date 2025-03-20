import connectDB from "@/lib/mongodb";
import BlogPost from "@/models/Blog";
import { NextResponse } from "next/server";


export async function DELETE(req, { params }) {
    await connectDB();
    const { id } = params;
    if (!id) return NextResponse.json({ error: "Missing post ID" }, { status: 400 });

    await BlogPost.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" });
}


export async function PUT(req, { params }) {
    await connectDB();
    const { id } = params;
    const { title, content } = await req.json();

    if (!id || !title || !content) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(id, { title, content, updatedAt: new Date() }, { new: true });
    return NextResponse.json(updatedPost);
}
export async function GET(req, { params }) {
    await connectDB();
    const { id } = params;

    try {
        const blog = await BlogPost.findById(id);
        if (!blog) return NextResponse.json({ error: "Bài viết không tồn tại" }, { status: 404 });

        return NextResponse.json(blog);
    } catch (error) {
        return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }
}