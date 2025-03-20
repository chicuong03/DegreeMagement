"use client";

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import CryptoJS from "crypto-js";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Modal, Row, Table } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { toast } from "react-toastify";
// Đăng ký các thành phần cần thiết
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Certificate = {
    id: number;
    studentName: string;
    university: string;
    dateOfBirth: string;
    graduationDate: string;
    score: number | null;
    grade: string;
    major: string;
    ipfsHash: string;
    issueDate: string | number;
    status: "Pending" | "Approved" | "Rejected";
};

const DegreeHistoryPage = () => {
    const [degreeHistory, setDegreeHistory] = useState<Certificate[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedDegree, setSelectedDegree] = useState<Certificate | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedChart, setSelectedChart] = useState("monthly");


    async function fetchCertificates() {
        try {
            const response = await fetch("/api/degrees");
            const data = await response.json();

            console.log("API Data:", data);
            if (data.success && Array.isArray(data.degrees)) {
                setDegreeHistory(data.degrees);
                console.log("Cập nhật state `degreeHistory`:", data.degrees);
            } else {
                console.warn("API không trả về danh sách bằng cấp hợp lệ.");
            }
        } catch (error) {
            console.error("Lỗi khi tải bằng cấp:", error);
        }
    }

    useEffect(() => {

        fetchCertificates();
    }, []);
    /** Hiển thị chi tiết */
    const handleShowDetails = (history: Certificate) => {
        setSelectedDegree(history);
        setShowDetailModal(true);
    };

    const formatDate = (date: any): string => {
        if (!date) return "N/A";
        if (!isNaN(Number(date))) return new Date(Number(date) * 1000).toLocaleDateString("vi-VN");
        return new Date(date).toLocaleDateString("vi-VN");
    };
    useEffect(() => {
        if (searchText.trim() === "") {
            setSuggestions([]);
            return;
        }

        const matchedSuggestions = degreeHistory
            .filter((history) =>
                history.id.toString().includes(searchText) ||
                history.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
                history.university.toLowerCase().includes(searchText.toLowerCase())
            )
            .map((history) => `${history.id} - ${history.studentName} - ${history.university}`);

        setSuggestions(matchedSuggestions);
    }, [searchText, degreeHistory]);



    /** Bộ lọc tìm kiếm */
    const filteredHistory = degreeHistory.filter((history) => {
        const lowerCaseSearch = searchText.toLowerCase();
        return (
            lowerCaseSearch === "" ||
            history.id.toString().includes(lowerCaseSearch) ||
            history.studentName.toLowerCase().includes(lowerCaseSearch) ||
            history.university.toLowerCase().includes(lowerCaseSearch)
        );
    });

    /** Xuất CSV */
    const exportToCSV = () => {
        if (degreeHistory.length === 0) {
            toast.error("Không có dữ liệu để xuất!");
            return;
        }

        // ✅ Định dạng tiêu đề CSV
        const csvHeader = ["ID NFT", "Student Name", "Major", "University", "IsueDate", "Point", "Birth"];

        // ✅ Chuyển đổi dữ liệu sang dạng CSV, xử lý ngày & số hợp lệ
        const csvRows = degreeHistory.map(history => [
            history.id,
            `"${history.studentName}"`,
            `"${history.major}"`,
            `"${history.university}"`,
            formatDate(history.issueDate),
            history.score != null ? Number(history.score).toFixed(2) : "N/A",
            formatDate(history.dateOfBirth)
        ].join(","));

        // ✅ Gộp nội dung CSV
        const csvContent = [csvHeader.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        // ✅ Lưu file
        saveAs(blob, "degree_history.csv");
    };

    /** Xuất PDF */
    const exportToPDF = () => {
        if (degreeHistory.length === 0) {
            toast.error("Không có dữ liệu để xuất!");
            return;
        }

        const doc = new jsPDF();

        // ✅ Tiêu đề chính
        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.text("List Certificate", 105, 15, { align: "center" });

        // ✅ Tạo bảng PDF với tiêu đề
        autoTable(doc, {
            startY: 25,
            head: [["ID NFT", "Student Name", "Major", "University", "IsueDate", "Point", "Birth"]],
            body: degreeHistory.map(history => [
                history.id,
                history.studentName,
                history.major,
                history.university,
                formatDate(history.issueDate),
                history.score != null ? Number(history.score).toFixed(2) : "N/A",
                formatDate(history.dateOfBirth)
            ]),
        });

        // ✅ Xuất file PDF
        doc.save("degree_history.pdf");
    };

    // pdf theo cá nhân
    const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY || "DEFAULT_SECRET_KEY";

    const exportDegreePDF = (degree: Certificate | null) => {
        if (!degree) {
            toast.error("Không có dữ liệu để xuất!");
            return;
        }

        // 🛠 Tạo file PDF (A4 Portrait)
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        // 🖼 Thêm hình nền watermark mờ
        const img = new Image();
        img.src = "/images/trong1.png";

        img.onload = function () {
            const pageWidth = 210;
            const pageHeight = 297;
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

            // 🎓 **Tiêu đề chính**
            doc.setFont("times", "bold");
            doc.setFontSize(26);
            doc.setTextColor(0, 0, 80);
            doc.text("DEGREE CERTIFICATION", pageWidth / 2, 40, { align: "center" });

            // 📚 **Thông tin trường đại học**
            doc.setFontSize(18);
            doc.setFont("times", "italic");
            doc.text(degree.university.toUpperCase(), pageWidth / 2, 55, { align: "center" });

            // 🏆 **Tên sinh viên**
            doc.setFontSize(14);
            doc.setFont("times", "normal");
            doc.text("This is to certify that", pageWidth / 2, 75, { align: "center" });

            doc.setFontSize(22);
            doc.setFont("times", "bold");
            doc.text(degree.studentName.toUpperCase(), pageWidth / 2, 90, { align: "center" });

            // 🔹 **Chuyên ngành**
            doc.setFontSize(14);
            doc.setFont("times", "normal");
            doc.text("has successfully completed the program in:", pageWidth / 2, 105, { align: "center" });

            doc.setFontSize(20);
            doc.setFont("times", "bold");
            doc.text(degree.major.toUpperCase(), pageWidth / 2, 115, { align: "center" });

            // 📅 **Thông tin chi tiết**
            const formatDate = (date: any): string => {
                if (!date) return "N/A";
                if (!isNaN(Number(date))) return new Date(Number(date) * 1000).toLocaleDateString("vi-VN");
                return new Date(date).toLocaleDateString("vi-VN");
            };

            doc.setFontSize(14);
            doc.setFont("times", "bold");
            doc.text("Degree ID:", 20, 130);
            doc.setFont("times", "normal");
            doc.text(degree.id.toString(), 70, 130);

            doc.setFont("times", "bold");
            doc.text("Date Issued:", 20, 140);
            doc.setFont("times", "normal");
            doc.text(formatDate(degree.issueDate), 70, 140);

            doc.setFont("times", "bold");
            doc.text("Date of Birth:", 20, 150);
            doc.setFont("times", "normal");
            doc.text(formatDate(degree.dateOfBirth), 70, 150);

            doc.setFont("times", "bold");
            doc.text("Graduation Date:", 20, 160);
            doc.setFont("times", "normal");
            doc.text(formatDate(degree.graduationDate), 70, 160);

            doc.setFont("times", "bold");
            doc.text("Grade:", 20, 170);
            doc.setFont("times", "normal");
            doc.text(degree.grade || "N/A", 70, 170);

            doc.setFont("times", "bold");
            doc.text("Score:", 20, 180);
            doc.setFont("times", "normal");
            doc.text(degree.score != null ? String(degree.score) : "N/A", 70, 180);

            doc.setFont("times", "bold");
            doc.text("IPFS Hash:", 20, 190);
            doc.setFont("times", "normal");
            doc.text(degree.ipfsHash ? degree.ipfsHash.slice(0, 20) + "..." : "N/A", 70, 190);

            doc.setFont("times", "bold");
            doc.text("Date Issued:", 140, 240);
            doc.setFont("times", "normal");
            doc.text(formatDate(degree.issueDate), 170, 240);

            // ✍️ **Chữ ký & xác nhận**
            doc.setFontSize(14);
            doc.setFont("times", "italic");
            doc.text("Authorized Signature:", 140, 260);
            doc.text("_________________", 140, 265);

            // 🔐 **Tạo chữ ký số**
            const signatureData = `${degree.id}-${degree.studentName}-${degree.university}-${degree.issueDate}`;
            const digitalSignature = CryptoJS.HmacSHA256(signatureData, PRIVATE_KEY).toString();

            // 🔹 **Hiển thị chữ ký số**
            doc.setFont("times", "bold");
            doc.text("Digital Signature:", 20, 275);
            doc.setFont("times", "normal");
            doc.text(digitalSignature.slice(0, 50) + "...", 70, 275);

            // 📥 **Lưu file PDF**
            doc.save(`Degree_Certification_${degree.studentName}.pdf`);
        };
    };

    /** Thống kê số lượng cấp bằng theo tháng */
    const getMonthlyStats = (certificates: Certificate[]) => {
        console.log("📢 Dữ liệu đầu vào:", certificates);

        // 🔹 Kiểm tra nếu `certificates` không hợp lệ hoặc rỗng
        if (!Array.isArray(certificates) || certificates.length === 0) {
            console.warn("⚠️ Không có dữ liệu bằng cấp!");
            return {
                labels: [],
                datasets: [
                    {
                        label: "Số lượng cấp bằng theo tháng",
                        data: [],
                        backgroundColor: "rgba(54, 162, 235, 0.6)",
                    },
                ],
            };
        }

        // 🔹 Biến chứa số lượng cấp bằng theo từng tháng
        const monthData: { [key: string]: number } = {};

        // 🔹 Duyệt qua danh sách bằng cấp và gom nhóm theo tháng
        certificates.forEach((certificate) => {
            // ✅ Kiểm tra nếu `issueDate` hợp lệ
            if (!certificate.issueDate) {
                console.warn(`⚠️ Bằng cấp ID ${certificate.id} không có ngày cấp!`);
                return;
            }

            // 🔹 Chuyển `issueDate` sang timestamp nếu cần
            const issueDateTimestamp = isNaN(Number(certificate.issueDate))
                ? new Date(certificate.issueDate).getTime()
                : Number(certificate.issueDate) * 1000;

            if (isNaN(issueDateTimestamp)) {
                console.warn(`⚠️ Ngày cấp không hợp lệ: ${certificate.issueDate}`);
                return;
            }

            // 🔹 Format thành "Tháng Năm" (VD: "Tháng 3 2024")
            const formattedMonth = new Date(issueDateTimestamp).toLocaleDateString("vi-VN", {
                month: "long",
                year: "numeric",
            });

            // ✅ Tăng số lượng cấp bằng cho tháng đó
            monthData[formattedMonth] = (monthData[formattedMonth] || 0) + 1;
        });

        console.log("📊 Thống kê theo tháng:", monthData);

        // ✅ Trả về dữ liệu biểu đồ
        return {
            labels: Object.keys(monthData), // Danh sách các tháng
            datasets: [
                {
                    label: "Số lượng cấp bằng theo tháng",
                    data: Object.values(monthData), // Số lượng bằng cấp tương ứng mỗi tháng
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
            ],
        };
    };

    const getUniversityStats = (certificates: Certificate[]) => {
        console.log(" Dữ liệu đầu vào:", certificates);

        //  Kiểm tra nếu `certificates` không hợp lệ hoặc rỗng
        if (!Array.isArray(certificates) || certificates.length === 0) {
            console.warn(" Không có dữ liệu bằng cấp!");
            return {
                labels: [],
                datasets: [
                    {
                        label: "Số lượng cấp bằng theo trường đại học",
                        data: [],
                        backgroundColor: "rgba(75, 192, 192, 0.6)", // Màu xanh
                    },
                ],
            };
        }

        // dếm sl bang cấp
        const universityData: { [key: string]: number } = {};

        certificates.forEach((certificate) => {
            if (!certificate.university) {
                console.warn(`Bằng cấp ID ${certificate.id} không có thông tin trường đại học!`);
                return;
            }


            universityData[certificate.university] = (universityData[certificate.university] || 0) + 1;
        });

        console.log("Thống kê theo trường đại học:", universityData);


        return {
            labels: Object.keys(universityData),
            datasets: [
                {
                    label: "Số lượng cấp bằng theo trường đại học",
                    data: Object.values(universityData),
                    backgroundColor: "rgba(75, 192, 192, 0.6)", // Màu xanh nhẹ 
                },
            ],
        };
    };


    return (
        <Container>
            <Row>
                <Col md={3}>
                    <div style={adminStyle.sidebar}>
                        <h5>Management</h5>
                        <ul style={adminStyle.menu}>
                            <li>
                                <Link href="/manage" className="btn btn-outline-primary btn-sm w-100">
                                    Manage Users
                                </Link>
                            </li>
                            <li>
                                <Link href="/manage/degrees" className="btn btn-outline-primary btn-sm w-100">
                                    Manage Degrees
                                </Link>
                            </li>
                            <li>
                                <Link href="/manage/university" className="btn btn-outline-primary btn-sm w-100">
                                    Manage Universities
                                </Link>
                            </li>
                            <li>
                                <Link href="/degreehistory" className="btn btn-outline-primary btn-sm w-100">
                                    History Degree
                                </Link>
                            </li>
                            <li>
                                <Link href="/manage/universityKYC" className="btn btn-outline-primary btn-sm w-100">
                                    KYC Resign
                                </Link>
                            </li>
                            <li>
                                <Link href="/blogs" className="btn btn-outline-primary btn-sm w-100">
                                    Blogs
                                </Link>
                            </li>

                        </ul>
                    </div>
                </Col>

                <Col md={9}>
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

                    {/* Xuất dữ liệu */}
                    <div className="d-flex mb-3">
                        <Button variant="success" onClick={exportToCSV}>
                            📂 Xuất CSV
                        </Button>
                        <Button variant="danger" className="ms-2" onClick={exportToPDF}>
                            📑 Xuất PDF
                        </Button>
                    </div>

                    {/*  Bảng lịch sử */}
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th className="text-center align-middle">Mã Bằng Cấp</th>
                                <th className="text-center align-middle">Tên Sinh Viên</th>
                                <th className="text-center align-middle">Trường</th>
                                <th className="text-center align-middle">Chuyên Ngành</th>
                                <th className="text-center align-middle">Ngày Cấp</th>
                                <th className="text-center align-middle">Điểm</th>
                                <th className="text-center align-middle">Chi Tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((history) => (
                                    <tr key={history.id}>
                                        <td className="text-center align-middle" style={{
                                            width: "50px",
                                            maxWidth: "150px",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis"
                                        }}>{history.id}</td>
                                        <td className="text-center align-middle">{history.studentName}</td>
                                        <td className="text-center align-middle">{history.university}</td>
                                        <td className="text-center align-middle">{history.major}</td>
                                        <td>{formatDate(history.issueDate)}</td>
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

                    <div>
                        <h4>📊 Lựa Chọn Thống Kê</h4>
                        <Form.Select
                            value={selectedChart}
                            onChange={(e) => setSelectedChart(e.target.value)}
                            className="mb-4"
                        >
                            <option value="monthly">📅 Thống Kê Theo Tháng</option>
                            <option value="university">🏫 Thống Kê Theo Trường Đại Học</option>
                            <option value="both">📊 Hiển Thị Cả Hai</option>
                        </Form.Select>

                        {/* Biểu đồ thống kê theo tháng */}
                        {(selectedChart === "monthly" || selectedChart === "both") && degreeHistory.length > 0 && (
                            <div className="my-4">
                                <h4>📊 Thống Kê Cấp Bằng Theo Tháng</h4>
                                <Bar data={getMonthlyStats(degreeHistory)} />
                            </div>
                        )}

                        {/* Biểu đồ thống kê theo trường đại học */}
                        {(selectedChart === "university" || selectedChart === "both") && degreeHistory.length > 0 && (
                            <div className="my-4">
                                <h4>🏫 Thống Kê Cấp Bằng Theo Trường Đại Học</h4>
                                <Bar data={getUniversityStats(degreeHistory)} />
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>📜 Chi Tiết Bằng Cấp</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDegree ? (
                        <div>
                            <p><strong>🆔 Mã Bằng Cấp:</strong> {selectedDegree.id}</p>
                            <p><strong>👨‍🎓 Tên Sinh Viên:</strong> {selectedDegree.studentName}</p>
                            <p><strong>📖 Chuyên Ngành:</strong> {selectedDegree.major}</p>
                            <p><strong>🏫 Trường Đại Học:</strong> {selectedDegree.university}</p>
                            <p><strong>📅 Ngày Cấp:</strong> {formatDate(selectedDegree.issueDate)}</p>
                            <p><strong>🔢 Điểm Số:</strong> {selectedDegree.score}</p>
                            <p><strong>📅 Ngày Sinh:</strong> {selectedDegree.dateOfBirth}</p>
                            <p><strong>🛅 ipfsHash:</strong> {selectedDegree.ipfsHash}</p>
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
const adminStyle = {
    sidebar: {
        backgroundColor: '#fff',
        padding: '15px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
    },
    menu: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
};
export default DegreeHistoryPage;
