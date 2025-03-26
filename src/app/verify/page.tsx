"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";

export default function VerifyCertificate() {
    const [searchInput, setSearchInput] = useState("");
    const [result, setResult] = useState<{ valid: boolean; data?: any } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Xử lý tìm kiếm
    const handleSearch = async () => {
        if (!searchInput.trim()) {
            setError("Vui lòng nhập số hiệu bằng cấp hoặc tên trường!");
            return;
        }

        setLoading(true);
        setResult(null);
        setError("");

        try {
            // Kiểm tra xem input có phải là số hiệu hay tên trường
            const trimmedInput = searchInput.trim();

            const isNumber = /^\d+$/.test(trimmedInput);
            let url = "";

            if (isNumber) {
                url = `/api/degrees?degreeNumber=${encodeURIComponent(trimmedInput)}`;
            } else {
                url = `/api/degrees?university=${encodeURIComponent(trimmedInput)}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setResult({ valid: true, data: data.degrees });
            } else {
                setError("Không tìm thấy thông tin bằng cấp. Vui lòng kiểm tra lại!");
            }
        } catch (err: any) {
            setResult({ valid: false });
            setError(err.message || "Không tìm thấy thông tin. Vui lòng kiểm tra lại!");
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý khi nhấn Enter
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="mt-4" style={styles.container}>

            <h1 style={styles.title}>Tra cứu bằng cấp</h1>
            <p style={styles.subtitle}>Nhập mã bằng cấp (chỉ số) hoặc tên trường (chữ) để xác minh.</p>

            <div style={styles.form}>
                <input
                    type="text"
                    placeholder="Nhập số hiệu bằng cấp hoặc tên trường"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
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
                        <div style={styles.certificatesGrid}>
                            {result.data.map((cert, index) => (
                                <div key={index} style={styles.certCard}>
                                    <p><strong>Mã bằng cấp:</strong> {cert.degreeNumber}</p>
                                    <p><strong>Người nhận:</strong> {cert.studentName}</p>
                                    <p><strong>Trường:</strong> {cert.university}</p>
                                    <p><strong>Ngành:</strong> {cert.major}</p>
                                    <p><strong>Ngày sinh:</strong> {cert.dateOfBirth}</p>
                                    <p><strong>Ngày tốt nghiệp:</strong> {cert.graduationDate}</p>
                                    <p><strong>Xếp loại:</strong> {cert.grade}</p>
                                    <p><strong>Điểm:</strong> {cert.score}</p>
                                    <p>
                                        <strong>NFT trên Explorer:</strong>{" "}
                                        <a
                                            href={`https://testnet.coinex.net/token/0x288887A325a73497912f34e126A47A5383cE7f69?a=${cert.nftId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Xem trên CoinEx Smart Chain
                                        </a>
                                    </p>
                                    <div style={{ marginTop: "10px", textAlign: "center" }}>
                                        <QRCodeCanvas
                                            value={`https://testnet.coinex.net/token/0x288887A325a73497912f34e126A47A5383cE7f69?a=${cert.nftId}`}
                                            size={128}
                                        />
                                        <p style={{ fontSize: "0.9rem", color: "#555" }}>Quét mã để xem trên CoinEx</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.certSingle}>
                            <p><strong>Mã bằng cấp:</strong> {result.data.certificateID}</p>
                            <p><strong>Người nhận:</strong> {result.data.studentName}</p>
                            <p><strong>Trường:</strong> {result.data.university}</p>
                            <p><strong>Ngành:</strong> {result.data.major}</p>
                            <p><strong>Ngày sinh:</strong> {result.data.dateOfBirth}</p>
                            <p><strong>Ngày tốt nghiệp:</strong> {result.data.graduationDate}</p>
                            <p><strong>Xếp loại:</strong> {result.data.grade}</p>
                            <p><strong>Điểm:</strong> {result.data.score}</p>
                            <p>
                                <strong>NFT trên Explorer:</strong>{" "}
                                <a
                                    href={`https://testnet.coinex.net/token/0x288887A325a73497912f34e126A47A5383cE7f69?a=${result.data.nftId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Xem trên CoinEx Smart Chain
                                </a>
                            </p>
                            <div style={{ marginTop: "10px", textAlign: "center" }}>
                                <QRCodeCanvas
                                    value={`https://testnet.coinex.net/token/0x288887A325a73497912f34e126A47A5383cE7f69?a=${result.data.nftId}`}
                                    size={128}
                                />
                                <p style={{ fontSize: "0.9rem", color: "#555" }}>Quét mã để xem trên CoinEx</p>
                            </div>
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
        backgroundColor: "#fff",
        border: "1px solid #ddd",
    },
    certSingle: {
        textAlign: "left",
        padding: "15px",
        borderRadius: "10px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
        border: "1px solid #ddd",
    },
};