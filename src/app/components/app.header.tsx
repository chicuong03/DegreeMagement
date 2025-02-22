'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function Header() {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    // Lấy userRole từ cookie khi component render
    useEffect(() => {
        const fetchUserRole = () => {
            const roleFromCookie = document.cookie
                .split('; ')
                .find((row) => row.startsWith('userRole='))
                ?.split('=')[1];

            setUserRole(roleFromCookie || null);
            setLoading(false);
        };

        fetchUserRole();
    }, []);

    // Kiểm tra nếu chưa đăng nhập khi truy cập các trang cần quyền
    const handleProtectedClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        if (!userRole) {
            e.preventDefault(); // Ngăn không cho điều hướng
            alert('Bạn cần đăng nhập để truy cập phần này!');
            router.push('/Auth'); // Nhảy về trang đăng nhập
        }
    };

    // Xóa cookie đăng nhập và đăng xuất
    const handleLogout = () => {
        document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        setUserRole(null);
        router.push('/Auth'); // Chuyển hướng về trang đăng nhập
    };

    return (
        <Navbar sticky="top" expand="lg" style={navbarStyle.container}>
            <Container>
                <Navbar.Brand>
                    <Link href="/" className="navbar-brand" style={navbarStyle.brand}>
                        <Image src="/next.svg" alt="EduChain Logo" width={50} height={50} className="me-2" />
                        Edu
                    </Link>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto" style={navbarStyle.nav}>
                        <Link href="/facebook" className="nav-link" style={navbarStyle.link}>Facebook</Link>

                        <Link href="/admin" className="nav-link" style={navbarStyle.link}
                            onClick={(e) => handleProtectedClick(e, '/admin')}>
                            Admin
                        </Link>

                        <Link href="/user" className="nav-link" style={navbarStyle.link}
                            onClick={(e) => handleProtectedClick(e, '/user')}>
                            User
                        </Link>

                        <Link href="/blogs" className="nav-link" style={navbarStyle.link}
                            onClick={(e) => handleProtectedClick(e, '/blogs')}>
                            Blogs
                        </Link>

                        <Link href="/verify" className="nav-link" style={navbarStyle.link}>
                            Tra Cứu
                        </Link>

                        {/* 🔹 Chỉ admin & đại học mới thấy nút "Cấp Bằng" */}
                        {(userRole === 'admin' || userRole === 'university') && (
                            <Link href="/createdegree" className="nav-link" style={navbarStyle.link}
                                onClick={(e) => handleProtectedClick(e, '/createdegree')}>
                                Cấp Bằng
                            </Link>
                        )}

                        {/* 🔹 Chỉ admin mới thấy trang Quản Trị */}
                        {userRole === 'admin' && (
                            <Link href="/manage" className="nav-link" style={navbarStyle.link}
                                onClick={(e) => handleProtectedClick(e, '/manage')}>
                                Quản trị
                            </Link>
                        )}
                    </Nav>

                    <div style={navbarStyle.buttonGroup}>
                        <Link href="/contact">
                            <Button variant="primary" style={navbarStyle.button}>Liên hệ chúng tôi</Button>
                        </Link>

                        {loading ? (
                            <span style={{ color: '#fff', marginLeft: '10px' }}>Đang tải...</span>
                        ) : userRole ? (
                            <Button onClick={handleLogout} style={{ backgroundColor: 'red', color: 'white' }}>
                                Đăng xuất
                            </Button>
                        ) : (
                            <Link href="/Auth" className="btn btn-success">Đăng nhập</Link>
                        )}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

// **CSS in JS**
const navbarStyle: { [key: string]: React.CSSProperties } = {
    container: {
        background: 'linear-gradient(90deg, #4A90E2, #50E3C2)',
        padding: '10px 0',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    brand: {
        fontWeight: 'bold',
        fontSize: '1.5rem',
        color: '#fff',
        textDecoration: 'none',
    },
    nav: {
        alignItems: 'center',
    },
    link: {
        color: '#fff',
        fontSize: '1rem',
        margin: '0 10px',
        textDecoration: 'none',
        transition: 'color 0.3s ease',
    },
    button: {
        backgroundColor: '#FFD700',
        border: 'none',
        fontWeight: 'bold',
        padding: '8px 15px',
    },
    buttonGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
};

export default Header;
