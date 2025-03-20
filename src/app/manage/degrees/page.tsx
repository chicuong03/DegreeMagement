"use client";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { Modal as BootstrapModal, Button, Col, Container, Row, Table } from "react-bootstrap";
import { toast } from "react-toastify";

type DegreeStatus = "Pending" | "Approved" | "Rejected";


type Certificate = {
    id: number;
    studentName: string;
    university: string;
    dateOfBirth: string;
    graduationDate: string;
    score: number;
    grade: string;
    major: string;
    ipfsHash: string;
    issueDate: string;
    status: "Pending" | "Approved" | "Rejected";
};


declare global {
    interface Window {
        ethereum?: any;
    }
}
const ManageDegreesPage = () => {
    const [degrees, setDegrees] = useState<Certificate[]>([]);
    const [currentDegree, setCurrentDegree] = useState<Certificate | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [universities, setUniversities] = useState<{ id: number, name: string }[]>([]);
    const [activeTab, setActiveTab] = useState<DegreeStatus>("Pending");
    const [certificates, setCertificates] = useState<Certificate[]>([]);

    const filteredDegrees = certificates.filter(degree => degree.status === activeTab);



    /** Lấy danh sách trường đại học */
    const fetchUniversities = async () => {
        try {
            const response = await fetch("/api/universities");
            if (!response.ok) throw new Error("Không thể tải danh sách trường");
            const data = await response.json();
            setUniversities(data);
        } catch (error) {
            console.error("Lỗi:", error);
            toast.error("Không thể tải danh sách trường!");
        }
    };

    const formatScore = (score: unknown): string => {
        if (typeof score === "number") return score.toFixed(2); // Hiển thị 2 chữ số thập phân
        if (typeof score === "string") {
            const parsedScore = parseFloat(score);
            return isNaN(parsedScore) ? "N/A" : parsedScore.toFixed(2);
        }
        return "N/A";
    };

    const statusConfig = {
        Pending: { color: "warning", label: "Chờ Duyệt" },
        Approved: { color: "success", label: "Đã Duyệt" },
        Rejected: { color: "danger", label: "Từ Chối" }
    } as const;

    const renderStatusBadge = (status: "Pending" | "Approved" | "Rejected") => {
        const statusConfig = {
            Pending: { color: "warning", label: "Chờ Duyệt" },
            Approved: { color: "success", label: "Đã Duyệt" },
            Rejected: { color: "danger", label: "Từ Chối" }
        };

        return <span className={`badge bg-${statusConfig[status].color}`}>{statusConfig[status].label}</span>;
    };
    const handleShowDetails = (certificate: Certificate) => {
        setCurrentDegree(certificate);
        setShowDetailModal(true);
    };

    async function fetchCertificates() {
        try {
            const response = await fetch("/api/degrees");
            const data = await response.json();

            console.log(" API Data:", data);
            if (data.success && Array.isArray(data.degrees)) {
                setCertificates(data.degrees);
                console.log(" Cập nhật state `certificates`:", data.degrees);
            } else {
                console.warn(" API không trả về danh sách bằng cấp hợp lệ.");
            }
        } catch (error) {
            console.error(" Lỗi khi tải bằng cấp:", error);
        }
    }

    useEffect(() => {

        fetchCertificates();
    }, []);

    useEffect(() => {
        fetchUniversities();
    }, []);

    const link = `https://testnet.coinex.net/token/0x9227241afb4F160d2d6460dACB0151b60e25e55A?a=${currentDegree?.id}`;

    return (
        <div style={adminStyle.page}>
            <Container style={adminStyle.content}>
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
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>Quản Lý Bằng Cấp</h3>
                            <div className="btn-group">
                                {(["Pending", "Approved", "Rejected"] as DegreeStatus[]).map(status => (
                                    <Button
                                        key={status}
                                        variant={activeTab === status ? "primary" : "outline-primary"}
                                        onClick={() => setActiveTab(status)}
                                    >
                                        {status === "Pending" ? "Chờ Duyệt" : status === "Approved" ? "Đã Duyệt" : "Từ Chối"}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {isLoading ? (
                            <div>Đang tải danh sách bằng cấp...</div>
                        ) : filteredDegrees.length > 0 ? (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>ID NFT</th>
                                        <th>Tên Sinh Viên</th>
                                        <th>Trường</th>
                                        <th>Ngành</th>
                                        <th>Ngày Cấp</th>
                                        <th>Xếp Loại</th>
                                        <th>Điểm</th>
                                        <th>Trạng Thái</th>
                                        <th>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDegrees.length > 0 ? (
                                        filteredDegrees.map((certificate) => (
                                            <tr key={certificate.id}>
                                                <td
                                                    style={{
                                                        width: "70px",
                                                        maxWidth: "150px",
                                                        overflow: "hidden",
                                                        whiteSpace: "nowrap",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {certificate.id}
                                                </td>
                                                <td>{certificate.studentName}</td>
                                                <td>{certificate.university}</td>
                                                <td>{certificate.major}</td>
                                                <td>
                                                    {certificate.issueDate
                                                        ? isNaN(Number(certificate.issueDate))
                                                            ? new Date(certificate.issueDate).toLocaleDateString("vi-VN")
                                                            : new Date(Number(certificate.issueDate) * 1000).toLocaleDateString("vi-VN")
                                                        : "N/A"}
                                                </td>
                                                <td>{certificate.grade}</td>
                                                <td>
                                                    {certificate.score && !isNaN(Number(certificate.score))
                                                        ? Number(certificate.score).toFixed(2)
                                                        : "N/A"}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`badge bg-${statusConfig[certificate.status].color}`}
                                                    >
                                                        {statusConfig[certificate.status].label}
                                                    </span>
                                                </td>
                                                <td className="text-center align-middle">
                                                    <Button
                                                        variant="info"
                                                        size="sm"
                                                        onClick={() => handleShowDetails(certificate)}
                                                    >
                                                        Chi Tiết
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="text-center" colSpan={8}>
                                                ❌ Không có bằng cấp nào trong danh sách
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </Table>
                        ) : (
                            <div>Không có bằng cấp nào.</div>
                        )}

                    </Col>


                </Row>

                {/* Modal Chi Tiết Bằng Cấp */}
                <BootstrapModal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Chi Tiết Bằng Cấp</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        {currentDegree && (
                            <Row>
                                <Col md={6}>
                                    <p><strong>Id NFT:</strong> {currentDegree.id}</p>
                                    <p><strong>Tên Sinh Viên:</strong> {currentDegree.studentName}</p>
                                    <p><strong>Ngày Sinh:</strong> {currentDegree.dateOfBirth}</p>
                                    <p><strong>Trường:</strong> {currentDegree.university}</p>

                                </Col>
                                <Col md={6}>
                                    <p><strong>Xếp Loại:</strong> {currentDegree.grade}</p>
                                    <p><strong>Điểm:</strong> {formatScore(currentDegree.score)}</p>
                                    <p><strong>Ngày Cấp:</strong>
                                        {currentDegree.issueDate
                                            ? isNaN(Number(currentDegree.issueDate))
                                                ? new Date(currentDegree.issueDate).toLocaleDateString("vi-VN")
                                                : new Date(Number(currentDegree.issueDate) * 1000).toLocaleDateString("vi-VN")
                                            : "N/A"}
                                    </p>
                                    <p><strong>Trạng Thái:</strong> {renderStatusBadge(currentDegree.status)}</p>

                                </Col>
                                <p><strong>Chuyên Ngành:</strong> {currentDegree.major}</p>
                                <p><strong>IPFSHASH:</strong> {currentDegree.ipfsHash}</p>
                                <p><strong>NFT chủ sở hữu:</strong> <a href={link} target="_blank" rel="noopener noreferrer">{link}</a></p>

                            </Row>

                        )}
                    </BootstrapModal.Body>
                </BootstrapModal>

            </Container>
        </div>
    );
};
const adminStyle = {
    page: {
        backgroundColor: '#f7f9fc',
        minHeight: '100vh',
    },
    content: {
        marginTop: '20px',
    },
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

export default ManageDegreesPage;