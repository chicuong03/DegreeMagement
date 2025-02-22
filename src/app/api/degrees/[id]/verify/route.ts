
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const certificateId = params.id;

        if (!certificateId) {
            return NextResponse.json({ message: 'ID không hợp lệ' }, { status: 400 });
        }

        const [certificates]: any = await db.query(
            `SELECT certificates.*, universities.name AS university_name 
             FROM certificates 
             JOIN universities ON certificates.university_id = universities.id
             WHERE certificates.id = ?`,
            [certificateId]
        );


        if (certificates.length === 0) {
            return NextResponse.json({ message: 'Không tìm thấy bằng cấp' }, { status: 404 });
        }

        return NextResponse.json(certificates[0]);
    } catch (error) {
        console.error('Lỗi tra cứu:', error);
        return NextResponse.json({ message: 'Lỗi xử lý tra cứu' }, { status: 500 });
    }
}