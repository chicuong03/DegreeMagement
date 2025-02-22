import { getContract } from "@/lib/contract";
import { connectToDatabase } from "@/lib/mongodb";
import { ethers } from "ethers";
import { NextResponse } from "next/server";

// 📌 Lấy danh sách bằng cấp từ Blockchain
export async function GET() {
    try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const contract = getContract(provider);

        const ids = await contract.getAllDegreeIds();
        const degrees = await Promise.all(ids.map(async (id) => {
            const degree = await contract.getDegree(id);
            return {
                id: id,
                studentName: degree.studentName,
                university: degree.university,
                dateOfBirth: Number(degree.dateOfBirth),
                graduationDate: Number(degree.graduationDate),
                grade: degree.grade,
                score: Number(degree.score),
                ipfsHash: degree.ipfsHash,
                status: ["Pending", "Approved", "Rejected"][degree.status],
                issuer: degree.issuer,
                timestamp: Number(degree.timestamp)
            };
        }));

        return NextResponse.json({ success: true, degrees }, { status: 200 });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bằng cấp:", error);
        return NextResponse.json({ success: false, message: "Không thể lấy danh sách bằng cấp!" }, { status: 500 });
    }
}

// 📌 Cấp bằng cấp mới trên Blockchain
export async function POST(req) {
    try {
        await connectToDatabase();
        const { studentName, university, dateOfBirth, graduationDate, grade, score, ipfsHash, issuer } = await req.json();

        // Kiểm tra dữ liệu hợp lệ
        if (!studentName || !university || !dateOfBirth || !graduationDate || !grade || !score || !ipfsHash) {
            return NextResponse.json({ success: false, message: "Thiếu thông tin!" }, { status: 400 });
        }

        // Kết nối Blockchain
        const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider);
        const contract = getContract(wallet);

        // Gọi smart contract để cấp bằng cấp
        const tx = await contract.issueDegree(studentName, university, dateOfBirth, graduationDate, grade, score, ipfsHash);
        await tx.wait();

        return NextResponse.json({ success: true, message: "Bằng cấp đã được cấp trên Blockchain!" }, { status: 201 });
    } catch (error) {
        console.error("Lỗi khi cấp bằng cấp:", error);
        return NextResponse.json({ success: false, message: "Cấp bằng cấp thất bại!" }, { status: 500 });
    }
}

// 📌 Cập nhật trạng thái bằng cấp trên Blockchain
export async function PUT(req) {
    try {
        const { id, status } = await req.json();

        if (!id || (status !== "Approved" && status !== "Rejected")) {
            return NextResponse.json({ success: false, message: "Thiếu ID hoặc trạng thái không hợp lệ!" }, { status: 400 });
        }

        // Kết nối Blockchain
        const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider);
        const contract = getContract(wallet);

        let tx;
        if (status === "Approved") {
            tx = await contract.approveDegree(id);
        } else {
            tx = await contract.rejectDegree(id);
        }

        await tx.wait();

        return NextResponse.json({ success: true, message: `Bằng cấp đã được ${status.toLowerCase()} trên Blockchain!` }, { status: 200 });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        return NextResponse.json({ success: false, message: "Cập nhật trạng thái thất bại!" }, { status: 500 });
    }
}

// 📌 Không thể xóa bằng cấp trên Blockchain, chỉ xóa trong DB nếu cần
// export async function DELETE(req) {
//     try {
//         await connectToDatabase();
//         const { id } = await req.json();

//         if (!id) {
//             return NextResponse.json({ success: false, message: "Thiếu ID bằng cấp!" }, { status: 400 });
//         }

//         const deletedCertificate = await Certificate.findByIdAndDelete(id);
//         if (!deletedCertificate) {
//             return NextResponse.json({ success: false, message: "Không tìm thấy bằng cấp!" }, { status: 404 });
//         }

//         return NextResponse.json({ success: true, message: "Bằng cấp đã bị xóa khỏi DB!" }, { status: 200 });
//     } catch (error) {
//         console.error("Lỗi khi xóa bằng cấp:", error);
//         return NextResponse.json({ success: false, message: "Xóa bằng cấp thất bại!" }, { status: 500 });
//     }
// }
