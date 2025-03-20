import { cookies } from "next/headers";

export function getSession(req) {
    try {
        // Sử dụng cookies() 
        const cookieStore = cookies();
        const userId = cookieStore.get("userId")?.value;
        const userRole = cookieStore.get("userRole")?.value;

        if (!userId || !userRole) return null;

        return {
            userId: userId,
            user: { id: userId, role: userRole }
        };
    } catch (error) {
        console.error("Lỗi khi lấy session:", error);
        return null;
    }
}