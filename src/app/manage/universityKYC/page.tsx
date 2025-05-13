"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Modal, Row, Table } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
// Giao diện cho dữ liệu KYC của trường học
interface UniversityKYC {
    _id: string;
    name: string;
    registrationNumber: string;
    email: string;
    phone: string;
    address: string;
    representative: {
        name: string;
        position: string;
    };
    documents: {
        license: string;
        idCard: string;
    };
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: Date;
}
export default function UniversityKYCManagement() {
    // State 
    const [universities, setUniversities] = useState<UniversityKYC[]>([]);
    const [selectedUniversity, setSelectedUniversity] = useState<UniversityKYC | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Tải danh sách trường học chờ duyệt KYC
    const fetchPendingUniversities = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/universityKYC', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải danh sách trường học');
            }

            const data = await response.json();
            setUniversities(data.data);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKYCAction = async (id: string, action: 'approve' | 'reject') => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/universityKYC', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, action })
            });

            const result = await response.json();

            if (result.success) {
                toast.success(
                    action === 'approve'
                        ? 'Phê duyệt KYC thành công!'
                        : 'Đã từ chối yêu cầu KYC'
                );
                fetchPendingUniversities();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };

    // Mở modal 
    const openDetailsModal = (university: UniversityKYC) => {
        setSelectedUniversity(university);
        setShowModal(true);
    };

    // Tải dữ liệu khi component được render
    useEffect(() => {
        fetchPendingUniversities();
    }, []);

    return (
        <Container>
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
                    <Card className="mt-4">
                        <Card.Header>
                            <Card.Title>Quản Lý KYC Trường Học</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {isLoading ? (
                                <div className="text-center">Đang tải...</div>
                            ) : (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Tên Trường</th>
                                            <th>Mã Đăng Ký</th>
                                            <th>Email</th>
                                            <th>Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {universities.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center">
                                                    Không có yêu cầu KYC nào
                                                </td>
                                            </tr>
                                        ) : (
                                            universities.map((university) => (
                                                <tr key={university._id}>
                                                    <td>{university.name}</td>
                                                    <td>{university.registrationNumber}</td>
                                                    <td>{university.email}</td>
                                                    <td>
                                                        <div className="d-flex justify-content-between">
                                                            <Button
                                                                variant="info"
                                                                size="sm"
                                                                onClick={() => openDetailsModal(university)}
                                                            >
                                                                <i className="fa-solid fa-eye me-1"></i>
                                                                Chi Tiết
                                                            </Button>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => handleKYCAction(university._id, 'reject')}
                                                            >
                                                                <i className="fa-solid fa-ban me-1"></i>
                                                                Từ Chối
                                                            </Button>
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => handleKYCAction(university._id, 'approve')}
                                                            >
                                                                <i className="fa-solid fa-check me-1"></i>
                                                                Phê Duyệt
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>

                    </Card>
                </Col>
            </Row>
            {/* Modal chi tiết trường học */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Chi Tiết Trường Học</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUniversity ? (
                        <div>
                            <p><strong>Tên Trường:</strong> {selectedUniversity.name || 'Chưa cập nhật'}</p>
                            <p><strong>Mã Đăng Ký:</strong> {selectedUniversity.registrationNumber || 'Chưa cập nhật'}</p>
                            <p><strong>Email:</strong> {selectedUniversity.email || 'Chưa cập nhật'}</p>
                            <p><strong>Điện Thoại:</strong> {selectedUniversity.phone || 'Chưa cập nhật'}</p>
                            <p><strong>Địa Chỉ:</strong> {selectedUniversity.address || 'Chưa cập nhật'}</p>

                            <p>
                                <strong>Người Đại Diện:</strong>
                                {selectedUniversity.representative && typeof selectedUniversity.representative === 'object'
                                    ? `${selectedUniversity.representative.name} (${selectedUniversity.representative.position})`
                                    : 'Không có thông tin'}
                            </p>

                            <div>
                                <strong>Tài Liệu:</strong>
                                {selectedUniversity.documents ? (
                                    <div>
                                        {selectedUniversity.documents.license && (
                                            <div className="text-primary mb-2">
                                                Giấy Phép Đăng Ký: {selectedUniversity.documents.license}
                                            </div>
                                        )}
                                        {selectedUniversity.documents.idCard && (
                                            <div className="text-primary">
                                                CMND/CCCD: {selectedUniversity.documents.idCard}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-muted">Không có tài liệu</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-muted">Không có thông tin trường học</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer />
        </Container>
    );
}
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