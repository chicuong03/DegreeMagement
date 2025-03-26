import { connectToDatabase } from '@/lib/mongodb';
import Degree from '@/models/DegreeSchema';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Lấy degreeNumber từ query params
        const { searchParams } = new URL(request.url);
        const degreeNumber = searchParams.get('degreeNumber');

        // Kiểm tra nếu không có degreeNumber
        if (!degreeNumber) {
            return NextResponse.json(
                { success: false, message: 'Vui lòng cung cấp degreeNumber' },
                { status: 400 }
            );
        }

        // Kết nối đến database bằng hàm kết nối có sẵn
        await connectToDatabase();

        // Tìm degree dựa vào degreeNumber
        const degree = await Degree.findOne({ degreeNumber });

        // Nếu không tìm thấy degree
        if (!degree) {
            return NextResponse.json(
                { success: false, message: 'Không tìm thấy thông tin bằng cấp với mã đã cung cấp' },
                { status: 404 }
            );
        }

        // Trả về kết quả nếu tìm thấy
        return NextResponse.json({
            success: true,
            data: degree
        });

    } catch (error) {
        console.error('Lỗi khi truy vấn dữ liệu:', error);
        return NextResponse.json(
            { success: false, message: 'Đã xảy ra lỗi khi xử lý yêu cầu' },
            { status: 500 }
        );
    }
}