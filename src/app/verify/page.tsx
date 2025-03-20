"use client";

import { getContract } from "@/lib/contract";
import { ethers } from "ethers";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";

//  **Lấy dữ liệu từ IPFS**
const fetchIPFS = async (ipfsHash: string) => {
    try {
        if (!ipfsHash || !ipfsHash.startsWith("ipfs://")) {
            console.error("Không có IPFS Hash hợp lệ:", ipfsHash);
            return {};
        }

        // **Chuyển đổi `ipfs://` thành URL Pinata
        const url = `https://copper-dear-raccoon-181.mypinata.cloud/ipfs/${ipfsHash.replace("ipfs://", "")}`;
        console.log(`🔍 Fetching from IPFS: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            console.error(` Lỗi tải từ IPFS (${response.status}):`, response.statusText);
            return {};
        }

        const data = await response.json();
        console.log("Dữ liệu từ IPFS:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi fetch từ IPFS:", error);
        return {};
    }
};

export default function VerifyCertificate() {
    const [searchInput, setSearchInput] = useState("");
    const [result, setResult] = useState<{ valid: boolean; data?: any } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // **Xử lý tìm kiếm**
    const handleSearch = async () => {
        if (!searchInput.trim()) {
            setError(" Vui lòng nhập mã bằng cấp hoặc địa chỉ ví!");
            return;
        }

        setLoading(true);
        setResult(null);
        setError("");

        try {
            const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
            const contract = getContract(provider);

            if (/^\d+$/.test(searchInput)) {
                await searchByID(contract, parseInt(searchInput, 10));
            } else if (/^0x[a-fA-F0-9]{40}$/.test(searchInput)) {
                await searchByAddress(contract, searchInput);
            } else {
                throw new Error(" Định dạng nhập không hợp lệ! Hãy nhập ID hoặc địa chỉ ví.");
            }
        } catch (err) {
            setResult({ valid: false });
            setError(" Không tìm thấy thông tin. Vui lòng kiểm tra lại!");
        } finally {
            setLoading(false);
        }
    };

    //  Tìm kiếm bằng mã NFT**
    const searchByID = async (contract: any, certID: number) => {
        if (isNaN(certID) || certID <= 0) {
            throw new Error(" Mã bằng cấp không hợp lệ!");
        }

        const totalDegrees = await contract.totalDegrees();
        if (certID > totalDegrees.toNumber()) {
            throw new Error(" Không tìm thấy bằng cấp!");
        }

        // **Lấy dữ liệu từ blockchain
        const degree = await contract.getDegree(certID);
        console.log(" Dữ liệu từ blockchain:", degree);

        //  ipfsHash, issuer, timestamp
        const ipfsHash = degree[0];
        const issuer = degree[2]; // 
        const timestamp = degree[3];

        if (!ipfsHash || !ipfsHash.startsWith("ipfs://")) {
            console.error(" Không có IPFS Hash hợp lệ:", ipfsHash);
            setResult({ valid: false });
            return;
        }

        //  Lấy chủ sở hữu NFT từ blockchain**
        const owner = await contract.ownerOf(certID);
        console.log(" Chủ sở hữu NFT:", owner);
        console.log(" Người cấp bằng (issuer):", issuer);

        // Fetch dữ liệu từ IPFS*
        const ipfsData = await fetchIPFS(ipfsHash);
        console.log(" Dữ liệu từ IPFS:", ipfsData);

        //  Lấy dữ liệu từ attributes
        const attributes = ipfsData.attributes || [];
        const getAttributeValue = (trait: string) => {
            const attr = attributes.find((a: any) => a.trait_type === trait);
            return attr ? attr.value : "N/A";
        };

        setResult({
            valid: true,
            data: {
                certificateID: certID,
                owner,
                issuer,
                studentName: ipfsData.studentName || getAttributeValue("Tên Sinh Viên"),
                university: ipfsData.university || getAttributeValue("Trường Đại Học"),
                major: ipfsData.major || getAttributeValue("Chuyên Ngành"),
                dateOfBirth: ipfsData.dateOfBirth
                    ? new Date(ipfsData.dateOfBirth).toLocaleDateString()
                    : getAttributeValue("Ngày Sinh"),
                graduationDate: ipfsData.graduationDate
                    ? new Date(ipfsData.graduationDate).toLocaleDateString()
                    : getAttributeValue("Ngày Tốt Nghiệp"),
                issueDate: timestamp
                    ? new Date(Number(timestamp) * 1000).toLocaleDateString()
                    : "N/A",

                status: {
                    label: degree[1] === 0 ? "Chờ duyệt" : degree[1] === 1 ? "Hợp lệ" : "Từ chối",
                    textColor: degree[1] === 0 ? "#856404" : degree[1] === 1 ? "#155724" : "#721c24",
                    bgColor: degree[1] === 0 ? "#fff3cd" : degree[1] === 1 ? "#d4edda" : "#f8d7da",
                    borderColor: degree[1] === 0 ? "#ffeeba" : degree[1] === 1 ? "#c3e6cb" : "#f5c6cb"
                },

                grade: ipfsData.grade || getAttributeValue("Xếp Loại"),
                score: ipfsData.score || getAttributeValue("Điểm"),
                ipfsHash: ipfsHash,
            },
        });
    };

    const searchByAddress = async (contract: any, walletAddress: string) => {
        console.log("Đang tìm bằng cấp của địa chỉ:", walletAddress);

        const degreesList = await contract.getDegreesByOwner(walletAddress);
        console.log(" Danh sách ID bằng cấp:", degreesList);

        if (degreesList.length === 0) {
            throw new Error(" Không tìm thấy bằng cấp cho địa chỉ này.");
        }

        let userCertificates = [];

        for (let i = 0; i < degreesList.length; i++) {
            const degreeId = degreesList[i].toNumber();
            console.log(`Đang lấy dữ liệu cho bằng cấp ID: ${degreeId}`);

            const degree = await contract.getDegree(degreeId);
            console.log(" Dữ liệu từ blockchain:", degree);

            // Lấy dữ liệu từ blockchain
            const ipfsHash = degree[0];
            const issuer = degree[2];
            const timestamp = degree[3];

            if (!ipfsHash || !ipfsHash.startsWith("ipfs://")) {
                console.warn(` Bằng cấp ID ${degreeId} không có IPFS Hash.`);
                continue;
            }

            // *ấy dữ liệu từ IPFS
            const ipfsData = await fetchIPFS(ipfsHash);
            console.log(" Dữ liệu từ IPFS:", ipfsData);

            userCertificates.push({
                certificateID: degreeId,
                owner: walletAddress,
                issuer,
                studentName: ipfsData.studentName || "N/A",
                university: ipfsData.university || "N/A",
                major: ipfsData.major || "N/A",
                dateOfBirth: ipfsData.dateOfBirth ? new Date(ipfsData.dateOfBirth).toLocaleDateString() : "N/A",
                issueDate: timestamp ? new Date(Number(timestamp) * 1000).toLocaleDateString() : "N/A",
                status: {
                    label: degree[1] === 0 ? "Chờ duyệt" : degree[1] === 1 ? "Hợp lệ" : "Từ chối",
                    textColor: degree[1] === 0 ? "#856404" : degree[1] === 1 ? "#155724" : "#721c24",
                    bgColor: degree[1] === 0 ? "#fff3cd" : degree[1] === 1 ? "#d4edda" : "#f8d7da",
                    borderColor: degree[1] === 0 ? "#ffeeba" : degree[1] === 1 ? "#c3e6cb" : "#f5c6cb"
                },

                grade: ipfsData.grade || "N/A",
                score: ipfsData.score || "N/A",
                ipfsHash: ipfsHash,
            });
        }

        if (userCertificates.length === 0) {
            throw new Error("Không tìm thấy bằng cấp cho địa chỉ này.");
        }

        setResult({ valid: true, data: userCertificates });
    };


    return (
        <div className="mt-4" style={styles.container}>
            <h1 style={styles.title}>Tra cứu bằng cấp</h1>
            <p style={styles.subtitle}>Nhập mã bằng cấp hoặc địa chỉ ví để xác minh.</p>

            <div style={styles.form}>
                <input
                    type="text"
                    placeholder="Nhập mã bằng cấp hoặc địa chỉ ví"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={styles.input}
                />
                <button
                    className="mb-3"
                    onClick={handleSearch}
                    style={styles.button}
                    disabled={loading}
                >
                    {loading ? "Đang kiểm tra..." : "Xác minh"}
                </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            {result && result.valid && result.data && (
                <div style={styles.success}>
                    <h2>Thông Tin Bằng Cấp!</h2>

                    {Array.isArray(result.data) ? (
                        // Nếu tìm theo Địa chỉ Ví 
                        <div style={styles.certificatesGrid}>
                            {result.data.map((cert, index) => (
                                <div
                                    key={index}
                                    style={{
                                        ...styles.certCard,
                                        backgroundColor: cert.status.bgColor,
                                        borderColor: cert.status.borderColor
                                    }}
                                >
                                    <p>
                                        <strong>TRẠNG THÁI:</strong>{" "}
                                        <span style={{ color: cert.status.textColor, fontWeight: "bold" }}>
                                            {cert.status.label}
                                        </span>
                                    </p>
                                    <p><strong>Mã bằng cấp:</strong> {cert.certificateID}</p>
                                    <p><strong>Người nhận:</strong> {cert.studentName}</p>
                                    <p><strong>Chủ sở hữu NFT:</strong> {cert.owner}</p>
                                    <p><strong>Trường:</strong> {cert.university}</p>
                                    <p><strong>Ngành:</strong> {cert.major}</p>
                                    <p><strong>Ngày sinh:</strong> {cert.dateOfBirth}</p>
                                    <p><strong>Ngày tốt nghiệp:</strong> {cert.graduationDate}</p>
                                    <p><strong>Xếp loại:</strong> {cert.grade}</p>
                                    <p><strong>Điểm:</strong> {cert.score}</p>
                                    <p>
                                        <strong>NFT trên Explorer:</strong>{" "}
                                        <a
                                            href={`https://testnet.coinex.net/token/0x9227241afb4F160d2d6460dACB0151b60e25e55A?a=${cert.certificateID}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Xem trên CoinEx Smart Chain
                                        </a>
                                    </p>
                                    {/*  Hiển thị mã QR nếu trạng thái là "Hợp lệ" */}
                                    {cert.status?.label === "Hợp lệ" && (
                                        <div style={{ marginTop: "10px", textAlign: "center" }}>
                                            <QRCodeCanvas
                                                value={`https://testnet.coinex.net/token/0x9227241afb4F160d2d6460dACB0151b60e25e55A?a=${cert.certificateID}`}
                                                size={128}
                                            />
                                            <p style={{ fontSize: "0.9rem", color: "#555" }}>Quét mã để xem trên CoinEx</p>
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    ) : (
                        // Nếu tìm theo Mã NFT
                        <div
                            style={{
                                ...styles.certSingle,
                                backgroundColor: result.data.status.bgColor,
                                borderColor: result.data.status.borderColor
                            }}
                        >
                            <p>
                                <strong>TRẠNG THÁI:</strong>{" "}
                                <span style={{ color: result.data.status.textColor, fontWeight: "bold" }}>
                                    {result.data.status.label}
                                </span>
                            </p>
                            <p><strong>Mã bằng cấp:</strong> {result.data.certificateID}</p>
                            <p><strong>Người nhận:</strong> {result.data.studentName}</p>
                            <p><strong>Chủ sở hữu NFT:</strong> {result.data.owner}</p>
                            <p><strong>Trường:</strong> {result.data.university}</p>
                            <p><strong>Ngành:</strong> {result.data.major}</p>
                            <p><strong>Ngày sinh:</strong> {result.data.dateOfBirth}</p>
                            <p><strong>Ngày tốt nghiệp:</strong> {result.data.graduationDate}</p>
                            <p><strong>Xếp loại:</strong> {result.data.grade}</p>
                            <p><strong>Điểm:</strong> {result.data.score}</p>
                            <p>
                                <strong>NFT trên Explorer:</strong>{" "}
                                <a
                                    href={`https://testnet.coinex.net/token/0x9227241afb4F160d2d6460dACB0151b60e25e55A?a=${result.data.certificateID}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Xem trên CoinEx Smart Chain
                                </a>
                            </p>
                            {/* Hiển thị mã QR */}
                            {result.data.status.label === "Hợp lệ" && (
                                <div style={{ marginTop: "10px", textAlign: "center" }}>
                                    <QRCodeCanvas
                                        value={`https://testnet.coinex.net/token/0x9227241afb4F160d2d6460dACB0151b60e25e55A?a=${result.data.certificateID}`}
                                        size={128}
                                    />
                                    <p style={{ fontSize: "0.9rem", color: "#555" }}>Quét mã để xem trên CoinEx</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}


const styles: { [key: string]: React.CSSProperties } = {
    container: { maxWidth: "75%", margin: "0 auto", padding: "20px", textAlign: "center", background: "#f9f9f9", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
    title: { fontSize: "2rem", fontWeight: "bold", color: "#333" },
    subtitle: { fontSize: "1.2rem", color: "#666", marginBottom: "20px" },
    form: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
    input: { width: "100%", maxWidth: "400px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "1rem" },
    button: { padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", fontSize: "1rem", cursor: "pointer" },
    result: { marginTop: "20px", textAlign: "left" },
    success: { background: "#e6ffed", textAlign: "center", padding: "15px", border: "1px solid #4caf50", borderRadius: "5px", color: "#2e7d32" },
    error: { background: "#ffe6e6", padding: "15px", border: "1px solid #f44336", borderRadius: "5px", color: "#d32f2f" },

    certificatesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "20px",
        justifyContent: "center",
        alignItems: "start",
        marginTop: "10px",
    },

    certCard: {
        padding: "15px",
        borderRadius: "10px",
        textAlign: "left",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
    },
    certSingle: {
        textAlign: "left",
        padding: "15px",
        borderRadius: "10px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
    },

};
