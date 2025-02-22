import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const degreeId = parseInt(params.id);

        if (isNaN(degreeId)) {
            return NextResponse.json({ message: 'ID không hợp lệ' }, { status: 400 });
        }

        const [result]: any = await db.query(
            `UPDATE certificates SET status = 'approved' WHERE id = ?`,
            [degreeId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Không tìm thấy bằng cấp để phê duyệt' }, { status: 404 });
        }

        // Fetch and return the updated certificate
        const [updatedCertificate]: any = await db.query(
            `SELECT c.*, u.name as university_name 
             FROM certificates c
             JOIN universities u ON c.university_id = u.id
             WHERE c.id = ?`,
            [degreeId]
        );

        return NextResponse.json(updatedCertificate[0]);
    } catch (error) {
        console.error('Lỗi phê duyệt:', error);
        return NextResponse.json({ message: 'Lỗi xử lý phê duyệt' }, { status: 500 });
    }
}