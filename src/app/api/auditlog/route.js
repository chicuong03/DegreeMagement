import { connectToDatabase } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { NextResponse } from "next/server";

// Lấy danh sách audit logs với tùy chọn lọc
export async function GET(req) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action");
        const user = searchParams.get("user");

        let filter = {};
        if (action) filter.action = action;
        if (user) filter.performed_by = user;

        const logs = await AuditLog.find(filter);
        return NextResponse.json({ success: true, data: logs });
    } catch (error) {
        console.error("Lỗi khi lấy audit logs:", error);
        return NextResponse.json({ success: false, error: "Không thể lấy danh sách nhật ký!" }, { status: 500 });
    }
}

// Ghi log khi có hành động liên quan đến bằng cấp
export async function POST(req) {
    try {
        await connectToDatabase();
        const { certificate, action, performed_by } = await req.json();

        if (!certificate || certificate === undefined || certificate === null) {
            console.error("Thiếu thông tin certificate:", certificate);
            return NextResponse.json(
                { success: false, error: "Thiếu certificate!" },
                { status: 400 }
            );
        }

        if (!action || action === undefined || action === null) {
            console.error("Thiếu thông tin action:", action);
            return NextResponse.json(
                { success: false, error: "Thiếu action!" },
                { status: 400 }
            );
        }

        if (!performed_by || performed_by === undefined || performed_by === null) {
            console.error("Thiếu thông tin performed_by:", performed_by);
            return NextResponse.json(
                { success: false, error: "Thiếu performed_by!" },
                { status: 400 }
            );
        }
        console.log("Thông tin nhận được:", { certificate, action, performed_by });
        const auditLog = new AuditLog({
            certificate,
            action,
            performed_by,
        });

        await auditLog.save();

        return NextResponse.json(
            { success: true, message: "Lưu audit log thành công!" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Lỗi khi lưu audit log:", error);
        return NextResponse.json(
            { success: false, error: "Lỗi server!", details: error.message },
            { status: 500 }
        );
    }
}

// Xóa một audit log theo ID
export async function DELETE(req) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: "Thiếu ID cần xóa!" }, { status: 400 });
        }

        const deletedLog = await AuditLog.findByIdAndDelete(id);
        if (!deletedLog) {
            return NextResponse.json({ success: false, error: "Không tìm thấy nhật ký với ID này!" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Xóa thành công!" });
    } catch (error) {
        console.error("Lỗi khi xóa audit log:", error);
        return NextResponse.json({ success: false, error: "Không thể xóa nhật ký!", details: error.message }, { status: 500 });
    }
}