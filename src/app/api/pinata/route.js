
import { uploadFileToPinata, uploadMetadataToPinata } from '@/lib/pinata';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy file' },
                { status: 400 }
            );
        }

        // Lấy thông tin từ form
        const studentName = formData.get('studentName');
        const university = formData.get('university');
        const dateOfBirth = formData.get('dateOfBirth');
        const graduationDate = formData.get('graduationDate');
        const score = formData.get('score');
        const grade = formData.get('grade');
        const major = formData.get('major') || 'Không có dữ liệu';
        const studentAddress = formData.get('studentAddress');
        const degreeType = formData.get('degreeType') || 'Không xác định';
        const degreeNumber = formData.get('degreeNumber') || 'Không xác định';

        // Kiểm tra dữ liệu đầu vào
        if (!studentName || !university || !dateOfBirth || !graduationDate || !grade || !score) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            );
        }

        // Tạo thư mục temp nếu chưa tồn tại
        const tempDir = path.join(process.cwd(), 'tmp');
        try {
            await mkdir(tempDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
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
                `Degree-Image-${studentName}-${new Date().getTime()}`
            );

            // Tạo và upload metadata phù hợp với hợp đồng DegreeNFT
            const metadata = {
                name: `Bằng tốt nghiệp của ${studentName}`,
                description: `Xác nhận bằng cấp của: ${studentName} - ${degreeNumber} || Từ trường: ${university} || Ngày sinh: ${dateOfBirth} || Ngày tốt nghiệp: ${graduationDate} || Điểm: ${score} || Xếp loại: ${grade} || Chuyên ngành: ${major}`,
                image: `ipfs://${imageHash}`,
                studentName,
                university,
                dateOfBirth,
                graduationDate,
                score,
                grade,
                major,
                degreeType,
                degreeNumber,
                dateCreated: new Date().toISOString(),
                attributes: [
                    {
                        trait_type: "Tên Sinh Viên",
                        value: studentName
                    },
                    {
                        trait_type: "Trường Đại Học",
                        value: university
                    },
                    {
                        trait_type: "Ngày Sinh",
                        value: dateOfBirth
                    },
                    {
                        trait_type: "Ngày Tốt Nghiệp",
                        value: graduationDate
                    },
                    {
                        trait_type: "Điểm",
                        value: score
                    },
                    {
                        trait_type: "Xếp Loại",
                        value: grade
                    },
                    {
                        trait_type: "Chuyên Ngành",
                        value: major
                    },
                    { trait_type: "Loại Bằng Cấp", value: degreeType },
                    { trait_type: "Số Hiệu Bằng Cấp", value: degreeNumber }
                ]
            };

            const metadataHash = await uploadMetadataToPinata(
                metadata,
                `Degree-Metadata-${studentName}-${new Date().getTime()}`
            );

            // Trả về cả hash của metadata và thông tin tài liệu
            return NextResponse.json({
                success: true,
                metadataUri: `ipfs://${metadataHash}`,
                imageUri: `ipfs://${imageHash}`,
                metadata
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
            // Xóa file tạm 
            try {
                await unlink(tempFilePath);
            } catch (error) {
                console.error('❌Lỗi khi xóa file tạm:', error);
            }
        }

    } catch (error) {
        console.error('❌ Lỗi trong API route:', error);
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