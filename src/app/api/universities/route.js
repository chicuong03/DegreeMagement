import { connectToDatabase } from "@/lib/mongodb";
import University from "@/models/University";
import { NextResponse } from "next/server";


export async function GET() {
    await connectToDatabase();
    try {
        const universities = await University.find({}).select("name email address representative isAuthorized");

        console.log(" Dữ liệu trả về từ DB:", universities);

        return NextResponse.json(universities, { status: 200 });
    } catch (error) {
        console.error(" Lỗi khi lấy danh sách trường:", error);
        return NextRespone.json({ message: "Lỗi khi lấy danh sách trường từ CSDL!" }, { status: 500 });
    }
}

// Thêm trường đại học mới
export async function POST(req) {
    await connectToDatabase();
    try {
        const body = await req.json();


        if (body.address) {
            body.address = body.address.toLowerCase();
        }

        // Kiểm tra trùng lặp địa chỉ
        const existingUniversity = await University.findOne({ address: body.address });
        if (existingUniversity) {
            return NextResponse.json(
                { message: "Địa chỉ ví này đã được sử dụng cho trường khác!" },
                { status: 400 }
            );
        }

        const newUniversity = await University.create(body);
        console.log(" Đã thêm trường mới:", newUniversity);

        return NextResponse.json(newUniversity, { status: 201 });
    } catch (error) {
        console.error(" Lỗi khi thêm trường:", error);
        return NextResponse.json({
            message: `Thêm trường thất bại: ${error.message || "Lỗi không xác định"}`
        }, { status: 500 });
    }
}

// Cập nhật thông tin trường đại học
export async function PUT(req) {
    await connectToDatabase();
    try {
        const { address, isAuthorized } = await req.json();

        // Kiểm tra dữ liệu đầu vào
        if (!address) {
            return NextResponse.json({ message: "Địa chỉ ví không được để trống!" }, { status: 400 });
        }

        const normalizedAddress = address.toLowerCase();
        console.log(" Đang tìm địa chỉ:", normalizedAddress);

        // Kiểm tra trường có tồn tại không
        const existingUniversity = await University.findOne({ address: normalizedAddress });
        console.log(" Kết quả tìm kiếm:", existingUniversity);

        if (!existingUniversity) {

            const allUniversities = await University.find({});
            const matchByAddressIgnoreCase = allUniversities.find(
                u => u.address && u.address.toLowerCase() === normalizedAddress
            );

            if (matchByAddressIgnoreCase) {

                const updatedUniversity = await University.findByIdAndUpdate(
                    matchByAddressIgnoreCase._id,
                    {
                        address: normalizedAddress,
                        isAuthorized
                    },
                    { new: true }
                );

                console.log(" Đã chuẩn hóa và cập nhật:", updatedUniversity);
                return NextResponse.json(updatedUniversity, { status: 200 });
            }

            return NextResponse.json({
                message: "Không tìm thấy trường với địa chỉ ví này!"
            }, { status: 404 });
        }

        // Cập nhật trạng thái
        const updatedUniversity = await University.findOneAndUpdate(
            { address: normalizedAddress },
            { isAuthorized },
            { new: true }
        );

        console.log("Kết quả sau khi cập nhật:", updatedUniversity);

        return NextResponse.json(updatedUniversity, { status: 200 });
    } catch (error) {
        console.error("Lỗi khi cập nhật trường:", error);
        return NextResponse.json({
            message: `Cập nhật trạng thái thất bại: ${error.message || "Lỗi không xác định"}`
        }, { status: 500 });
    }
}

// Xóa trường đại học
export async function DELETE(req) {
    await connectToDatabase();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "ID trường không được để trống!" }, { status: 400 });
        }

        const deletedUniversity = await University.findByIdAndDelete(id);

        if (!deletedUniversity) {
            return NextResponse.json({ message: "Không tìm thấy trường với ID này!" }, { status: 404 });
        }

        console.log(" Đã xóa trường:", deletedUniversity.name);

        return NextResponse.json({
            message: `Xóa trường thành công: ${deletedUniversity.name}`
        }, { status: 200 });
    } catch (error) {
        console.error(" Lỗi khi xóa trường:", error);
        return NextResponse.json({
            message: `Xóa trường thất bại: ${error.message || "Lỗi không xác định"}`
        }, { status: 500 });
    }
}