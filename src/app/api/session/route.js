// src/app/api/session/route.js
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get("userId")?.value;
        const userRole = cookieStore.get("userRole")?.value;

        return NextResponse.json({
            success: userId && userRole ? true : false,
            user: userId && userRole ? { id: userId, role: userRole } : null,
            authenticated: userId && userRole ? true : false
        });
    } catch (error) {
        console.error("Lỗi khi lấy session:", error);
        return NextResponse.json({
            success: false,
            message: "Lỗi server",
            user: null,
            authenticated: false
        }, { status: 500 }); 1
    }
}

export const dynamic = "force-dynamic";