import { connectToDatabase } from '@/lib/mongodb';
import DegreeType from '@/models/DegreeType';
import { NextResponse } from 'next/server';

export async function GET() {
    await connectToDatabase();
    const types = await DegreeType.find({});
    return NextResponse.json(types);
}

export async function POST(request) {
    await connectToDatabase();
    const body = await request.json();

    try {
        const newType = await DegreeType.create(body);
        return NextResponse.json(newType, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
