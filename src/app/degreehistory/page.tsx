"use client";

import { getContract } from "@/lib/contract";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { ethers } from "ethers";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { toast } from "react-toastify";

// 🔹 Đăng ký các thành phần cần thiết
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Degree {
    id: string;              // ID của bằng cấp
    degreeId: string;        // Mã bằng cấp
    studentName: string;     // Tên sinh viên
    university: string;      // Trường đại học
    dateOfBirth: string;     // Ngày sinh
    graduationDate: string;  // Ngày tốt nghiệp
    grade: string;           // Xếp loại
    score: number;           // Điểm tổng kết
    issueDate: string;       // Ngày cấp bằng
    ipfsHash: string;        // Hash IPFS lưu trữ bằng cấp
    timestamp: string;       // Thời gian thực hiện hành động
    status: "Pending" | "Approved" | "Rejected";
}

const DegreeHistoryPage = () => {
    const [degreeHistory, setDegreeHistory] = useState<Degree[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const fetchDegrees = async () => {
        if (!window.ethereum) {
            toast.error("Vui lòng kết nối MetaMask!");
            return;
        }

        setLoading(true);

        try {
            // Kết nối với MetaMask
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getContract(provider); // Lấy hợp đồng

            // Kiểm tra nếu MetaMask đã kết nối đúng
            const network = await provider.getNetwork();
            console.log("Network:", network);

            // Lấy tổng số bằng cấp
            const totalDegrees = await contract.totalDegrees();
            console.log("Total Degrees:", totalDegrees.toString());

            if (totalDegrees.toNumber() === 0) {
                toast.warn("Không có bằng cấp nào được tìm thấy!");
                setLoading(false);
                return;
            }

            // Lấy danh sách bằng cấp từ blockchain
            const degrees: Degree[] = await Promise.all(
                Array.from({ length: totalDegrees.toNumber() }, async (_, i) => {
                    const degreeId = (i + 1).toString(); // ID bắt đầu từ 1 (chuyển thành string)
                    const degree = await contract.getDegree(degreeId);

                    const issueTimestamp = degree.timestamp ? new Date(Number(degree.timestamp) * 1000).toLocaleDateString() : "Không có dữ liệu";

                    return {
                        id: degreeId,
                        degreeId: degreeId,
                        studentName: degree.studentName,
                        university: degree.university,
                        dateOfBirth: new Date(Number(degree.dateOfBirth) * 1000).toLocaleDateString(),
                        graduationDate: new Date(Number(degree.graduationDate) * 1000).toLocaleDateString(),
                        grade: degree.grade,
                        score: Number(degree.score),
                        ipfsHash: degree.ipfsHash,
                        issueDate: new Date(Number(degree.timestamp) * 1000).toLocaleDateString(),
                        status: degree.status === 0 ? "Pending" : degree.status === 1 ? "Approved" : "Rejected", // Đảm bảo trạng thái đúng                      
                        timestamp: issueTimestamp, // Thêm timestamp
                    };
                })
            );

            console.log("📌 Danh sách bằng cấp sau khi format:", degrees);
            setDegreeHistory(degrees); // Lưu danh sách Degree vào state
        } catch (error) {
            console.error("❌ Lỗi khi lấy dữ liệu từ blockchain:", error);
            toast.error("Không thể tải dữ liệu từ blockchain!");
        } finally {
            setLoading(false);
        }
    };

    /** 🔹 Hiển thị chi tiết */
    const handleShowDetails = (history: Degree) => {
        setSelectedDegree(history);
        setShowDetailModal(true);
    };

    useEffect(() => {
        if (searchText.trim() === "") {
            setSuggestions([]);
            return;
        }

        const matchedSuggestions = degreeHistory
            .filter((history) =>
                history.degreeId.includes(searchText) ||
                history.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
                history.university.toLowerCase().includes(searchText.toLowerCase())
            )
            .map((history) => `${history.degreeId} - ${history.studentName} - ${history.university}`);

        setSuggestions(matchedSuggestions);
    }, [searchText, degreeHistory]);

    useEffect(() => {
        fetchDegrees();
    }, []);

    /** 🔹 Bộ lọc tìm kiếm */
    const filteredHistory = degreeHistory.filter((history) => {
        const lowerCaseSearch = searchText.toLowerCase();

        return (
            lowerCaseSearch === "" ||
            history.degreeId.toLowerCase().includes(lowerCaseSearch) ||  // 🔹 Tìm theo mã bằng cấp
            history.studentName.toLowerCase().includes(lowerCaseSearch) ||  // 🔹 Tìm theo tên sinh viên
            history.university.toLowerCase().includes(lowerCaseSearch)  // 🔹 Tìm theo tên trường
        );
    });

    /** 🔹 Xuất CSV */
    const exportToCSV = () => {
        if (degreeHistory.length === 0) {
            toast.error("Không có dữ liệu để xuất!");
            return;
        }

        const csvHeader = ["Degree Code,Student Name,School,Date of Issue,Score"];
        const csvRows = degreeHistory.map(history =>
            `${history.degreeId},"${history.studentName}","${history.university}",${history.timestamp},"${history.score}"`
        );

        const csvContent = [csvHeader, ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        saveAs(blob, "degree_history.csv");
    };

    /** 🔹 Xuất PDF */
    const exportToPDF = () => {
        if (degreeHistory.length === 0) {
            toast.error("Không có dữ liệu để xuất!");
            return;
        }

        const doc = new jsPDF();
        doc.text("Degree History", 14, 10);
        doc.setFont("Arial");
        const tableColumn = ["Degree Id", "Student Name", "University", "Date Of Issue", "Score", "Holder"];
        const tableRows = degreeHistory.map(history => [
            history.degreeId,
            history.studentName,
            history.university,
            history.timestamp,
            history.score,
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save("degree_history.pdf");
    };

    // xuất pdf theo bằng
    const exportDegreePDF = (degree: Degree | null) => {
        if (!degree) {
            toast.error("Không có dữ liệu để xuất!");
            return;
        }

        // 📝 Tạo file PDF dọc (A4 Portrait)
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        // 🖼 Thêm hình nền watermark
        const img = new Image();
        img.src = "/images/trong1.jpg";

        img.onload = function () {
            const pageWidth = 210;
            const pageHeight = 297;
            // 📸 Căn chỉnh watermark full trang
            const imgAspectRatio = img.width / img.height;
            let imgWidth = pageWidth;
            let imgHeight = pageHeight;

            if (imgAspectRatio > 1) {
                imgWidth = pageHeight * imgAspectRatio;
            } else {
                imgHeight = pageWidth / imgAspectRatio;
            }

            const xOffset = (pageWidth - imgWidth) / 2;
            const yOffset = (pageHeight - imgHeight) / 2;

            doc.addImage(img, "PNG", xOffset, yOffset, imgWidth, imgHeight, "", "FAST");

            // 🎓 Tiêu đề chính
            doc.setFont("times", "bold");
            doc.setFontSize(26);
            doc.setTextColor(0, 0, 80);
            doc.text("DEGREE CERTIFICATION", pageWidth / 2, 40, { align: "center" });

            // 🏛 Hiển thị trường đại học
            doc.setFontSize(18);
            doc.setFont("times", "italic");
            doc.text(degree.university.toUpperCase(), pageWidth / 2, 55, { align: "center" });

            // 📜 Nội dung chứng nhận
            doc.setFontSize(14);
            doc.setFont("times", "normal");
            doc.text("This is to certify that", pageWidth / 2, 75, { align: "center" });

            doc.setFontSize(22);
            doc.setFont("times", "bold");
            doc.text(degree.studentName.toUpperCase(), pageWidth / 2, 90, { align: "center" });

            doc.setFontSize(14);
            doc.setFont("times", "normal");
            doc.text(
                "has successfully completed the certification process with the following details:",
                pageWidth / 2,
                105,
                { align: "center" }
            );

            // 🔹 Thông tin chính (nằm ngoài bảng)
            doc.setFontSize(14);
            doc.setFont("times", "bold");
            doc.text("Degree ID:", 20, 125);
            doc.setFont("times", "normal");
            doc.text(degree.degreeId, 50, 125);

            doc.setFont("times", "bold");
            doc.text("Date Issued:", 20, 135);
            doc.setFont("times", "normal");
            doc.text(degree.timestamp, 50, 135);

            doc.setFont("times", "bold");
            doc.text("Grade:", 20, 145);
            doc.setFont("times", "normal");
            doc.text(degree.grade, 50, 145);

            doc.setFont("times", "bold");
            doc.text("Score:", 20, 155);
            doc.setFont("times", "normal");
            doc.text(degree.score !== undefined ? degree.score.toFixed(2) : "N/A", 50, 155);

            // 🔹 Thêm thông tin bổ sung (Ngày sinh, Ngày tốt nghiệp, IPFS Hash)
            doc.setFont("times", "bold");
            doc.text("Date of Birth:", 20, 165);
            doc.setFont("times", "normal");
            doc.text(degree.dateOfBirth, 50, 165);

            doc.setFont("times", "bold");
            doc.text("Graduation Date:", 20, 175);
            doc.setFont("times", "normal");
            doc.text(degree.graduationDate, 50, 175);

            doc.setFont("times", "bold");
            doc.text("IPFS Hash:", 20, 185);
            doc.setFont("times", "normal");
            doc.text(degree.ipfsHash, 50, 185);

            // ✍ Chữ ký & Ngày cấp
            doc.setFontSize(14);
            doc.setFont("times", "italic");
            doc.text("Authorized Signature:", 140, 260);
            doc.text("_________________", 140, 265);

            // 📄 Lưu file PDF
            doc.save(`Degree_Certification_${degree.studentName}.pdf`);
        };
    };


    /** 🔹 Thống kê số lượng cấp bằng theo tháng */
    const getMonthlyStats = () => {
        const monthData: { [key: string]: number } = {};

        degreeHistory.forEach((history) => {
            const month = new Date(history.timestamp).toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
            monthData[month] = (monthData[month] || 0) + 1;
        });

        return {
            labels: Object.keys(monthData), // Phải là array của string (category)
            datasets: [{
                label: "Số lượng cấp bằng theo tháng",
                data: Object.values(monthData),
                backgroundColor: "rgba(54, 162, 235, 0.6)",
            }],
        };
    };

    return (
        <Container>
            <h3 className="mb-4 mt-4">📜 Lịch Sử Cấp Bằng</h3>

            <div style={{ position: "relative" }}>
                <Form.Control
                    type="text"
                    placeholder="🔍 Nhập mã bằng cấp, tên sinh viên hoặc trường..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="mb-3"
                />

                {suggestions.length > 0 && (
                    <ul style={{
                        position: "absolute",
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        width: "100%",
                        listStyleType: "none",
                        padding: "10px",
                        margin: "0",
                        maxHeight: "150px",
                        overflowY: "auto",
                        zIndex: 1000
                    }}>
                        {suggestions.map((item, index) => (
                            <li key={index}
                                style={{ padding: "5px", cursor: "pointer" }}
                                onClick={() => setSearchText(item.split(" - ")[0])}>
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
            </div>



            {/* 📂 Xuất dữ liệu */}
            <div className="d-flex mb-3">
                <Button variant="success" onClick={exportToCSV}>
                    📂 Xuất CSV
                </Button>
                <Button variant="danger" className="ms-2" onClick={exportToPDF}>
                    📑 Xuất PDF
                </Button>
            </div>

            {/* 📋 Bảng lịch sử */}
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th className="text-center align-middle">Mã Bằng Cấp</th>
                        <th className="text-center align-middle">Tên Sinh Viên</th>
                        <th className="text-center align-middle">Trường</th>
                        <th className="text-center align-middle">Ngày Cấp</th>
                        <th className="text-center align-middle">Điểm</th>
                        <th className="text-center align-middle">Chi Tiết</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map((history) => (
                            <tr key={history.degreeId}>
                                <td className="text-center align-middle" style={{
                                    width: "50px",
                                    maxWidth: "150px",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis"
                                }}>{history.degreeId}</td>
                                <td className="text-center align-middle">{history.studentName}</td>
                                <td className="text-center align-middle">{history.university}</td>
                                <td className="text-center align-middle">{history.timestamp}</td>
                                <td className="text-center align-middle">{history.score}</td>
                                <td className="text-center align-middle">
                                    <Button variant="info" size="sm" onClick={() => handleShowDetails(history)}>
                                        🔍 Xem
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="text-center">❌ Không có lịch sử cấp bằng</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* 📊 Biểu đồ thống kê */}
            {degreeHistory.length > 0 && (
                <div className="my-4">
                    <h4>📊 Thống Kê Cấp Bằng Theo Tháng</h4>
                    <Bar data={getMonthlyStats()} />
                </div>
            )}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>📜 Chi Tiết Bằng Cấp</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDegree ? (
                        <div>
                            <p><strong>🆔 Mã Bằng Cấp:</strong> {selectedDegree.degreeId}</p>
                            <p><strong>👨‍🎓 Tên Sinh Viên:</strong> {selectedDegree.studentName}</p>
                            <p><strong>🏫 Trường Đại Học:</strong> {selectedDegree.university}</p>
                            <p><strong>📅 Ngày Cấp:</strong> {selectedDegree.timestamp}</p>
                            <p><strong>🔢 Điểm Số:</strong> {selectedDegree.score !== undefined ? selectedDegree.score.toFixed(2) : "N/A"}</p>
                            <p><strong>📅 Ngày Sinh:</strong> {selectedDegree.dateOfBirth}</p>
                            <p><strong>ipfsHash:</strong> {selectedDegree.ipfsHash}</p>
                        </div>
                    ) : (
                        <p>Không có dữ liệu.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => {
                            if (selectedDegree) {
                                exportDegreePDF(selectedDegree);
                            } else {
                                toast.error("Không có dữ liệu bằng cấp để xuất PDF!");
                            }
                        }}
                    >
                        📄 Xuất PDF
                    </Button>

                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default DegreeHistoryPage;
