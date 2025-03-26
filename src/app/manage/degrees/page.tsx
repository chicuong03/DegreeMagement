"use client";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { Modal as BootstrapModal, Button, Col, Container, Row, Table } from "react-bootstrap";
import { toast } from "react-toastify";

type DegreeStatus = "Pending" | "Approved" | "Rejected";


type Certificate = {
    nftId: string;
    studentName: string;
    university: string;
    dateOfBirth: string;
    graduationDate: string;
    score: number;
    grade: string;
    major: string;
    degreeNumber: string;
    metadataUri: string;
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
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [degreeTypes, setDegreeTypes] = useState<{ _id: string; degreetype_name: string; degreetype_note: string }[]>([]);
    const [form, setForm] = useState({
        degreetype_name: "",
        degreetype_note: "",
    });

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

    const handleShowDetails = (certificate: Certificate) => {
        setCurrentDegree(certificate);
        setShowDetailModal(true);
    };

    async function fetchCertificates() {
        try {
            setIsLoading(true);

            const response = await fetch("/api/degreemongoDB");
            const data = await response.json();

            console.log("API Data:", data);
            if (data.success && Array.isArray(data.degrees)) {
                setCertificates(data.degrees);
                console.log("Cập nhật state `certificates`:", data.degrees);
            } else {
                console.warn("API không trả về danh sách bằng cấp hợp lệ.");
            }
        } catch (error) {
            console.error("Lỗi khi tải bằng cấp:", error);
        } finally {
            setIsLoading(false);
        }
    }

    // useEffect(() => {

    //     fetchCertificates();
    // }, []);

    useEffect(() => {
        fetchUniversities();
        fetchDegreeTypes();
        fetchCertificates();
    }, []);

    // Lấy danh sách loại bằng cấp
    const fetchDegreeTypes = async () => {
        try {
            const res = await fetch("/api/degreetype");
            const data = await res.json();
            if (Array.isArray(data)) {
                setDegreeTypes(data);
            }
        } catch (err) {
            toast.error("Lỗi khi tải loại bằng cấp!");
        }
    };

    // Thêm loại bằng cấp mới
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingId
            ? `/api/degreetype/${editingId}`  // 👈 Khi cập nhật
            : `/api/degreetype`;              // 👈 Khi tạo mới

        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(editingId ? "Đã cập nhật loại bằng cấp!" : "Đã thêm loại bằng cấp!");
                fetchDegreeTypes();
                setForm({ degreetype_name: "", degreetype_note: "" });
                setShowForm(false);
                setIsEditing(false);
                setEditingId(null);
            } else {
                toast.error(data.message || "Lỗi xử lý!");
            }
        } catch (error) {
            toast.error("Lỗi kết nối máy chủ!");
        }
    };

    const handleEdit = (type: { _id: string; degreetype_name: string; degreetype_note: string }) => {
        setForm({
            degreetype_name: type.degreetype_name,
            degreetype_note: type.degreetype_note,
        });
        setEditingId(type._id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa loại bằng cấp này?")) return;

        try {
            const res = await fetch(`/api/degreetype/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Đã xóa thành công!");
                fetchDegreeTypes(); // cập nhật lại bảng
            } else {
                toast.error(data.message || "Xóa thất bại!");
            }
        } catch (error) {
            toast.error("Lỗi kết nối máy chủ!");
        }
    };


    const cancelEdit = () => {
        setIsEditing(false);
        setForm({ degreetype_name: "", degreetype_note: "" });
        setShowForm(false);
    };


    const link = `https://testnet.coinex.net/token/0x9227241afb4F160d2d6460dACB0151b60e25e55A?a=${currentDegree?.nftId}`;

    return (
        <div style={adminStyle.page}>
            <Container style={adminStyle.content}>
                <Row>
                    <Col md={2}>
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
                                        Reports & Statistics
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

                    <Col md={10}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>Quản Lý Bằng Cấp</h3>
                        </div>

                        {isLoading ? (
                            <div>Đang tải danh sách bằng cấp...</div>
                        ) : certificates.length > 0 ? (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th className="text-center align-middle">Số hiệu</th>
                                        <th className="text-center align-middle">Tên Sinh Viên</th>
                                        <th className="text-center align-middle">Trường</th>
                                        <th className="text-center align-middle">Ngành</th>
                                        <th className="text-center align-middle">Ngày Cấp</th>
                                        <th className="text-center align-middle">Xếp Loại</th>
                                        <th className="text-center align-middle">Điểm</th>
                                        <th className="text-center align-middle">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {certificates.map((certificate) => (
                                        <tr key={certificate.degreeNumber}>
                                            <td
                                                style={{
                                                    width: "70px",
                                                    maxWidth: "150px",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    textOverflow: "ellipsis",
                                                }}
                                                className="text-center align-middle"
                                            >
                                                {certificate.degreeNumber}
                                            </td>
                                            <td className="text-center align-middle">{certificate.studentName}</td>
                                            <td className="text-center align-middle">{certificate.university}</td>
                                            <td className="text-center align-middle">{certificate.major}</td>
                                            <td className="text-center align-middle">
                                                {certificate.graduationDate}
                                            </td>
                                            <td>{certificate.grade}</td>
                                            <td>
                                                {certificate.score && !isNaN(Number(certificate.score))
                                                    ? Number(certificate.score).toFixed(2)
                                                    : "N/A"}
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
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <div>Không có bằng cấp nào.</div>
                        )}
                        <hr className="my-4" />
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>Loại bằng cấp</h3>
                            <Button variant="primary" onClick={() => setShowForm(true)}>
                                ➕ Thêm Loại Bằng Cấp
                            </Button>
                        </div>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th className="text-center align-middle">#</th>
                                    <th className="text-center align-middle">Tên Loại Bằng Cấp</th>
                                    <th className="text-center align-middle">Ghi chú</th>
                                    <th className="text-center align-middle">Hành động</th>
                                </tr>

                            </thead>
                            <tbody>
                                {degreeTypes.length > 0 ? (
                                    degreeTypes.map((type, index) => (
                                        <tr key={type._id}>
                                            <td className="text-center align-middle">{index + 1}</td>
                                            <td className='text-center'>{type.degreetype_name}</td>
                                            <td className="text-center align-middle">{type.degreetype_note}</td>
                                            <td className="text-center align-middle">
                                                <Button
                                                    variant="warning"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEdit(type)}
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(type._id)}
                                                >
                                                    Xóa
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="text-center text-muted">Không có loại bằng cấp nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
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
                                    <p><strong>Số hiệu:</strong> {currentDegree.degreeNumber}</p>
                                    <p><strong>Tên Sinh Viên:</strong> {currentDegree.studentName}</p>
                                    <p><strong>Ngày Sinh:</strong> {currentDegree.dateOfBirth}</p>
                                    <p><strong>Trường:</strong> {currentDegree.university}</p>

                                </Col>
                                <Col md={6}>
                                    <p><strong>Xếp Loại:</strong> {currentDegree.grade}</p>
                                    <p><strong>Điểm:</strong> {formatScore(currentDegree.score)}</p>
                                    <p><strong>Ngày Cấp:</strong>
                                        {currentDegree.graduationDate}
                                    </p>

                                </Col>
                                <p><strong>Chuyên Ngành:</strong> {currentDegree.major}</p>
                                <p><strong>IPFSHASH:</strong> {currentDegree.metadataUri}</p>
                                <p><strong>NFT chủ sở hữu:</strong> <a href={link} target="_blank" rel="noopener noreferrer">{link}</a></p>

                            </Row>

                        )}
                    </BootstrapModal.Body>
                </BootstrapModal>

                {/* form thêm loại  */}
                {showForm && (
                    <div style={formStyles.container}>
                        <div style={formStyles.header}>
                            <h2 style={formStyles.title}>
                                {isEditing ? "Chỉnh sửa loại bằng cấp" : "Thêm loại bằng cấp"}
                            </h2>
                            <button
                                onClick={cancelEdit}
                                style={formStyles.closeButton}
                                onMouseOver={(e) => Object.assign(e.currentTarget.style, formStyles.closeButtonHover)}
                                onMouseOut={(e) => Object.assign(e.currentTarget.style, formStyles.closeButton)}
                                aria-label="Đóng"
                            >
                                ✖
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={formStyles.form}>
                            <div style={formStyles.formGroup}>
                                <label style={formStyles.label} htmlFor="degree-name">Tên loại bằng cấp</label>
                                <input
                                    id="degree-name"
                                    type="text"
                                    placeholder="VD: Bằng Cử nhân"
                                    value={form.degreetype_name}
                                    onChange={(e) => setForm({ ...form, degreetype_name: e.target.value })}
                                    required
                                    style={formStyles.input}
                                />
                            </div>

                            <div style={formStyles.formGroup}>
                                <label style={formStyles.label} htmlFor="degree-note">Ghi chú / Mô tả</label>
                                <textarea
                                    id="degree-note"
                                    placeholder="Ghi chú thêm (nếu có)..."
                                    value={form.degreetype_note}
                                    onChange={(e) => setForm({ ...form, degreetype_note: e.target.value })}
                                    style={formStyles.textarea}
                                ></textarea>
                            </div>

                            <div style={formStyles.buttonGroup}>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? "Cập nhật" : "Thêm mới"}
                                </button>
                                <button type="button" onClick={cancelEdit} className="btn btn-secondary ms-2">
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}



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
const formStyles = {
    container: {
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb'
    },
    header: {
        display: 'flex' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e5e7eb'
    },
    title: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1f2937',
        display: 'flex' as const,
        alignItems: 'center' as const,
        gap: '8px'
    },
    iconEdit: {
        color: '#6366f1'
    },
    iconNew: {
        color: '#10b981'
    },
    closeButton: {
        color: '#6b7280',
        padding: '6px',
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    closeButtonHover: {
        backgroundColor: '#f3f4f6',
        color: '#4b5563'
    },
    form: {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        gap: '20px'
    },
    formGroup: {
        marginBottom: '0'
    },
    label: {
        display: 'block' as const,
        fontSize: '14px',
        fontWeight: '500',
        color: '#4b5563',
        marginBottom: '8px'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s ease',
        fontSize: '15px',
        color: '#1f2937'
    },
    inputFocus: {
        borderColor: '#6366f1',
        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)'
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s ease',
        fontSize: '15px',
        color: '#1f2937',
        resize: 'vertical' as const,
        minHeight: '120px'
    },
    textareaFocus: {
        borderColor: '#6366f1',
        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)'
    },
    buttonGroup: {
        display: 'flex' as const,
        gap: '16px',
        paddingTop: '12px'
    },
    submitButton: {
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: '8px',
        backgroundColor: '#6366f1',
        color: '#ffffff',
        fontWeight: '500',
        padding: '10px 24px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        minWidth: '112px',
        border: 'none',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    submitButtonHover: {
        backgroundColor: '#4f46e5',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
    },
    cancelButton: {
        display: 'flex' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: '8px',
        backgroundColor: '#f3f4f6',
        color: '#4b5563',
        fontWeight: '500',
        padding: '10px 24px',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        border: 'none'
    },
    cancelButtonHover: {
        backgroundColor: '#e5e7eb'
    }
};
export default ManageDegreesPage;