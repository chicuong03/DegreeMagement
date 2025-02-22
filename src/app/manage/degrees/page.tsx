"use client";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { Modal as BootstrapModal, Button, Col, Container, Row, Table } from "react-bootstrap";
import { toast } from "react-toastify";

type DegreeStatus = "Pending" | "Approved" | "Rejected";

interface Degree {
    id: string;
    degreeId: string;
    studentName: string;
    university: string;
    dateOfBirth: string;
    graduationDate: string;
    grade: string;
    score: number;
    issueDate: string;
    ipfsHash: string;
    status: DegreeStatus;
}

const ManageDegreesPage = () => {
    const [degrees, setDegrees] = useState<Degree[]>([]);
    const [currentDegree, setCurrentDegree] = useState<Degree | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddDegreeModal, setShowAddDegreeModal] = useState(false);
    const [universities, setUniversities] = useState<{ id: number, name: string }[]>([]);
    const [activeTab, setActiveTab] = useState<DegreeStatus>("Pending");

    const filteredDegrees = degrees.filter(degree => degree.status === activeTab);



    /** 🔹 Lấy danh sách trường đại học */
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

    const handleShowDetails = (degree: Degree) => {
        setCurrentDegree(degree);
        setShowDetailModal(true); // Hiển thị modal chi tiết
    };

    /** 🔹 Lấy danh sách bằng cấp từ Blockchain */
    const fetchDegreesFromBlockchain = async () => {
        if (!window.ethereum) return;
        setIsLoading(true);

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getContract(provider);
            const totalDegrees = await contract.totalDegrees(); // Lấy tổng số bằng

            if (totalDegrees.toNumber() === 0) {
                toast.warn("Không có bằng cấp nào được tìm thấy!");
                setIsLoading(false);
                return;
            }

            const degrees: Degree[] = await Promise.all(
                Array.from({ length: totalDegrees.toNumber() }, async (_, i) => {
                    const degreeId = (i + 1).toString(); // ID bắt đầu từ 1 (chuyển thành string)
                    const degree = await contract.getDegree(degreeId);

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
                        status:
                            degree.status === 0 ? "Pending" :
                                degree.status === 1 ? "Approved" : "Rejected" // Đảm bảo rằng status là DegreeStatus
                    };
                })
            );

            console.log("📌 Danh sách bằng cấp sau khi format:", degrees);
            setDegrees(degrees); // ✅ Lưu danh sách bằng cấp vào state
        } catch (error) {
            console.error("❌ Lỗi khi lấy dữ liệu từ blockchain:", error);
            toast.error("Không thể tải dữ liệu từ blockchain!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUniversities();
        fetchDegreesFromBlockchain();
    }, []);

    /**  Cấp bằng mới */
    // const handleAddDegree = async (event: React.FormEvent<HTMLFormElement>) => {
    //     event.preventDefault();
    //     if (!window.ethereum) {
    //         toast.error("Bạn cần kết nối MetaMask!");
    //         return;
    //     }

    //     const formData = new FormData(event.currentTarget);
    //     const studentName = formData.get("studentName") as string;
    //     const university = formData.get("university") as string;
    //     const dateOfBirth = Date.parse(formData.get("dob") as string) / 1000;
    //     const grade = formData.get("grade") as string;
    //     const score = Number(formData.get("score") as string);
    //     const ipfsHash = "QmT5NvUtoM5n4cJcGz5w5bmr7r5U2nL2M1g8Z7D8A1A9H5";

    //     try {
    //         const provider = new ethers.providers.Web3Provider(window.ethereum);
    //         const signer = provider.getSigner();
    //         const contract = getContract(provider).connect(signer);

    //         const tx = await contract.issueDegree(studentName, university, dateOfBirth, dateOfBirth, grade, score, ipfsHash);
    //         await tx.wait();

    //         toast.success("Cấp bằng thành công!");
    //         fetchDegreesFromBlockchain();
    //         setShowAddDegreeModal(false);
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Cấp bằng thất bại!");
    //     }
    // };

    const link = `https://testnet.coinex.net/token/0x73ED44E52D0CCC06Fa15284db8da1f08527D1E1E?a=${currentDegree?.id}`;



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
                            </ul>
                        </div>
                    </Col>

                    <Col md={9}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>Quản Lý Bằng Cấp</h3>
                            <div>
                                {/* <Button
                                    variant="success"
                                    className="me-2"
                                    onClick={() => setShowAddDegreeModal(true)}
                                >
                                    Thêm Bằng Cấp
                                </Button> */}
                                <div className="btn-group">
                                    <Button
                                        variant={activeTab === 'Pending' ? 'primary' : 'outline-primary'}
                                        onClick={() => setActiveTab('Pending')}
                                    >
                                        Chờ Duyệt
                                    </Button>
                                    <Button
                                        variant={activeTab === 'Approved' ? 'primary' : 'outline-primary'}
                                        onClick={() => setActiveTab('Approved')}
                                    >
                                        Đã Duyệt
                                    </Button>
                                    <Button
                                        variant={activeTab === 'Rejected' ? 'primary' : 'outline-primary'}
                                        onClick={() => setActiveTab('Rejected')}
                                    >
                                        Từ Chối
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div>Đang tải danh sách bằng cấp...</div>
                        ) : filteredDegrees.length > 0 ? (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Mã Bằng Cấp</th>
                                        <th>Tên Sinh Viên</th>
                                        <th>Trường</th>
                                        <th>Ngày Cấp</th>
                                        <th>Xếp Loại</th>
                                        <th>Điểm</th>
                                        <th>Trạng Thái</th>
                                        <th>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDegrees.length > 0 ? (
                                        filteredDegrees.map((degree) => (
                                            <tr key={degree.degreeId}>
                                                <td
                                                    style={{
                                                        width: "50px",
                                                        maxWidth: "150px",
                                                        overflow: "hidden",
                                                        whiteSpace: "nowrap",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {degree.degreeId}
                                                </td>
                                                <td>{degree.studentName}</td>
                                                <td>{degree.university}</td>
                                                <td>{degree.issueDate}</td>
                                                <td>{degree.grade}</td>
                                                <td>{degree.score.toFixed(2)}</td>
                                                <td>
                                                    <span
                                                        className={`badge bg-${statusConfig[degree.status].color}`}
                                                    >
                                                        {statusConfig[degree.status].label}
                                                    </span>
                                                </td>
                                                <td className="text-center align-middle">
                                                    <Button
                                                        variant="info"
                                                        size="sm"
                                                        onClick={() => handleShowDetails(degree)}
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

                {/* Modal Thêm Bằng Cấp */}
                {/* <BootstrapModal show={showAddDegreeModal} onHide={() => setShowAddDegreeModal(false)} size="lg">
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Thêm Bằng Cấp Mới</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        <Form onSubmit={handleAddDegree}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tên Sinh Viên</Form.Label>
                                        <Form.Control name="studentName" required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ngày Sinh</Form.Label>
                                        <Form.Control type="date" name="dob" required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Trường</Form.Label>
                                        <Form.Select name="university" required>
                                            <option value="">Chọn Trường</option>
                                            {universities.map((uni) => (
                                                <option key={uni.id} value={uni.name}>
                                                    {uni.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Xếp Loại</Form.Label>
                                        <Form.Select name="grade" required>
                                            <option value="">Chọn Xếp Loại</option>
                                            <option value="Xuất sắc">Xuất sắc</option>
                                            <option value="Giỏi">Giỏi</option>
                                            <option value="Khá">Khá</option>
                                            <option value="Trung bình">Trung bình</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Điểm</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="score"
                                            step="0.1"
                                            min="0"
                                            max="10"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ngày Cấp</Form.Label>
                                        <Form.Control type="date" name="issueDate" required />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Button variant="primary" type="submit">Thêm Bằng Cấp</Button>
                        </Form>
                    </BootstrapModal.Body>
                </BootstrapModal> */}

                {/* Modal Chi Tiết Bằng Cấp */}
                <BootstrapModal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Chi Tiết Bằng Cấp</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        {currentDegree && (
                            <Row>
                                <Col md={6}>
                                    <p><strong>Id:</strong> {currentDegree.id}</p>
                                    <p><strong>Tên Sinh Viên:</strong> {currentDegree.studentName}</p>
                                    <p><strong>Ngày Sinh:</strong> {currentDegree.dateOfBirth}</p>
                                    <p><strong>Trường:</strong> {currentDegree.university}</p>

                                </Col>
                                <Col md={6}>
                                    <p><strong>Xếp Loại:</strong> {currentDegree.grade}</p>
                                    <p><strong>Điểm:</strong> {formatScore(currentDegree.score)}</p>
                                    <p><strong>Ngày Cấp:</strong> {currentDegree.issueDate}</p>
                                    <p><strong>Trạng Thái:</strong> {renderStatusBadge(currentDegree.status)}</p>

                                </Col>
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