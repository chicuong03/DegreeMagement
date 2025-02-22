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

            // 🛠 Xử lý trạng thái bằng cấp
            const status =
                degree.status === 0 ? "Chưa duyệt" :
                    degree.status === 1 ? "Hợp lệ" : "Từ chối";

            // 🛠 Cập nhật kết quả
            setResult({
                valid: true,
                data: {
                    certificateID: certID,
                    owner: degree.studentName,
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
    const link = `https://testnet.coinex.net/token/0x73ED44E52D0CCC06Fa15284db8da1f08527D1E1E?a=${certificateID}`;


    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Tra cứu bằng cấp</h1>
            <p style={styles.subtitle}>Nhập mã bằng cấp của bạn để xác minh thông tin.</p>

            <div style={styles.form}>
                <input
                    type="text"
                    placeholder="Nhập mã bằng cấp"
                    value={certificateID}
                    onChange={(e) => setCertificateID(e.target.value)}
                    style={styles.input}
                />
                <button
                    onClick={handleVerify}
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
                        <div
                            style={{
                                ...styles.success,
                                background: result.data.status === "Chưa duyệt" ? "#fff9e6" :
                                    result.data.status === "Từ chối" ? "#ffe6e6" : "#e6ffed",
                                borderColor: result.data.status === "Chưa duyệt" ? "#ffc107" :
                                    result.data.status === "Từ chối" ? "#f44336" : "#4caf50",
                                color: result.data.status === "Chưa duyệt" ? "#856404" :
                                    result.data.status === "Từ chối" ? "#d32f2f" : "#2e7d32",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <h2>
                                    {result.data.status === "Từ chối" ? "Bằng cấp bị từ chối" :
                                        result.data.status === "Chưa duyệt" ? "Bằng cấp chưa được duyệt" :
                                            "Bằng cấp hợp lệ!"}
                                </h2>
                                <p><strong>Mã bằng cấp:</strong> {result.data.certificateID}</p>
                                <p><strong>Người nhận:</strong> {result.data.owner}</p>
                                <p><strong>Ngày Sinh:</strong> {result.data.dateOfBirth}</p>
                                <p><strong>Được cấp bởi:</strong> {result.data.university_name}</p>
                                <p><strong>Ngày cấp:</strong> {result.data.issueDate}</p>
                                <p><strong>Xếp loại:</strong> {result.data.grade}</p>
                                <p><strong>Điểm:</strong> {result.data.score}</p>
                                <p><strong>Trạng thái:</strong> {result.data.status}</p>
                                <p><strong>NFT chủ sở hữu:</strong> <a href={link} target="_blank" rel="noopener noreferrer">{link}</a></p>

                            </div>

                            {/* Hiển thị mã QR nếu bằng cấp hợp lệ */}
                            {result.data.status === "Hợp lệ" && (
                                <div style={{ background: "none" }}>
                                    <QRCode
                                        value={JSON.stringify(result.data)}
                                        size={200}
                                        bgColor="transparent"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={styles.error}>
                            <h2>Bằng cấp không hợp lệ hoặc không tồn tại.</h2>
                            <p>Vui lòng kiểm tra lại mã bằng cấp và thử lại.</p>
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
};
