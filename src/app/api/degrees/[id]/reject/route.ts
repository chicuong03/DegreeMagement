import db from '@/lib/db';
import { NextResponse } from 'next/server';


export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const degreeId = parseInt(params.id);

        if (isNaN(degreeId)) {
            return NextResponse.json({ message: 'ID không hợp lệ' }, { status: 400 });
        }

        const [result]: any = await db.query(
            `UPDATE certificates SET status = 'rejected' WHERE id = ?`,
            [degreeId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Không tìm thấy bằng cấp để từ chối' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Từ chối thành công' });
    } catch (error) {
        console.error('Lỗi từ chối:', error);
        return NextResponse.json({ message: 'Lỗi xử lý từ chối' }, { status: 500 });
    }
}