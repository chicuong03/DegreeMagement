"use client";
import { getContract } from '@/lib/contract';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Modal as BootstrapModal, Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';

interface University {
    _id?: string;
    name: string;
    email: string;
    walletAddress: string;
    address?: string;
    representative?: string;
    isAuthorized: boolean;
}

type Certificate = {
    id: number;
    studentName: string;
    university: string;
    dateOfBirth: number;
    graduationDate: number;
    score: number;
    grade: string;
    ipfsHash: string;
    issueDate: number;
    status: "pending" | "approved" | "rejected";
};



const ManageUniversitiesPage = () => {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [currentAccount, setCurrentAccount] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [currentUniversity, setCurrentUniversity] = useState<University | null>(null);

    const [showCertificatesModal, setShowCertificatesModal] = useState(false);
    const [showEditUniversityModal, setShowEditUniversityModal] = useState(false);
    const [showAddUniversityModal, setShowAddUniversityModal] = useState(false);
    const [showGrantPermissionModal, setShowGrantPermissionModal] = useState(false);
    const [showRevokePermissionModal, setShowRevokePermissionModal] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [certificates, setCertificates] = useState<Certificate[]>([]);


    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        representative: ""
    });

    const closeModals = () => {
        setShowCertificatesModal(false);
        setShowEditUniversityModal(false);
        setShowAddUniversityModal(false);
        setShowGrantPermissionModal(false);
        setShowRevokePermissionModal(false);
        setSelectedUniversity(null);
        setWalletAddress('');
        setFormData({
            name: "",
            email: "",
            address: "",
            representative: ""
        });
    };

    const handleShowEditModal = (university: University) => {
        setCurrentUniversity(university);
        setShowEditUniversityModal(true);
    };


    useEffect(() => {
        fetchUniversities();
    }, []);

    // Kết nối MetaMask
    const connectWallet = async () => {
        try {
            if (typeof window.ethereum === 'undefined') {
                toast.error('Vui lòng cài đặt MetaMask');
                return;
            }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
            setIsConnected(true);
            toast.success(`Đã kết nối: ${accounts[0]}`);
        } catch (error) {
            console.error('Lỗi kết nối:', error);
            toast.error('Không thể kết nối với MetaMask');
        }
    };

    // Lấy danh sách trường đại học
    const fetchUniversities = async () => {
        try {
            const response = await fetch('/api/universities');
            const data = await response.json();

            console.log("Dữ liệu trả về từ API:", data);

            if (!Array.isArray(data)) {
                throw new Error("API không trả về một mảng hợp lệ!");
            }

            setUniversities(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách trường:", error);
            toast.error("Không thể tải danh sách trường");
        }
    };


    // Cấp quyền cho trường trên Smart Contract
    const grantUniversityPermission = async (address: string, name: string) => {
        if (!isConnected) {
            toast.error("Vui lòng kết nối MetaMask trước");
            return;
        }

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);

            const signer = provider.getSigner(); // ấy signer từ tài khoản đã kết nối
            const contract = getContract(signer); //  Truyền signer vào contract

            toast.info("Đang xử lý giao dịch...");
            setLoading(true);

            const tx = await contract.authorizeUniversity(address, name);
            await tx.wait(); // chờ

            const response = await fetch("/api/universities", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address, isAuthorized: true }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "API call failed");
            }

            // Gọi lại API 
            await fetchUniversities();
            toast.success("Cấp quyền thành công!");
            setShowGrantPermissionModal(false);

        } catch (error: any) {
            console.error("Lỗi cấp quyền:", error);
            toast.error(`Lỗi: ${error.message || "Cấp quyền thất bại"}`);
        } finally {
            setLoading(false);
        }
    };

    // Thu hồi quyền trên Smart Contract
    const revokeUniversityPermission = async (wallet: string, name: string) => {
        if (!isConnected) {
            toast.error('Vui lòng kết nối MetaMask trước');
            return;
        }
        if (!wallet) {
            toast.error('Địa chỉ ví không được để trống');
            return;
        }

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = getContract(provider).connect(signer);

            toast.info(`Đang thu hồi quyền của ${name}...`);
            setLoading(true);

            const tx = await contract.revokeUniversity(wallet);
            await tx.wait();

            const response = await fetch("/api/universities", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ address: wallet, isAuthorized: false }),
            });

            if (response.ok) {
                setLoading(false);
                toast.success(`Thu hồi quyền thành công của: ${name}`);
                fetchUniversities();
            } else {
                const errorData = await response.json();
                toast.error(`Lỗi: ${errorData.message || 'Cập nhật thất bại'}`);
                setLoading(false);
            }
        } catch (error: any) {
            console.error('Lỗi thu hồi quyền:', error);
            toast.error(`Lỗi: ${error.message || 'Thu hồi quyền thất bại'}`);
            setLoading(false);
        }
    };

    // Thêm trường đại học
    const handleAddUniversity = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newUniversity = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            walletAddress: formData.get("walletAddress") as string,
            address: formData.get("address") as string,
            representative: formData.get("representative") as string,
        };

        try {
            const response = await fetch("/api/universities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUniversity),
            });

            if (!response.ok) throw new Error("Thêm trường thất bại");

            const addedUniversity = await response.json();
            setUniversities((prev) => [...prev, addedUniversity]);

            toast.success("Thêm trường thành công");
        } catch (error) {
            toast.error("Thêm trường thất bại!");
        }
    };

    const handleEditUniversity = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!currentUniversity) return;

        const formData = new FormData(event.currentTarget);
        const updatedUniversity = {
            id: currentUniversity._id,
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            address: formData.get("address") as string,
            representative: formData.get("representative") as string,
        };

        try {
            const response = await fetch("/api/universities", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUniversity),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Cập nhật trường thất bại");
            }

            const updatedData = await response.json();
            setUniversities((prev) =>
                prev.map((uni) => (uni._id === updatedData._id ? updatedData : uni))
            );

            setShowEditUniversityModal(false);
            toast.success("Cập nhật trường thành công!");
        } catch (error) {
            const errorMessage = (error as Error).message || "Có lỗi xảy ra!";
            console.error("Lỗi:", error);
            toast.error(errorMessage);
        }
    };


    // Xóa trường đại học
    const handleDeleteUniversity = async (universityId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa trường này không?")) return;

        try {
            const response = await fetch(`/api/universities?id=${universityId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Xóa trường thất bại");

            setUniversities((prev) => prev.filter((uni) => uni._id !== universityId));
            toast.success("Xóa trường thành công");
        } catch (error) {
            toast.error("Xóa thất bại!");
        }
    };

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
                            <h3>Quản Lý Trường</h3>
                            <div className="d-flex gap-2">
                                <Button
                                    variant={isConnected ? "primary" : "secondary"}
                                    onClick={connectWallet}
                                    className="d-flex align-items-center"
                                >
                                    {/* Icon bên trái thay đổi tùy theo trạng thái kết nối */}
                                    <i className={`fa-solid ${isConnected ? "fa-plug-circle-check" : "fa-plug"} me-2`}></i>

                                    {/* Text */}
                                    <span>{isConnected ? "Đã Kết Nối Ví" : "Kết Nối Ví"}</span>

                                    {/* Icon bên phải tùy chọn (nếu cần) */}
                                    <i className={`fa-solid ${isConnected ? "fa-circle-check" : "fa-circle-exclamation"} ms-2`}></i>
                                </Button>

                                <Button
                                    variant="success"
                                    onClick={() => setShowAddUniversityModal(true)}
                                >
                                    Thêm Trường
                                </Button>
                            </div>
                        </div>

                        {loading ? (
                            <div>Đang tải...</div>
                        ) : (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th className="text-center align-middle">Tên Trường</th>
                                        <th className="text-center align-middle">Email</th>
                                        <th className="text-center align-middle">Địa Chỉ</th>
                                        <th className="text-center align-middle">Người Đại Diện</th>
                                        <th className="text-center align-middle">Trạng Thái</th>
                                        <th className="text-center align-middle">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {universities.map((university) => (
                                        <tr key={university._id}>
                                            <td>{university.name}</td>
                                            <td>{university.email}</td>
                                            <td
                                                style={{
                                                    width: "50px",
                                                    maxWidth: "150px",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {university.address || "N/A"}
                                            </td>
                                            <td>{university.representative || "N/A"}</td>
                                            <td className="text-center align-middle">
                                                {university.isAuthorized ? (
                                                    <span className="text-success">Đã Cấp Quyền</span>
                                                ) : (
                                                    <span className="text-danger">Chưa Có Quyền</span>
                                                )}
                                            </td>
                                            <td className="text-center align-middle">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        className='text-white'
                                                        onClick={() => handleShowEditModal(university)}
                                                    >
                                                        <i className="fa-solid fa-pen-nib"></i>
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteUniversity(university._id!)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                        Xóa
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedUniversity(university);
                                                            setWalletAddress(university.address || '');
                                                            setShowGrantPermissionModal(true);
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-square-plus me-1"></i>
                                                        Cấp Quyền
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedUniversity(university);
                                                            setWalletAddress(university.address || '');
                                                            setShowRevokePermissionModal(true);
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-user-slash"></i>
                                                        Thu Hồi
                                                    </Button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Col>

                </Row>


                {/* Certificates Modal */}
                <BootstrapModal
                    show={showCertificatesModal}
                    onHide={() => setShowCertificatesModal(false)}
                    size="xl"
                >
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>
                            Danh Sách Bằng Cấp - {currentUniversity?.name}
                        </BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        {certificates.length > 0 ? (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Tên Sinh Viên</th>
                                        <th>Ngày Sinh</th>
                                        <th>Xếp Loại</th>
                                        <th>Điểm</th>
                                        <th>Ngày Cấp</th>
                                        <th>Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {certificates.map((cert) => (
                                        <tr key={cert.id}>
                                            <td>{cert.studentName}</td>
                                            <td>{new Date(cert.graduationDate * 1000).toLocaleDateString("vi-VN")}</td>
                                            <td>{cert.grade}</td>
                                            <td>{cert.score}</td>
                                            <td>{new Date(cert.issueDate * 1000).toLocaleDateString("vi-VN")}</td>
                                            <td>
                                                {cert.status === "pending" && "Đang Chờ"}
                                                {cert.status === "approved" && "Đã Duyệt"}
                                                {cert.status === "rejected" && "Từ Chối"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <div className="text-center text-muted">
                                Không có bằng cấp nào được tìm thấy
                            </div>
                        )}
                    </BootstrapModal.Body>
                </BootstrapModal>

                {/* Modal Thêm Trường */}
                <BootstrapModal show={showAddUniversityModal} onHide={closeModals} size="lg">
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Thêm Trường Mới</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        <Form onSubmit={handleAddUniversity}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tên Trường</Form.Label>
                                        <Form.Control name="name" required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" name="email" required />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Địa Chỉ</Form.Label>
                                        <Form.Control name="address" />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Người Đại Diện</Form.Label>
                                        <Form.Control name="representative" />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Button variant="primary" type="submit">Thêm Trường</Button>
                            <Button className='ms-2' variant="secondary" onClick={() => setShowAddUniversityModal(false)}>Đóng</Button>
                        </Form>
                    </BootstrapModal.Body>
                </BootstrapModal>

                {/* Modal Sửa Trường */}
                <BootstrapModal show={showEditUniversityModal} onHide={closeModals} size="lg">
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Chỉnh Sửa Thông Tin Trường</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        <Form onSubmit={handleEditUniversity}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tên Trường</Form.Label>
                                        <Form.Control
                                            name="name"
                                            required
                                            defaultValue={currentUniversity?.name || ''}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            required
                                            defaultValue={currentUniversity?.email || ''}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Địa Chỉ</Form.Label>
                                        <Form.Control
                                            name="address"
                                            defaultValue={currentUniversity?.address || ''}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Người Đại Diện</Form.Label>
                                        <Form.Control
                                            name="representative"
                                            defaultValue={currentUniversity?.representative || ''}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Button variant="primary" type="submit">Lưu Thay Đổi</Button>
                        </Form>
                    </BootstrapModal.Body>
                </BootstrapModal>


                <BootstrapModal
                    show={showCertificatesModal}
                    onHide={() => setShowCertificatesModal(false)}
                    size="xl"
                >
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>
                            Danh Sách Chứng Chỉ - {currentUniversity?.name}
                        </BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Tên Sinh Viên</th>
                                    <th>Ngày Sinh</th>
                                    <th>Xếp Loại</th>
                                    <th>Điểm</th>
                                    <th>Ngày Cấp</th>
                                    <th>Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certificates.map((cert) => (
                                    <tr key={cert.id}>
                                        <td>{cert.studentName}</td>
                                        <td>{cert.graduationDate}</td>
                                        <td>{cert.grade}</td>
                                        <td>{cert.score}</td>
                                        <td>{cert.issueDate}</td>
                                        <td>
                                            {cert.status === 'pending' && 'Đang Chờ'}
                                            {cert.status === 'approved' && 'Đã Duyệt'}
                                            {cert.status === 'rejected' && 'Từ Chối'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </BootstrapModal.Body>
                </BootstrapModal>

                {/*  Modal Cấp Quyền */}
                <BootstrapModal
                    show={showGrantPermissionModal}
                    onHide={() => {
                        setShowGrantPermissionModal(false);
                        setSelectedUniversity(null);
                        setWalletAddress('');
                    }}
                >
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Cấp Quyền Cho Trường</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>Tên trường</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={selectedUniversity?.name || ''}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group className="mt-3">
                                <Form.Label>Địa chỉ ví</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    placeholder="Nhập địa chỉ ví hoặc kết nối MetaMask"
                                // disabled={isConnected}
                                />
                                <Button variant="info" className="mt-2" onClick={connectWallet}>
                                    {isConnected ? `Ví đã kết nối: ${currentAccount}` : "Kết nối MetaMask"}
                                </Button>
                            </Form.Group>
                        </Form>
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                        <Button
                            variant="secondary"
                            className='me-2'
                            onClick={() => {
                                setShowGrantPermissionModal(false);
                                setSelectedUniversity(null);
                                setWalletAddress('');
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => grantUniversityPermission(walletAddress, selectedUniversity?.name || '')}
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Cấp quyền'}
                        </Button>

                    </BootstrapModal.Footer>
                </BootstrapModal>

                {/* Modal Thu Hồi Quyền */}
                <BootstrapModal
                    show={showRevokePermissionModal}
                    onHide={() => {
                        setShowRevokePermissionModal(false);
                        setSelectedUniversity(null);
                        setWalletAddress('');
                    }}
                >
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Thu Hồi Quyền Trường</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>Tên trường</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={selectedUniversity?.name || ''}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group className="mt-3">
                                <Form.Label>Địa chỉ ví</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    placeholder="Nhập địa chỉ ví hoặc kết nối MetaMask"
                                // disabled={isConnected}
                                />
                                <Button variant="info" className="mt-2" onClick={connectWallet}>
                                    {isConnected ? `Ví đã kết nối: ${currentAccount}` : "Kết nối MetaMask"}
                                </Button>
                            </Form.Group>
                        </Form>
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowRevokePermissionModal(false);
                                setSelectedUniversity(null);
                                setWalletAddress('');
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => revokeUniversityPermission(walletAddress, selectedUniversity?.name || '')}
                            disabled={loading || !walletAddress}
                        >
                            {loading ? 'Đang xử lý...' : 'Thu hồi quyền'}
                        </Button>
                    </BootstrapModal.Footer>
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

export default ManageUniversitiesPage;