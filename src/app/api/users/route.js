import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";


export async function GET() {
    await connectToDatabase();
    const users = await User.find();
    return NextResponse.json(users);
}


export async function POST(req) {
    await connectToDatabase();
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
        return NextResponse.json({ error: "Thiếu thông tin!" }, { status: 400 });
    }

    const newUser = new User({ name, email, password, role });
    await newUser.save();
    return NextResponse.json({ message: "Người dùng đã được tạo!" });
}


export async function DELETE(req) {
    await connectToDatabase();
    const { id } = await req.json();
    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: "Người dùng đã bị xóa!" });
}
