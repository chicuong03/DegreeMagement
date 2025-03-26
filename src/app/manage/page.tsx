'use client';
import bcrypt from 'bcryptjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';


interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    password?: string;
}


const AdminPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    //  Lấy danh sách user khi component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Lấy danh sách User từ API
    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Không thể lấy danh sách người dùng');

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Lỗi:', error);
            toast.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý thêm người dùng
    const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const plainPassword = formData.get('password') as string;
        if (plainPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        // Hash mật khẩu trước khi gửi lên server
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const newUser = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            password: hashedPassword,
            role: formData.get('role') as string,
        };

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || 'Thêm người dùng thất bại');
                return;
            }

            fetchUsers();
            toast.success('Thêm thành công');
        } catch (error) {
            console.error('Lỗi:', error);
            toast.error('Có lỗi xảy ra khi thêm người dùng');
        }
    };

    // Mở modal chỉnh sửa user
    const handleEditClick = (user: User) => {
        setCurrentUser(user);
        setShowEditModal(true);
    };

    // Cập nhật thông tin user
    const handleEditUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!currentUser) return;

        const formData = new FormData(event.currentTarget);
        const updatedUser = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            role: formData.get("role") as string,
            password: formData.get("password") ? formData.get("password") as string : undefined,
        };

        try {
            const response = await fetch(`/api/users/${currentUser._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Cập nhật người dùng thất bại");
            }

            fetchUsers();
            toast.success("Cập nhật thành công!");
            setShowEditModal(false);
        } catch (error) {
            console.error("Lỗi:", error);
            toast.error("Có lỗi xảy ra khi cập nhật");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Xóa người dùng thất bại');
            }

            setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
            toast.success('Xóa thành công');
        } catch (error) {
            console.error('Lỗi:', error);
            toast.error('Có lỗi xảy ra khi xóa');
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
                        <h3>Users</h3>
                        <Row className="mb-3 align-items-end">
                            <Col md={9}>
                                <Form.Group controlId="formSearch">
                                    <Form.Label>Tìm kiếm</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Tìm kiếm theo tên, email, ID"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="formRoleFilter">
                                    <Form.Label>Lọc theo vai trò</Form.Label>
                                    <Form.Select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                        <option value="">Tất cả vai trò</option>
                                        <option value="admin">Quản trị</option>
                                        <option value="university">Trường Học</option>
                                        <option value="student">Học viên</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div style={{
                            maxHeight: '500px',
                            overflowY: 'auto', // Cho phép cuộn theo trục Y
                        }}>
                            {loading ? (
                                <div>Loading...</div>
                            ) : (
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Full Name</th>
                                            <th>Username</th>
                                            <th>Role</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users
                                            .filter(user =>
                                                (!selectedRole || user.role === selectedRole) &&
                                                (
                                                    !searchTerm ||
                                                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    user._id.toLowerCase().includes(searchTerm.toLowerCase())
                                                )
                                            )
                                            .sort((a, b) => b._id.localeCompare(a._id))
                                            .map((user) => (
                                                <tr key={user._id}>
                                                    <td>{user._id}</td>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.role}</td>
                                                    <td className='text-center align-middle'>
                                                        <Button
                                                            variant="warning"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => handleEditClick(user)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user._id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>
                            )}
                        </div>
                        <h3>Thêm Người Dùng</h3>
                        <Form onSubmit={handleAddUser}>
                            <Row>
                                <Col md={3}>
                                    <Form.Group controlId="formName">
                                        <Form.Label>Tên</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Nhập tên"
                                            name="name"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="formEmail">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Nhập email"
                                            name="email"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="formPassword">
                                        <Form.Label>Mật khẩu</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Nhập mật khẩu"
                                            name="password"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group controlId="formRole">
                                        <Form.Label>Vai trò</Form.Label>
                                        <Form.Select name="role" required>
                                            <option value="">Chọn vai trò</option>
                                            <option value="admin">Quản trị</option>
                                            <option value="university">Trường Học</option>
                                            <option value="student">Học viên</option>
                                            <option value="recruiter">Nhà tuyển dụng</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Button variant="primary" type="submit" className="mt-3">
                                Thêm Người Dùng
                            </Button>
                        </Form>
                    </Col>
                </Row>

                {/* Modal chỉnh sửa người dùng */}
                <Modal backdrop="static" keyboard={false} show={showEditModal} size='lg' onHide={() => setShowEditModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Chỉnh Sửa Người Dùng</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleEditUser}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group controlId="formEditName">
                                        <Form.Label>Tên</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Nhập tên"
                                            name="name"
                                            defaultValue={currentUser?.name}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="formEditEmail">
                                        <Form.Label>User name</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Nhập email"
                                            name="email"
                                            defaultValue={currentUser?.email}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Col md={6}>
                                    <Form.Group controlId="formEditPassword">
                                        <Form.Label>Mật khẩu (để trống nếu không thay đổi)</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Nhập mật khẩu mới"
                                            name="password"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="formEditRole">
                                        <Form.Label>Vai trò</Form.Label>
                                        <Form.Select
                                            name="role"
                                            defaultValue={currentUser?.role}
                                            required
                                        >
                                            <option value="admin">Quản trị</option>
                                            <option value="student">Học viên</option>
                                            <option value="university">Trường Đại Học</option>
                                            <option value="recruiter">Nhà tuyển dụng</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="text-center">
                                <Button variant="primary" type="submit" className="mt-3">
                                    Cập Nhật Người Dùng
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </div>
    );

};

const adminStyle = {
    page: {
        backgroundColor: '#f7f9fc',
        minHeight: '100vh',
    },
    header: {
        backgroundColor: '#4A90E2',
        color: '#fff',
        padding: '15px 0',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    title: {
        margin: 0,
        fontSize: '24px',
    },
    nav: {
        textAlign: 'right',
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

export default AdminPage;