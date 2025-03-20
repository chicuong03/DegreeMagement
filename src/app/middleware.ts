import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const userRole = req.cookies.get('userRole')?.value;

    if (!userRole) {
        return NextResponse.redirect(new URL('/Auth', req.url));
    }

    return NextResponse.next(); // Tiếp tục truy cập nếu hợp lệ
}
export const config = {
    matcher: [
        // phải đăng nhập mới sài được mấy trang này
        '/admin/:path*',
        '/user/:path*',
        '/manage/:path*',
        '/createdegree/:path*',
        '/blogs/:path*',
    ],
};
