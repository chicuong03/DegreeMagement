import { connectToDatabase } from '@/lib/mongodb';
import Degree from '@/models/DegreeSchema';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        // Kết nối tới database MongoDB
        await connectToDatabase();

        // Lấy tham số tìm kiếm từ URL
        const url = new URL(req.url);
        const degreeNumber = url.searchParams.get('degreeNumber');
        const university = url.searchParams.get('university');

        let query = {};

        // Tìm kiếm theo số hiệu bằng cấp (degreeNumber)
        if (degreeNumber) {
            query.degreeNumber = degreeNumber;
        }

        // Tìm kiếm theo tên trường (university)
        if (university) {
            query.university = { $regex: university, $options: 'i' };
        }

        // Truy vấn MongoDB với các điều kiện
        const degrees = await Degree.find(query).exec();

        if (!degrees.length) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy bằng cấp nào với thông tin tìm kiếm đã cho.'
            }, { status: 404 });
        }

        // Trả về kết quả tìm kiếm
        return NextResponse.json({
            success: true,
            degrees
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn MongoDB:', error);
        return NextResponse.json({
            success: false,
            error: 'Lỗi khi truy vấn MongoDB',
            details: error instanceof Error ? error.message : 'Lỗi không xác định'
        }, { status: 500 });
    }
}