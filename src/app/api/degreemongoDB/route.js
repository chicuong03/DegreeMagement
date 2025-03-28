
import { connectToDatabase } from '@/lib/mongodb';
import Degree from '@/models/DegreeSchema';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Kết nối đến cơ sở dữ liệu MongoDB
        await connectToDatabase();

        const data = await request.json();

        // Kiểm tra các trường bắt buộc
        const requiredFields = [
            'studentName',
            'university',
            'dateOfBirth',
            'graduationDate',
            'score',
            'grade',
            'degreeType',
            'degreeNumber',
            'nftId',
            'imageUri',
            'metadataUri'
        ];

        for (const field of requiredFields) {
            if (!data[field]) {
                return NextResponse.json(
                    { success: false, message: `Thiếu trường bắt buộc: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Kiểm tra mảng attributes
        if (!data.attributes || !Array.isArray(data.attributes) || data.attributes.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Thiếu hoặc định dạng không đúng của mảng attributes' },
                { status: 400 }
            );
        }

        // Xác nhận mỗi attribute có trait_type và value
        for (const attr of data.attributes) {
            if (!attr.trait_type || !attr.value) {
                return NextResponse.json(
                    { success: false, message: 'Mỗi attribute phải có trait_type và value' },
                    { status: 400 }
                );
            }
        }

        // Tạo document mới
        const newDegree = new Degree(data);

        // Lưu vào cơ sở dữ liệu
        const savedDegree = await newDegree.save();

        // Trả về kết quả thành công
        return NextResponse.json({
            success: true,
            message: 'Đã tạo bằng thành công',
            data: savedDegree
        }, { status: 201 });

    } catch (error) {
        console.error('Lỗi khi tạo bằng:', error);

        // Xử lý lỗi trùng lặp
        if (error.code === 11000) {
            return NextResponse.json({
                success: false,
                message: 'Dữ liệu bị trùng lặp',
                error: error.message
            }, { status: 409 });
        }

        // Xử lý lỗi validation
        if (error.name === 'ValidationError') {
            return NextResponse.json({
                success: false,
                message: 'Lỗi xác thực dữ liệu',
                error: error.message
            }, { status: 400 });
        }

        // Lỗi chung
        return NextResponse.json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectToDatabase();

        // Tìm tất cả bằng cấp từ MongoDB
        const degrees = await Degree.find().exec();

        if (!degrees.length) {
            return NextResponse.json({
                success: false,
                message: 'Không tìm thấy bằng cấp nào.'
            }, { status: 404 });
        }

        // Trả về tất cả các bằng cấp
        return NextResponse.json({
            success: true,
            degrees: degrees.map(degree => ({
                ...degree.toObject(),
                NFT: degree.NFT
            }))
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
