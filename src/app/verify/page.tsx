"use client";

import { getContract } from "@/lib/contract";
import { ethers } from "ethers";
import { useState } from "react";
import QRCode from "react-qr-code";

export default function VerifyCertificate() {
    const [certificateID, setCertificateID] = useState("");
    const [result, setResult] = useState<{ valid: boolean; data?: any } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchType, setSearchType] = useState<"id" | "address">("id"); // Chọn kiểu tìm kiếm
    const [searchInput, setSearchInput] = useState(""); // Giá trị nhập vào

    const handleVerify = async () => {
        if (!certificateID.trim()) {
            setError("Vui lòng nhập mã bằng cấp!");
            return;
        }

        setLoading(true);
        setResult(null);
        setError("");

        try {
            // Kết nối với MetaMask
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getContract(provider);

            // 🛠 Chuyển đổi certificateID sang số
            const certID = parseInt(certificateID, 10);
            if (isNaN(certID) || certID <= 0) {
                throw new Error("Mã bằng cấp không hợp lệ!");
            }

            // 📌 Kiểm tra tổng số bằng cấp trên blockchain
            const totalDegrees = await contract.totalDegrees();
            if (certID > totalDegrees.toNumber()) {
                throw new Error("Không tìm thấy bằng cấp!");
            }

            // 🛠 Gọi smart contract để lấy thông tin bằng cấp
            const degree = await contract.getDegree(certID);

            if (!degree || degree.issuer === ethers.constants.AddressZero) {
                throw new Error("Không tìm thấy bằng cấp");
            }

            // 🛠 Kiểm tra **chủ sở hữu hiện tại của NFT**
            const currentOwner = await contract.ownerOf(certID);
            console.log(`🎯 Chủ sở hữu hiện tại của NFT ${certID}: ${currentOwner}`);

            // 🛠 Xử lý trạng thái bằng cấp
            const status =
                degree.status === 0 ? "Chưa duyệt" :
                    degree.status === 1 ? "Hợp lệ" : "Từ chối";

            // 🛠 Cập nhật kết quả
            setResult({
                valid: true,
                data: {
                    certificateID: certID,
                    owner: currentOwner, // Cập nhật chủ sở hữu hiện tại
                    university_name: degree.university,
                    dateOfBirth: new Date(Number(degree.dateOfBirth) * 1000).toLocaleDateString(),
                    issueDate: new Date(Number(degree.timestamp) * 1000).toLocaleDateString(),
                    status: status,
                    grade: degree.grade,
                    score: Number(degree.score),
                    ipfsHash: degree.ipfsHash,
                },
            });
        } catch (err) {
            setResult({ valid: false });
            setError("Không tìm thấy bằng cấp. Vui lòng kiểm tra lại mã.");
        } finally {
            setLoading(false);
        }
    };

    // Xác định kiểu tìm kiếm (ID hay địa chỉ ví)
    const detectSearchType = (input: string) => {
        if (/^\d+$/.test(input)) {
            return "id"; // Nếu chỉ chứa số -> tìm theo ID
        } else if (/^0x[a-fA-F0-9]{40}$/.test(input)) {
            return "address"; // Nếu bắt đầu bằng "0x" và có 40 ký tự -> tìm theo địa chỉ ví
        }
        return null; // Không hợp lệ
    };

    // 🔹 Xử lý tìm kiếm tự động
    const handleSearch = async () => {
        if (!searchInput.trim()) {
            setError("Vui lòng nhập mã bằng cấp hoặc địa chỉ ví!");
            return;
        }

        setLoading(true);
        setResult(null);
        setError("");

        try {
            const searchType = detectSearchType(searchInput);

            if (searchType === "id") {
                await handleVerifyByID(searchInput);
            } else if (searchType === "address") {
                await handleVerifyByAddress(searchInput);
            } else {
                throw new Error("Định dạng nhập vào không hợp lệ!");
            }
        } catch (err) {
            setResult({ valid: false });
            setError("Không tìm thấy thông tin. Vui lòng kiểm tra lại!");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Tìm kiếm bằng ID NFT
    const handleVerifyByID = async (certificateID: string) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getContract(provider);

            const certID = parseInt(certificateID, 10);
            if (isNaN(certID) || certID <= 0) {
                throw new Error("Mã bằng cấp không hợp lệ!");
            }

            const totalDegrees = await contract.totalDegrees();
            if (certID > totalDegrees.toNumber()) {
                throw new Error("Không tìm thấy bằng cấp!");
            }

            const degree = await contract.getDegree(certID);
            if (!degree || degree.issuer === ethers.constants.AddressZero) {
                throw new Error("Không tìm thấy bằng cấp");
            }

            const currentOwner = await contract.ownerOf(certID);

            setResult({
                valid: true,
                data: {
                    certificateID: certID,
                    owner: currentOwner,
                    name: degree.studentName,
                    university_name: degree.university,
                    dateOfBirth: new Date(Number(degree.dateOfBirth) * 1000).toLocaleDateString(),
                    issueDate: new Date(Number(degree.timestamp) * 1000).toLocaleDateString(),
                    status: degree.status === 0 ? "Chưa duyệt" : degree.status === 1 ? "Hợp lệ" : "Từ chối",
                    grade: degree.grade,
                    score: Number(degree.score),
                    ipfsHash: degree.ipfsHash,
                },
            });
        } catch (err) {
            setResult({ valid: false });
            setError("Không tìm thấy bằng cấp.");
        }
    };

    // 🔹 Tìm kiếm bằng Địa chỉ Ví
    const handleVerifyByAddress = async (walletAddress: string) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getContract(provider);

            const totalDegrees = await contract.totalDegrees();
            let userCertificates = [];

            for (let i = 1; i <= totalDegrees.toNumber(); i++) {
                const owner = await contract.ownerOf(i);
                if (owner.toLowerCase() === walletAddress.toLowerCase()) {
                    const degree = await contract.getDegree(i);
                    userCertificates.push({
                        certificateID: i,
                        owner: owner,
                        name: degree.studentName,
                        university_name: degree.university,
                        dateOfBirth: new Date(Number(degree.dateOfBirth) * 1000).toLocaleDateString(),
                        issueDate: new Date(Number(degree.timestamp) * 1000).toLocaleDateString(),
                        status: degree.status === 0 ? "Chưa duyệt" : degree.status === 1 ? "Hợp lệ" : "Từ chối",
                        grade: degree.grade,
                        score: Number(degree.score),
                        ipfsHash: degree.ipfsHash,
                    });
                }
            }

            if (userCertificates.length === 0) {
                throw new Error("Không tìm thấy bằng cấp cho địa chỉ này.");
            }

            setResult({
                valid: true,
                data: userCertificates,
            });
        } catch (err) {
            setResult({ valid: false });
            setError("Không tìm thấy bằng cấp cho địa chỉ này.");
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Tra cứu bằng cấp</h1>
            <p style={styles.subtitle}>Nhập mã bằng cấp của bạn để xác minh thông tin.</p>

            {/* Form nhập thông tin */}
            <div style={styles.form}>
                <input
                    type="text"
                    placeholder="Nhập mã bằng cấp hoặc địa chỉ ví"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={styles.input}
                />

                <button
                    onClick={handleSearch}
                    style={styles.button}
                    disabled={loading}
                >
                    {loading ? "Đang kiểm tra..." : "Xác minh"}
                </button>
            </div>

            {error && (
                <div style={{ ...styles.error, marginTop: "20px", textAlign: "center" }}>
                    {error}
                </div>
            )}

            {result && (
                <div style={styles.result}>
                    {result.valid ? (
                        <div style={styles.success}>
                            <h2>Bằng cấp hợp lệ!</h2>

                            {Array.isArray(result.data) ? (
                                // Nếu là tìm theo Địa chỉ ví (Nhiều bằng cấp)
                                <div style={styles.certificatesGrid}>
                                    {result.data.map((cert, index) => (
                                        <div key={index} style={styles.certCard}>
                                            <p><strong>Mã bằng cấp:</strong> {cert.certificateID}</p>
                                            <p><strong>Người nhận (Chủ sở hữu NFT):</strong> {cert.owner}</p>
                                            <p><strong>Tên người nhận:</strong> {cert.name}</p>
                                            <p><strong>Được cấp bởi:</strong> {cert.university_name}</p>
                                            <p><strong>Ngày cấp:</strong> {cert.issueDate}</p>
                                            <p><strong>Xếp loại:</strong> {cert.grade}</p>
                                            <p><strong>Điểm:</strong> {cert.score}</p>
                                            <p>
                                                <strong>NFT chủ sở hữu:</strong>{" "}
                                                <a
                                                    href={`https://testnet.coinex.net/token/0x73ED44E52D0CCC06Fa15284db8da1f08527D1E1E?a=${cert.certificateID}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Xem trên CoinEx Smart Chain
                                                </a>
                                            </p>

                                            {/* 🔹 Mỗi bằng cấp có một QR Code riêng */}
                                            <div style={styles.qrWrapper}>
                                                <QRCode
                                                    value={`https://testnet.coinex.net/token/0x73ED44E52D0CCC06Fa15284db8da1f08527D1E1E?a=${cert.certificateID}`}
                                                    size={200}
                                                    bgColor="transparent"
                                                />
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Nếu là tìm theo ID (Chỉ có 1 bằng cấp)
                                <div style={styles.certSingle}>
                                    <p><strong>Mã bằng cấp:</strong> {result.data.certificateID}</p>
                                    <p><strong>Người nhận (Chủ sở hữu NFT):</strong> {result.data.owner}</p>
                                    <p><strong>Tên người nhận:</strong> {result.data.name}</p>
                                    <p><strong>Được cấp bởi:</strong> {result.data.university_name}</p>
                                    <p><strong>Ngày cấp:</strong> {result.data.issueDate}</p>
                                    <p><strong>Xếp loại:</strong> {result.data.grade}</p>
                                    <p><strong>Điểm:</strong> {result.data.score}</p>

                                    {/* Thêm link tới Explorer */}
                                    <p>
                                        <strong>NFT trên Explorer:</strong>{" "}
                                        <a
                                            href={`https://testnet.coinex.net/token/0x73ED44E52D0CCC06Fa15284db8da1f08527D1E1E?a=${result.data.certificateID}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Xem trên CoinEx Smart Chain
                                        </a>
                                    </p>

                                    {/* 🔹 QR Code của bằng cấp - Cập nhật để mở link Explorer */}
                                    <div style={styles.qrWrapper}>
                                        <QRCode
                                            value={`https://testnet.coinex.net/token/0x73ED44E52D0CCC06Fa15284db8da1f08527D1E1E?a=${result.data.certificateID}`}
                                            size={200}
                                            bgColor="transparent"
                                        />
                                    </div>
                                </div>

                            )}
                        </div>
                    ) : (
                        <div style={styles.error}>
                            <h2>Bằng cấp không hợp lệ hoặc không tồn tại.</h2>
                        </div>
                    )}
                </div>
            )}



        </div>
    );
}

// Styles
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: "75%",
        margin: "0 auto",
        minHeight: "500px",
        padding: "20px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        background: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    title: {
        fontSize: "2rem",
        fontWeight: "bold",
        color: "#333",
    },
    subtitle: {
        fontSize: "1.2rem",
        color: "#666",
        marginBottom: "20px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
    },
    input: {
        width: "100%",
        maxWidth: "400px",
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        fontSize: "1rem",
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    result: {
        marginTop: "20px",
        textAlign: "left",
    },
    success: {
        background: "#e6ffed",
        padding: "15px",
        border: "1px solid #4caf50",
        borderRadius: "5px",
        color: "#2e7d32",
    },
    error: {
        background: "#ffe6e6",
        padding: "15px",
        border: "1px solid #f44336",
        borderRadius: "5px",
        color: "#d32f2f",
    },

    certificatesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", // 🔹 Hiển thị dạng grid tự động xuống hàng
        gap: "20px",
        justifyContent: "center",
        alignItems: "start",
        marginTop: "10px",
    },
    certCard: {
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        background: "#fff",
        textAlign: "left",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    },
    certSingle: {
        textAlign: "center",
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        background: "#fff",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    },
    qrWrapper: {
        marginTop: "10px",
        display: "flex",
        justifyContent: "center",
    },
};
