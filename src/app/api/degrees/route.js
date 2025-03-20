import { getContract } from "@/lib/contract";
import { connectToDatabase } from "@/lib/mongodb";
import { ethers } from "ethers";
import { NextResponse } from "next/server";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 }); // Cache trong 5 phút

export async function GET() {
    try {

        const cachedData = cache.get("degrees");
        if (cachedData) {
            console.log("Lấy dữ liệu từ cache");
            return NextResponse.json({ success: true, ...cachedData }, { status: 200 });
        }

        const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const contract = getContract(provider);

        const totalDegrees = await contract.totalDegrees();
        let degrees = [];

        for (let i = 1; i <= totalDegrees; i++) {
            try {
                const [ipfsHash, status, issuer, timestamp] = await contract.getDegree(i);

                // Fetch metadata từ Pinata
                let metadata = {};
                try {
                    const cleanIpfsHash = ipfsHash.replace("ipfs://", ""); // Xóa prefix
                    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cleanIpfsHash}`);
                    metadata = await response.json();
                } catch (error) {
                    console.error(` Lỗi khi tải metadata của bằng cấp ${i}:`, error);
                }

                degrees.push({
                    id: i,
                    ipfsHash,
                    status: ["Pending", "Approved", "Rejected"][status],
                    issuer,
                    issueDate: timestamp.toString(),
                    studentName: metadata.studentName || "N/A",
                    university: metadata.university || "N/A",
                    dateOfBirth: metadata.dateOfBirth || "N/A",
                    graduationDate: metadata.graduationDate || "N/A",
                    grade: metadata.grade || "N/A",
                    score: metadata.score || "N/A",
                    major: metadata.major || "N/A",
                    image: metadata.image || null
                });
            } catch (error) {
                console.error(` Lỗi khi lấy bằng cấp ${i}:`, error);
            }
        }

        const responseData = { totalDegrees: totalDegrees.toString(), degrees };
        cache.set("degrees", responseData); // Lưu cache

        return NextResponse.json({ success: true, totalDegrees: totalDegrees.toString(), degrees }, { status: 200 });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bằng cấp:", error);
        return NextResponse.json({ success: false, message: `Không thể lấy danh sách bằng cấp: ${error.message}` }, { status: 500 });
    }
}

// API để upload metadata lên Pinata và cấp bằng cấp trên Blockchain
export async function POST(req) {
    try {
        await connectToDatabase();
        const formData = await req.formData();

        // Lấy tt từ requestt của user
        const studentName = formData.get("studentName");
        const university = formData.get("university");
        const dateOfBirth = formData.get("dateOfBirth");
        const graduationDate = formData.get("graduationDate");
        const grade = formData.get("grade");
        const score = formData.get("score");
        const major = formData.get("major");
        const studentAddress = formData.get("studentAddress");
        const file = formData.get("file");

        // check dữ input
        if (!studentName || !university || !dateOfBirth || !graduationDate || !grade ||
            !score || !major || !studentAddress || !file) {
            return NextResponse.json({ success: false, message: "Thiếu thông tin bắt buộc!" }, { status: 400 });
        }

        // Chuẩn bị metadata
        const metadata = {
            studentName,
            university,
            dateOfBirth,
            graduationDate,
            grade,
            score,
            major
        };

        // Upload ảnh lên Pinata
        const fileArrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(fileArrayBuffer);

        // Tạo FormData để upload file
        const pinataFileFormData = new FormData();
        pinataFileFormData.append('file', new Blob([fileBuffer]), file.name);

        // Upload file lên Pinata
        const fileResponse = await fetch(`${process.env.PINATA_API_URL}/pinning/pinFileToIPFS`, {
            method: 'POST',
            headers: {
                'pinata_api_key': process.env.PINATA_API_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
            },
            body: pinataFileFormData
        });

        if (!fileResponse.ok) {
            const errorData = await fileResponse.json();
            throw new Error(`Không thể upload ảnh lên Pinata: ${errorData.error || 'Unknown error'}`);
        }

        const fileData = await fileResponse.json();
        const imageIpfsHash = fileData.IpfsHash;

        // Thêm IPFS hash của ảnh vào metadata
        metadata.image = `ipfs://${imageIpfsHash}`;

        // Upload metadata lên Pinata
        const metadataResponse = await fetch(`${process.env.PINATA_API_URL}/pinning/pinJSONToIPFS`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': process.env.PINATA_API_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
            },
            body: JSON.stringify({
                pinataContent: metadata,
                pinataMetadata: { name: `Degree-${studentName}-${new Date().getTime()}` }
            })
        });

        if (!metadataResponse.ok) {
            const errorData = await metadataResponse.json();
            throw new Error(`Không thể upload metadata lên Pinata: ${errorData.error || 'Unknown error'}`);
        }

        const metadataData = await metadataResponse.json();
        const metadataUri = `ipfs://${metadataData.IpfsHash}`;

        // Kết nối Blockchain
        const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider);
        const contract = getContract(wallet);

        // Gọi smart contract để cấp bằng cấp
        const tx = await contract.issueDegree(metadataUri, studentAddress);
        const receipt = await tx.wait();

        // Tìm event DegreeIssued trong receipt để lấy degreeId
        const degreeIssuedEvent = receipt.events?.find(event => event.event === "DegreeIssued");
        const degreeId = degreeIssuedEvent?.args?.degreeId.toString() || "unknown";
        cache.del("degrees");
        return NextResponse.json({
            success: true,
            message: "Bằng cấp đã được cấp trên Blockchain!",
            metadataUri,
            degreeId,
            txHash: receipt.transactionHash
        }, { status: 201 });

    } catch (error) {
        console.error("Lỗi khi cấp bằng cấp:", error);
        return NextResponse.json({
            success: false,
            message: `Cấp bằng cấp thất bại: ${error.message}`
        }, { status: 500 });
    }
}

// Phê duyệt hoặc từ chối bằng cấp
export async function PUT(req) {
    try {
        const { id, status, studentAddress } = await req.json();

        if (!id || (status !== "Approved" && status !== "Rejected")) {
            return NextResponse.json({
                success: false,
                message: "Thiếu ID hoặc trạng thái không hợp lệ!"
            }, { status: 400 });
        }

        // Kết nối Blockchain
        const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider);
        const contract = getContract(wallet);

        let tx;
        if (status === "Approved") {
            if (!studentAddress) {
                return NextResponse.json({
                    success: false,
                    message: "Thiếu địa chỉ sinh viên để phê duyệt bằng cấp!"
                }, { status: 400 });
            }
            tx = await contract.approveDegree(id, studentAddress);
        } else {
            tx = await contract.rejectDegree(id);
        }

        const receipt = await tx.wait(); // chờ xác nhận từ blcok
        //revalidatePath("/degrees");
        cache.del("degrees");
        return NextResponse.json({
            success: true,
            message: `Bằng cấp đã được ${status === "Approved" ? "phê duyệt" : "từ chối"} trên Blockchain!`,
            txHash: receipt.transactionHash
        }, { status: 200 });

    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái bằng cấp:", error);
        return NextResponse.json({
            success: false,
            message: `Cập nhật trạng thái thất bại: ${error.message}`
        }, { status: 500 });
    }
}

// Lấy danh sách bằng cấp của một sinh viên
export async function PATCH(req) {
    try {
        const { studentAddress } = await req.json();

        if (!studentAddress) {
            return NextResponse.json({
                success: false,
                message: "Thiếu địa chỉ sinh viên!"
            }, { status: 400 });
        }

        // Kết nối Blockchain
        const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const contract = getContract(provider);

        // Lấy danh sách ID bằng cấp của sinh viên
        const degreeIds = await contract.getDegreesByOwner(studentAddress);

        // Lấy thông tin chi tiết cho từng bằng cấp
        const degrees = await Promise.all(
            degreeIds.map(async (degreeId) => {
                try {
                    const [ipfsHash, status, issuer, timestamp] = await contract.getDegree(degreeId);

                    // Lấy metadata từ IPFS
                    let metadata = {};
                    try {
                        const cleanIpfsHash = ipfsHash.replace("ipfs://", "");
                        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cleanIpfsHash}`);
                        metadata = await response.json();
                    } catch (error) {
                        console.error(`Không thể tải metadata của bằng cấp ${degreeId}:`, error);
                    }

                    return {
                        id: degreeId.toString(),
                        ipfsHash: ipfsHash,
                        status: ["Pending", "Approved", "Rejected"][status],
                        issuer: issuer,
                        timestamp: new Date(Number(timestamp) * 1000).toLocaleDateString(),
                        studentName: metadata.studentName || "N/A",
                        university: metadata.university || "N/A",
                        dateOfBirth: metadata.dateOfBirth || "N/A",
                        graduationDate: metadata.graduationDate || "N/A",
                        grade: metadata.grade || "N/A",
                        score: metadata.score || "N/A",
                        major: metadata.major || "N/A",
                        image: metadata.image || null
                    };
                } catch (error) {
                    console.error(`Lỗi khi lấy thông tin bằng cấp ${degreeId}:`, error);
                    return null;
                }
            })
        );

        // Lọc các giá trị null
        const validDegrees = degrees.filter(degree => degree !== null);

        return NextResponse.json({
            success: true,
            degrees: validDegrees
        }, { status: 200 });

    } catch (error) {
        console.error("Lỗi khi lấy danh sách bằng cấp của sinh viên:", error);
        return NextResponse.json({
            success: false,
            message: `Không thể lấy danh sách bằng cấp: ${error.message}`
        }, { status: 500 });
    }
}

// hê duyệt quyền cho trường đại học
export async function OPTIONS(req) {
    try {
        const { universityAddress, universityName } = await req.json();

        if (!universityAddress || !universityName) {
            return NextResponse.json({
                success: false,
                message: "Thiếu địa chỉ hoặc tên trường đại học!"
            }, { status: 400 });
        }

        // Kết nối Blockchain
        const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, provider);
        const contract = getContract(wallet);

        // Xác minh người gọi 
        const owner = await contract.owner();
        if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
            return NextResponse.json({
                success: false,
                message: "Chỉ chủ sở hữu hợp đồng mới có thể phê duyệt quyền cho trường đại học!"
            }, { status: 403 });
        }

        const tx = await contract.authorizeUniversity(universityAddress, universityName);
        const receipt = await tx.wait();

        return NextResponse.json({
            success: true,
            message: `Đã cấp quyền cho trường đại học ${universityName} (${universityAddress})`,
            txHash: receipt.transactionHash
        }, { status: 200 });

    } catch (error) {
        console.error("Lỗi khi phê duyệt quyền cho trường đại học:", error);
        return NextResponse.json({
            success: false,
            message: `Không thể phê duyệt quyền: ${error.message}`
        }, { status: 500 });
    }
}