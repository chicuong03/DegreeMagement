import { connectToDatabase } from '@/lib/mongodb';
import DegreeType from '@/models/DegreeType';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
    await connectToDatabase();
    const body = await request.json();

    try {
        const updated = await DegreeType.findByIdAndUpdate(params.id, body, { new: true });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(request, { params }) {
    await connectToDatabase();

    try {
        await DegreeType.findByIdAndDelete(params.id);
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
