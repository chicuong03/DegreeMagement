// src/app/api/pinata/route.ts
import { uploadFileToPinata, uploadMetadataToPinata } from '@/lib/pinata';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy file' },
                { status: 400 }
            );
        }

        // Lấy thông tin từ form
        const studentName = formData.get('studentName') as string;
        const university = formData.get('university') as string;
        const dateOfBirth = formData.get('dateOfBirth') as string;
        const graduationDate = formData.get('graduationDate') as string;
        const score = formData.get('score') as string;
        const grade = formData.get('grade') as string;

        // Tạo thư mục temp nếu chưa tồn tại
        const tempDir = path.join(process.cwd(), 'tmp');
        try {
            await mkdir(tempDir, { recursive: true });
        } catch (error) {
            if ((error as any).code !== 'EEXIST') {
                console.error('Lỗi khi tạo thư mục temp:', error);
                return NextResponse.json(
                    { success: false, error: 'Không thể tạo thư mục tạm thời' },
                    { status: 500 }
                );
            }
        }

        // Tạo file tạm
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempFilePath = path.join(tempDir, `tmp-${Date.now()}-${file.name}`);

        try {
            await writeFile(tempFilePath, buffer);
        } catch (error) {
            console.error('Lỗi khi ghi file tạm:', error);
            return NextResponse.json(
                { success: false, error: 'Không thể xử lý file tải lên' },
                { status: 500 }
            );
        }

        try {
            // Upload ảnh lên IPFS
            const imageHash = await uploadFileToPinata(
                tempFilePath,
                `Degree-Image-${studentName}`
            );

            // Tạo và upload metadata
            const metadata = {
                name: studentName,
                description: `Xác nhận bằng cấp của: ${studentName} || Từ trường: ${university} || Ngày sinh: ${dateOfBirth} || Ngày tốt nghiệp: ${graduationDate} || Điểm: ${score} || Xếp loại: ${grade}`,
                image: `ipfs://${imageHash}`,
                attributes: {
                    studentName,
                    university,
                    dateOfBirth,
                    graduationDate,
                    score,
                    grade,
                },
            };


            const metadataHash = await uploadMetadataToPinata(metadata);

            // Trả về kết quả thành công
            return NextResponse.json({
                success: true,
                metadataUri: `ipfs://${metadataHash}`,
                imageUri: `ipfs://${imageHash}`,
            });

        } catch (error) {
            console.error('Lỗi khi upload lên Pinata:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Lỗi khi upload lên Pinata',
                    details: error instanceof Error ? error.message : 'Lỗi không xác định'
                },
                { status: 500 }
            );
        } finally {
            // Xóa file tạm trong mọi trường hợp
            try {
                await unlink(tempFilePath);
            } catch (error) {
                console.error('Lỗi khi xóa file tạm:', error);
                // Tiếp tục thực thi vì đây không phải lỗi nghiêm trọng
            }
        }

    } catch (error) {
        console.error('Lỗi trong API route:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Lỗi server khi xử lý upload',
                details: error instanceof Error ? error.message : 'Lỗi không xác định'
            },
            { status: 500 }
        );
    }
}